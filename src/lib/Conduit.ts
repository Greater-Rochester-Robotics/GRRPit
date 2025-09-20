import { FRCEvents, type FRCTournamentLevel, type FRCScheduledMatch } from "./apis/FRCEvents";
import { Nexus, type NexusMatch, type NexusMatchTeams } from "./apis/Nexus";
import { TBA, type TBAMediaType } from "./apis/TBA";
import type { SettingsData } from "./Settings";
import {
    EventPhase,
    type EventState,
    type ImageMap,
    type PlayoffAlliance,
    type PlayoffAllianceColors,
    type PlayoffData,
    type RankingData,
    type ScheduleData,
    type UpNextData,
} from "./EventState";
import { FRCColors } from "./apis/FRCColors";

/**
 * Manages and formats data obtained from third-party APIs.
 */
export class Conduit {
    private static readonly imageCache: ImageMap = new Map();
    private static readonly colorCache: Map<number, PlayoffAllianceColors | null> = new Map();

    private readonly team: number;
    private readonly useNexus: boolean;

    private readonly frcEvents: FRCEvents;
    private readonly nexus: Nexus;
    private readonly tba: TBA;

    public constructor(settings: SettingsData) {
        this.team = settings.teamNumber;
        this.useNexus = settings.useNexus;

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
        const now = this.getNow();
        const tournamentLevel = this.serializePhase(phase);
        const scheduleFilter = phase !== EventPhase.PLAYOFFS ? this.team : null;

        const frcMatches = await this.frcEvents.eventSchedule(tournamentLevel, scheduleFilter);
        const nexusMatches =
            (this.useNexus ? (await this.nexus.liveEventStatus())?.matches : undefined)?.filter((m) =>
                this.nexusPhaseFilter(m, phase),
            ) ?? [];

        const schedule = await this.getScheduleData(tournamentLevel, frcMatches, nexusMatches);

        return {
            now,
            phase,
            rankings: phase !== EventPhase.PRACTICE ? await this.getRankingData() : [],
            schedule,
            upNext: (await this.getUpNextData(now, schedule, nexusMatches)) ?? { label: `Break` },
            playoffs: phase === EventPhase.PLAYOFFS ? await this.getPlayoffData(frcMatches, nexusMatches) : undefined,
        };
    }

    /**
     * Sets the selected primary color usage for a team in the shared color cache.
     * @param team The team the color belongs to.
     * @param eventState The event state to mutate.
     */
    public static toggleAllianceColor(team: number, eventState: EventState): void {
        const entry = Conduit.colorCache.get(team);
        if (entry) entry.usePrimary = !entry.usePrimary;

        const alliance = eventState.playoffs?.alliances.find((a) => a.colors.source === team);
        if (alliance) alliance.colors.usePrimary = entry?.usePrimary ?? !alliance.colors.usePrimary;
    }

    /**
     * Saves a successful image load to the cache,
     * prioritizing the loaded image for future attempts.
     * @param team The team the image belongs to.
     * @param imageIndex The index of the team's image array that loaded successfully.
     */
    public static indexSuccessfulLoad(team: number, imageIndex: number): void {
        const entry = Conduit.imageCache.get(team);
        if (entry) {
            const loaded = entry.splice(imageIndex, 1);
            if (loaded.length) entry.splice(0, 0, loaded[0]);
        }
    }

