import {
    FRCEvents,
    type MatchResult,
    type ScheduledMatch as FRCScheduledMatch,
    type TournamentLevel,
} from "./apis/FRCEvents";
import { Nexus } from "./apis/Nexus";
import { TBA, type MediaType } from "./apis/TBA";
import { EventPhase, type EventState, type ScheduledMatch, type UpNextTeam } from "./EventState";
import type { SettingsData } from "./Settings";

/**
 * Manages data obtained from third-party APIs.
 */
export class Conduit {
    private readonly team: number;
    private readonly useNexus: boolean;

    private readonly frcEvents: FRCEvents;
    private readonly nexus: Nexus;
    private readonly tba: TBA;

    private readonly imageCache: Map<number, string[]> = new Map();

    public constructor(settings: SettingsData) {
        this.team = settings.teamNumber;
        this.useNexus = settings.useNexus;

        // TODO
        this.frcEvents = new FRCEvents(
            settings.year,
            settings.eventCode.toUpperCase(),
            settings.frcEventsUsername,
            settings.frcEventsAuthKey,
        );
        this.nexus = new Nexus(`${settings.year}${settings.eventCode.toLowerCase()}`, settings.nexusAPIKey);
        this.tba = new TBA(settings.year, settings.tbaAuthKey);
    }

    /**
     * Returns the configured team number.
     */
    public getTeam(): number {
        return this.team;
    }

    /**
     * Generates an empty event state.
     */
    public emptyState(): EventState {
        return {
            now: this.getNow(),
            phase: EventPhase.PRACTICE,
            rankings: [],
            schedule: [],
            upNext: { label: `Break` },
        };
    }

    /**
     * Fetches the event's current state.
     * @param phase The event phase to poll.
     * @returns The event's state.
     */
    public async fetchState(phase: EventPhase): Promise<EventState> {
        if (!this.frcEvents || !this.nexus || !this.tba) {
            return this.emptyState();
        }

        const now = this.getNow();

        const tournamentLevel = this.serializePhase(phase);
        const schedule = await this.frcEvents.eventSchedule(tournamentLevel, this.team, null, null);
        const results =
            phase !== EventPhase.PRACTICE
                ? await this.frcEvents.eventMatchResults(tournamentLevel, this.team, null, null, null)
                : [];
        const scoreDetails =
            phase !== EventPhase.PRACTICE
                ? await this.frcEvents.scoreDetails(tournamentLevel, this.team, null, null, null)
                : [];

        const rankings = await this.frcEvents.eventRankings(16, null);
        if (!rankings.find((r) => r.teamNumber === this.team)) {
            const us = await this.frcEvents.eventRankings(null, this.team);
            if (us.length) rankings[rankings.length - 1] = us[0];
        }

        const nextMatch = await this.findNextMatch(now, schedule, results);

        return {
            now,
            phase,
            rankings: rankings.map((r) => ({
                rank: r.rank,
                teamNumber: r.teamNumber,
                wins: r.wins,
                losses: r.losses,
                ties: r.ties,
                rankingScore: r.sortOrder1,
            })),
            schedule: schedule
                .map((s) => {
                    const r = results.find((r) => r.matchNumber === s.matchNumber);
                    const d = scoreDetails.find((d) => d.matchNumber === s.matchNumber);
                    const usRed = s.teams.find((t) => t.teamNumber === this.team)?.station.startsWith(`Red`) ?? true;

                    return {
                        matchNumber: s.matchNumber,
                        startTime: new Date(r?.actualStartTime ?? s.startTime),
                        usRed,
                        playoffs: s.tournamentLevel === `Playoff`,
                        teams: s.teams.map((t) => ({
                            teamNumber: t.teamNumber,
                            red: t.station.startsWith(`Red`),
                        })),
                        result:
                            r && d
                                ? {
                                      winner:
                                          r.scoreRedFinal === r.scoreBlueFinal
                                              ? `Tie`
                                              : r.scoreRedFinal > r.scoreBlueFinal
                                                ? `Red`
                                                : `Blue`,
                                      scoreRed: r.scoreRedFinal,
                                      scoreBlue: r.scoreBlueFinal,
                                      awardedRp: d.alliances.find((a) => (a.alliance === `Red`) === usRed)?.rp ?? 0,
                                  }
                                : undefined,
                    } as ScheduledMatch;
                })
                .filter((m, i, a) => {
                    if (m.playoffs && m.matchNumber === 16) {
                        let f1 = a[i - 2];
                        let f2 = a[i - 1];
                        if (!f2.result) return false;
                        if (f1?.result?.winner === f2?.result?.winner) return false;
                    }

                    return true;
                }),
            upNext: nextMatch ?? { label: `Break` },
        };
    }