    /**
     * Retrieves event qualification rankings.
     * @returns Ranking data.
     */
    private async getRankingData(): Promise<RankingData> {
        const rankings: RankingData = [];

        const frcRankings = await this.frcEvents.eventRankings(16);
        if (frcRankings.length) {
            if (!frcRankings.find((r) => r.teamNumber === this.team)) {
                const us = await this.frcEvents.eventRankings(null, this.team);
                if (us.length) frcRankings[frcRankings.length - 1] = us[0];
            }

            rankings.push(
                ...frcRankings.map((r) => ({
                    rank: r.rank,
                    teamNumber: r.teamNumber,
                    us: r.teamNumber === this.team,
                    wins: r.wins,
                    losses: r.losses,
                    ties: r.ties,
                    rankingScore: r.sortOrder1,
                })),
            );
        }

        if (rankings.length < 16) {
            const teamListings = (await this.frcEvents.teamListings(true))?.teams;
            if (teamListings?.length) {
                rankings.push(
                    ...teamListings
                        .filter((t) => !rankings.some((r) => r.teamNumber === t.teamNumber))
                        .slice(0, 16 - rankings.length)
                        .map((t, i) => ({
                            rank: i + rankings.length + 1,
                            teamNumber: t.teamNumber,
                            us: t.teamNumber === this.team,
                            wins: 0,
                            losses: 0,
                            ties: 0,
                            rankingScore: 0,
                        })),
                );
            }
        }

        return rankings;
    }

    /**
     * Retrieves the event schedule.
     * @param tournamentLevel The tournament level to filter matches to.
     * @param frcMatches Raw FRC scheduled matches.
     * @returns Scheduled matches.
     */
    private async getScheduleData(
        tournamentLevel: FRCTournamentLevel,
        frcMatches: FRCScheduledMatch[],
        nexusMatches: NexusMatch[],
    ): Promise<ScheduleData> {
        const frcResults =
            tournamentLevel !== `Practice` ? await this.frcEvents.eventMatchResults(tournamentLevel, this.team) : [];
        const frcScoreDetails =
            tournamentLevel !== `Practice` ? await this.frcEvents.scoreDetails(tournamentLevel, this.team) : [];

        let schedule: ScheduleData = frcMatches
            .filter((m) => m.teams.some((t) => t.teamNumber === this.team))
            .sort((a, b) => a.matchNumber - b.matchNumber)
            .map((m) => {
                const r = frcResults.find((r) => r.matchNumber === m.matchNumber);
                const d = frcScoreDetails.find((d) => d.matchNumber === m.matchNumber);
                const usRed = m.teams.find((t) => t.teamNumber === this.team)?.station.startsWith(`Red`) ?? true;
                const nexusMatch = nexusMatches.find((n) => this.nexusMatchNumber(n) === m.matchNumber);

                return {
                    number: m.matchNumber,
                    description: m.description,
                    startTime: new Date(r?.actualStartTime ?? nexusMatch?.times?.estimatedStartTime ?? m.startTime),
                    usRed,
                    redTeams: m.teams.filter((t) => t.station.startsWith(`Red`)).map((t) => t.teamNumber),
                    blueTeams: m.teams.filter((t) => t.station.startsWith(`Blue`)).map((t) => t.teamNumber),
                    result:
                        r && d
                            ? {
                                  winner:
                                      r.scoreRedFinal === r.scoreBlueFinal
                                          ? `Tie`
                                          : r.scoreRedFinal > r.scoreBlueFinal
                                            ? `Red`
                                            : `Blue`,
                                  usWin: usRed
                                      ? r.scoreRedFinal > r.scoreBlueFinal
                                      : r.scoreRedFinal < r.scoreBlueFinal,
                                  scoreRed: r.scoreRedFinal,
                                  scoreBlue: r.scoreBlueFinal,
                                  awardedRp: d.alliances.find((a) => (a.alliance === `Red`) === usRed)?.rp,
                              }
                            : undefined,
                };
            });

        if (frcMatches.every((m) => m.tournamentLevel === `Playoff`)) {
            schedule = schedule.filter((m, i, a) => {
                if (m.number === 16) {
                    let f1 = a[i - 2];
                    let f2 = a[i - 1];
                    if (!f2.result) return false;
                    if (f1?.result?.winner === f2?.result?.winner) return false;
                }

                return true;
            });
        }

        return schedule;
    }

    /**
     * Finds the next match, attempting to use Nexus if
     * possible, falling back to the FRC Events API.
     * @param now The current time.
     * @param schedule The parsed event schedule.
     * @param nexusMatches Raw nexus matches.
     * @returns The match if one is found, `null` otherwise.
     */
    private async getUpNextData(
        now: Date,
        schedule: ScheduleData,
        nexusMatches: NexusMatch[],
    ): Promise<UpNextData | null> {
        const eventStatus = nexusMatches.filter(
            (m) => m.blueTeams?.includes(`${this.team}`) || m.redTeams?.includes(`${this.team}`),
        );

        const nexusMatch =
            eventStatus.find(
                (m) =>
                    (m.status !== `On field` || (m.times.estimatedStartTime ?? 0) > now.getTime()) &&
                    !schedule.some((s) => this.nexusMatchNumber(m) === s.number && s.result),
            ) ?? eventStatus.at(-1);

        if (nexusMatch) {
            const redTeams = this.nexusMapTeams(nexusMatch.redTeams);
            const blueTeams = this.nexusMapTeams(nexusMatch.blueTeams);

            return {
                label: nexusMatch.label,
                match: {
                    number: this.nexusMatchNumber(nexusMatch),
                    status: this.nexusMatchStatus(now, nexusMatch),
                    redTeams,
                    blueTeams,
                    images: await this.getImages(redTeams, blueTeams),
                    badge: nexusMatch.status !== `Queuing soon` ? nexusMatch.status : undefined,
                },
            };
        } else {
            const scheduleNext =
                schedule.find((s) => !s.result && now.getTime() - s.startTime.getTime() < 900_000) ?? schedule.at(-1);
            if (!scheduleNext) return null;

            const countdown = Math.max(0, new Date(scheduleNext.startTime).getTime() - now.getTime());

            return {
                label: scheduleNext.description,
                match: {
                    number: scheduleNext.number,
                    status: scheduleNext.result
                        ? `Results Posted`
                        : countdown > 0
                          ? `Scheduled to start in ${(countdown / 1000 / 60).toFixed(0)}m`
                          : `Scheduled to start now`,
                    redTeams: scheduleNext.redTeams,
                    blueTeams: scheduleNext.blueTeams,
                    images: await this.getImages(scheduleNext.redTeams, scheduleNext.blueTeams),
                },
            };
        }
    }