    /**
     * Finds the next match, attempting to use Nexus if
     * possible, falling back to the FRC Events API.
     * @param schedule The event schedule from the FRC Events API.
     * @param results Match results from the FRC Events API.
     * @returns The match if one is found, `null` otherwise.
     */
    private async findNextMatch(
        now: Date,
        schedule: FRCScheduledMatch[],
        results: MatchResult[],
    ): Promise<EventState[`upNext`] | null> {
        const eventStatus = this.useNexus
            ? (await this.nexus.liveEventStatus())?.matches.filter(
                  (m) => m.blueTeams?.includes(`${this.team}`) || m.redTeams?.includes(`${this.team}`),
              )
            : undefined;

        const matchStatus =
            eventStatus?.find((m) => m.status !== `On field` || (m.times.estimatedStartTime ?? 0) > now.getTime()) ??
            eventStatus?.at(-1);

        if (matchStatus) {
            // type "YES" to affirm this whole function looks terrible
            const teams = ([] as UpNextTeam[]).concat(
                matchStatus.redTeams
                    ?.filter((t) => t !== null)
                    .map((t) => ({ teamNumber: Number(t), red: true, images: [] })) ?? [],
                matchStatus.blueTeams
                    ?.filter((t) => t !== null)
                    .map((t) => ({ teamNumber: Number(t), red: false, images: [] })) ?? [],
            );

            await this.hydrateImages(teams);

            let estimate: number | null = null;
            let prefix: string;

            switch (matchStatus.status) {
                case `Queuing soon`:
                    estimate = matchStatus.times.estimatedQueueTime;
                    prefix = `Queuing in `;
                    break;
                case `Now queuing`:
                    estimate = matchStatus.times.estimatedOnDeckTime;
                    prefix = `On deck in`;
                    break;
                case `On deck`:
                    estimate = matchStatus.times.estimatedOnFieldTime;
                    prefix = `On field in`;
                    break;
                case `On field`:
                    estimate = matchStatus.times.estimatedStartTime;
                    prefix = `Starting in`;
                    break;
            }

            let status: string = matchStatus.status;
            if (estimate !== null) {
                const countdown = Math.max(0, (estimate - now.getTime()) / 1000 / 60).toFixed(0);
                status = prefix + ` ` + countdown + ` minute` + (countdown !== `1` ? `s` : ``);
            }

            return {
                label: matchStatus.label,
                match: {
                    status,
                    usRed: matchStatus.redTeams?.includes(`${this.team}`) ?? true,
                    teams,
                },
            };
        } else {
            const scheduleNext =
                schedule.find(
                    (s) => new Date(s.startTime) > now && !results.find((r) => r.matchNumber === s.matchNumber),
                ) ?? schedule.at(-1);

            if (!scheduleNext) return null;

            const countdown = Math.max(0, new Date(scheduleNext.startTime).getTime() - now.getTime());
            const resultsPosted = results.find((r) => r.matchNumber === scheduleNext.matchNumber) !== undefined;
            const teams = scheduleNext.teams.map((t) => ({
                teamNumber: t.teamNumber,
                red: t.station.startsWith(`Red`),
                images: [],
            }));

            await this.hydrateImages(teams);

            return {
                label: scheduleNext.description,
                match: {
                    status: resultsPosted
                        ? `Results Posted`
                        : countdown > 0
                          ? `Scheduled to start in ${(countdown / 1000 / 60).toFixed(0)}m`
                          : `In progress`,
                    usRed:
                        scheduleNext.teams.find((t) => t.teamNumber === this.team)?.station.startsWith(`Red`) ?? true,
                    teams,
                },
            };
        }
    }

    /**
     * Hydrates an array of teams scheduled for the
     * next match with their images in-place.
     * @param teams The array of teams to hydrate.
     */
    private async hydrateImages(teams: UpNextTeam[]): Promise<void> {
        const priority: (m: MediaType) => number = (m) => {
            const i = [`imgur`, `cdphotothread`, `instagram-image`].indexOf(m);
            return i < 0 ? 100 : i;
        };

        for (const team of teams) {
            const cached = this.imageCache.get(team.teamNumber);
            if (cached) {
                team.images = cached;
                continue;
            }

            team.images = (await this.tba.teamMedia(team.teamNumber))
                .sort((a, b) => priority(a.type) - priority(b.type))
                .map((m) =>
                    m.type === `instagram-image` ? `https://www.thebluealliance.com${m.direct_url}` : m.direct_url,
                )
                .filter((m) => typeof m === `string`);

            this.imageCache.set(team.teamNumber, team.images);
        }
    }

    /**
     * Utility function for getting the current
     * time, this can be changed during development
     * to shim mid-event UI logic.
     */
    private getNow(): Date {
        return new Date();
    }

    /**
     * Serializes an {@link EventPhase} to an FRC Events API {@link TournamentLevel}.
     * @param phase The phase to serialize.
     * @return The corresponding tournament level.
     */
    private serializePhase(phase: EventPhase): TournamentLevel {
        switch (phase) {
            case EventPhase.PRACTICE:
                return `Practice`;
            case EventPhase.QUALIFICATIONS:
                return `Qualification`;
            case EventPhase.PLAYOFFS:
                return `Playoff`;
        }
    }
}