    /**
     * Retrieves data for playoffs.
     * @param frcMatches Raw FRC scheduled matches.
     * @param nexusMatches Raw nexus matches.
     * @returns Playoff data.
     */
    private async getPlayoffData(frcMatches: FRCScheduledMatch[], nexusMatches: NexusMatch[]): Promise<PlayoffData> {
        const alliances: PlayoffAlliance[] =
            (await this.frcEvents.allianceSelection())?.map((a) => {
                const teams = [a.captain, a.round1, a.round2].concat(
                    a.round3 !== null ? a.round3 : a.backup !== null ? a.backup : [],
                );

                return {
                    number: a.number,
                    teams,
                    colors: {
                        source: teams[0],
                        primary: `#9a989a`,
                        secondary: `#9a989a`,
                        usePrimary: true,
                    },
                    us: teams.includes(this.team),
                };
            }) ?? [];

        for (const alliance of alliances) {
            if (alliance.teams.length) {
                const captain = alliance.teams[0];
                if (captain >= 9970 && captain < 10000) continue;

                const cached = Conduit.colorCache.get(captain);
                if (cached !== undefined) {
                    if (cached !== null) alliance.colors = cached;
                    continue;
                }

                const colors = await FRCColors.colors(captain);
                if (colors === null) {
                    Conduit.colorCache.set(captain, null);
                    continue;
                }

                const parse = (hex: `#${string}`) =>
                    hex
                        .slice(1)
                        .match(/.{1,2}/g)
                        ?.reduce(
                            (p, c) => {
                                const v = parseInt(c, 16);
                                return {
                                    w: v > p.w ? v : p.w,
                                    t: p.t + v,
                                };
                            },
                            { w: 0, t: 0 },
                        ) ?? { w: 0, t: 0 };

                const p = parse(colors.primaryHex);
                const s = parse(colors.secondaryHex);
                const usePrimary = p.w > 40 ? p.t < 660 || p.t < s.t : p.w > s.w;

                alliance.colors = {
                    source: captain,
                    primary: colors.primaryHex,
                    secondary: colors.secondaryHex,
                    usePrimary,
                };

                Conduit.colorCache.set(captain, alliance.colors);
            }
        }

        return {
            alliances,
            matches: new Array(16).fill(null).map((_, i) => {
                const frcMatch = frcMatches.find((m) => m.matchNumber === i);
                const nexusMatch = nexusMatches.find((m) => this.nexusMatchNumber(m) === i);

                const map = (a: `Red` | `Blue`, nexus?: NexusMatchTeams): number[] => {
                    const frcTeams = frcMatch?.teams
                        .filter((t) => t.teamNumber !== null && t.station.startsWith(a))
                        .map((t) => t.teamNumber);

                    return [...new Set(this.nexusMapTeams(nexus ?? []).concat(frcTeams ?? []))];
                };

                const findAlliance = (teams: number[]): string | null => {
                    if (!teams.length) return null;
                    const number = alliances.find((a) => teams.every((t) => a.teams.includes(t)))?.number;
                    return number ? `A${number}` : null;
                };

                const redTeams = map(`Red`, nexusMatch?.redTeams);
                const blueTeams = map(`Blue`, nexusMatch?.blueTeams);

                const redAlliance = findAlliance(redTeams);
                const blueAlliance = findAlliance(blueTeams);

                return {
                    number: i,
                    redTeams,
                    blueTeams,
                    name: i > 13 ? `Final ${i - 13}` : `Match ${i}`,
                    usRed:
                        alliances
                            .find((a) => a.teams.includes(this.team))
                            ?.teams.reduce(
                                (p, c) => (redTeams.includes(c) ? true : blueTeams.includes(c) ? false : p),
                                null as boolean | null,
                            ) ?? null,
                    redFill: this.playoffFill(i, true),
                    blueFill: this.playoffFill(i, false),
                    header: redAlliance || blueAlliance ? `${redAlliance ?? `TBD`} vs ${blueAlliance ?? `TBD`}` : null,
                };
            }),
        };
    }

    /**
     * Fetches images for the specified array(s) of teams.
     * @param teams The array(s) of teams to fetch.
     * @return A `key: team` -> `value: image` map.
     */
    private async getImages(...teams: number[][]): Promise<ImageMap> {
        const priority: (m: TBAMediaType) => number = (m) => {
            const i = [`imgur`, `cdphotothread`, `instagram-image`].indexOf(m);
            return i < 0 ? 100 : i;
        };

        const map: ImageMap = new Map();
        for (const team of teams.flat()) {
            const cached = Conduit.imageCache.get(team);
            if (cached) {
                map.set(team, cached);
                continue;
            }

            const images = (await this.tba.teamMedia(team))
                .sort((a, b) => priority(a.type) - priority(b.type))
                .map((m) =>
                    m.type === `instagram-image` ? `https://www.thebluealliance.com${m.direct_url}` : m.direct_url,
                )
                .filter((m) => typeof m === `string`);

            images.push(`dozer.jpeg`);

            map.set(team, images);
            Conduit.imageCache.set(team, images);
        }

        return map;
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
     * Maps raw nexus team arrays to nice number arrays.
     * @param teams The raw nexus data.
     * @returns An array of team numbers.
     */
    private nexusMapTeams(teams: NexusMatchTeams): number[] {
        return teams?.filter((t) => t !== null).map((t) => Number(t)) ?? [];
    }

    /**
     * Parses a match number from a nexus match.
     * @param match The match to parse from.
     * @returns The match number.
     */
    private nexusMatchNumber(match: NexusMatch): number {
        if (match.label.startsWith(`Final `)) return Number(match.label.split(` `)[1]) + 13;
        return (
            match.label
                .split(` `)
                .map((s) => Number(s))
                .find((n) => !Number.isNaN(n)) ?? 0
        );
    }

    /**
     * Parses a match status from a nexus match.
     * @param now
     * @param match
     */
    private nexusMatchStatus(now: Date, match: NexusMatch): string {
        const minutes = (timestamp: number, future: boolean = true): string => {
            const diff = future ? timestamp - now.getTime() : now.getTime() - timestamp;
            const minutes = Math.max(1, diff / 1000 / 60).toFixed(0);
            return `${minutes} minute${minutes !== `1` ? `s` : ``}`;
        };

        let status: string = match.status;
        switch (match.status) {
            case `Queuing soon`:
                status = `Queuing in ${minutes(match.times.estimatedQueueTime ?? 0)}`;
                break;
            case `Now queuing`:
                status = `On deck in ${minutes(match.times.estimatedOnDeckTime ?? 0)}`;
                break;
            case `On deck`:
                status = `On field in ${minutes(match.times.estimatedOnFieldTime ?? 0)}`;
                break;
            case `On field`:
                status = `${minutes(match.times.actualOnFieldTime ?? 0, false)} ago`;
                break;
        }

        return status;
    }

    /**
     * Returns `true` if the specified nexus match is included in the current event phase.
     * @param match The nexus match.
     * @param phase The current event phase.
     * @return `true` if the match is in the current phase, `false` otherwise.
     */
    private nexusPhaseFilter(match: NexusMatch, phase: EventPhase): boolean {
        const p = match.label.startsWith(`Practice`);
        const q = match.label.startsWith(`Qual`);

        switch (phase) {
            case EventPhase.PRACTICE:
                return p;
            case EventPhase.QUALIFICATIONS:
                return q;
            case EventPhase.PLAYOFFS:
                return !p && !q;
        }
    }

    /**
     * Maps a playoff match's alliance filler.
     * @param matchNumber The match to get the filler from.
     * @param red `true` to get the red alliance filler, `false` to get the blue alliance filler.
     * @returns The filler for the specified match and alliance.
     */
    private playoffFill(matchNumber: number, red: boolean): string {
        switch (matchNumber) {
            case 1:
                return red ? `Alliance 1` : `Alliance 8`;
            case 2:
                return red ? `Alliance 4` : `Alliance 5`;
            case 3:
                return red ? `Alliance 2` : `Alliance 7`;
            case 4:
                return red ? `Alliance 3` : `Alliance 6`;
            case 5:
                return red ? `Loser of M1` : `Loser of M2`;
            case 6:
                return red ? `Loser of M3` : `Loser of M4`;
            case 7:
                return red ? `Winner of M1` : `Winner of M2`;
            case 8:
                return red ? `Winner of M3` : `Winner of M4`;
            case 9:
                return red ? `Loser of M7` : `Winner of M6`;
            case 10:
                return red ? `Loser of M8` : `Winner of M5`;
            case 11:
                return red ? `Winner of M7` : `Winner of M8`;
            case 12:
                return red ? `Winner of M10` : `Winner of M9`;
            case 13:
                return red ? `Loser of M11` : `Winner of M12`;
            case 14:
            case 15:
            case 16:
                return red ? `Winner of M11` : `Winner of M13`;
            default:
                return `Winner of M0`;
        }
    }

    /**
     * Serializes an {@link EventPhase} to an FRC Events API {@link FRCTournamentLevel}.
     * @param phase The phase to serialize.
     * @return The corresponding tournament level.
     */
    private serializePhase(phase: EventPhase): FRCTournamentLevel {
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
