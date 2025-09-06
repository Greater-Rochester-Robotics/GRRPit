import { fetch } from "@tauri-apps/plugin-http";

export type TournamentLevel = `None` | `Practice` | `Qualification` | `Playoff`;

export interface Ranking {
    rank: number;
    teamNumber: number;
    sortOrder1: number;
    sortOrder2: number;
    sortOrder3: number;
    sortOrder4: number;
    sortOrder5: number;
    sortOrder6: number;
    wins: number;
    losses: number;
    ties: number;
    qualAverage: number;
    dq: number;
    matchesPlayed: number;
}

export interface ScheduledMatch {
    field: string;
    tournamentLevel: TournamentLevel;
    description: string;
    startTime: string;
    matchNumber: number;
    teams: Array<{
        teamNumber: number;
        station: `${`Red` | `Blue`}${number}`;
        surrogate: boolean;
    }>;
}

export interface MatchResult {
    actualStartTime: string;
    autoStartTime: string;
    tournamentLevel: TournamentLevel;
    postResultTime: string;
    description: string;
    matchNumber: number;
    isReplay: boolean;
    scoreRedFinal: number;
    scoreRedFoul: number;
    scoreRedAuto: number;
    scoreBlueFinal: number;
    scoreBlueFoul: number;
    scoreBlueAuto: number;
    teams: Array<{
        teamNumber: number;
        station: `${`Red` | `Blue`}${number}`;
        dq: boolean;
    }>;
}

export interface MatchScores {
    alliances: Array<{
        alliance: `Red` | `Blue`;
        rp: number;
    }>;
    matchLevel: TournamentLevel;
    matchNumber: number;
    winningAlliance: number;
}

/**
 * Interface for interacting with the FRC Events API.
 */
export class FRCEvents {
    private readonly season: number;
    private readonly event: string;
    private readonly authorization: string;

    public constructor(season: number, event: string, username: string, authorizationKey: string) {
        this.season = season;
        this.event = event;
        this.authorization = `Basic ${btoa(`${username}:${authorizationKey}`)}`;
    }

    /**
     * The rankings API returns team ranking detail from a particular event in a particular
     * season. Optionally, the `top` parameter can be added to the query string to request
     * a subset of the rankings based on the highest ranked teams at the time of the
     * request. Alternately, you can specify the `teamNumber` parameter to retrieve
     * the ranking on one specific team. You cannot specify both a top and teamNumber
     * in the same call.
     * @param top Optional number of requested top ranked teams to return in result.
     * @param teamNumber Optional team number of the team whose ranking is requested.
     */
    public async eventRankings(top: number | null, teamNumber: number | null): Promise<Ranking[]> {
        let rankings: Ranking[] = [];

        const url = new URL(`https://frc-api.firstinspires.org/v3.0/${this.season}/rankings/${this.event}`);

        if (typeof top === `number`) url.searchParams.set(`top`, `${top}`);
        if (typeof teamNumber === `number`) url.searchParams.set(`teamNumber`, `${teamNumber}`);

        try {
            const res = await fetch(url, {
                headers: { Authorization: this.authorization },
            });

            if (!res.ok) {
                throw new Error(
                    `${res.status} ${res.statusText} - ${JSON.stringify(await res.json().catch(() => ``))}`,
                );
            }

            rankings = (await res.json()).Rankings;
        } catch (error) {
            console.error(error);
            rankings = [];
        }

        return rankings;
    }

    /**
     * The schedule API returns the match schedule for the desired tournament level of a particular
     * event in a particular season. You must also specify a `tournamentLevel` from which to return
     * the results. Alternately, you can specify a `teamNumber` to filter the results to only those
     * in which a particular team is participating. There is no validation that the `teamNumber`
     * you request is actually competing at the event, if they are not, the response will be
     * empty. You can also specify the parameters together, but cannot make a request without
     * at least one of the two.
     * @param tournamentLevel Tournament level of desired match schedule.
     * @param teamNumber Optional team number to search for within the schedule.
     * @param start Optional start match number for subset of results to return (inclusive).
     * @param end Optional end match number for subset of results to return (inclusive).
     */
    public async eventSchedule(
        tournamentLevel: TournamentLevel,
        teamNumber: number | null,
        start: number | null,
        end: number | null,
    ): Promise<ScheduledMatch[]> {
        let schedule: ScheduledMatch[] = [];

        const url = new URL(`https://frc-api.firstinspires.org/v3.0/${this.season}/schedule/${this.event}`);
        url.searchParams.set(`tournamentLevel`, `${tournamentLevel}`);

        if (typeof teamNumber === `number`) url.searchParams.set(`teamNumber`, `${teamNumber}`);
        if (typeof start === `number`) url.searchParams.set(`start`, `${start}`);
        if (typeof end === `number`) url.searchParams.set(`end`, `${end}`);

        try {
            const res = await fetch(url, {
                headers: { Authorization: this.authorization },
            });

            if (!res.ok) {
                throw new Error(
                    `${res.status} ${res.statusText} - ${JSON.stringify(await res.json().catch(() => ``))}`,
                );
            }

            schedule = (await res.json()).Schedule;
        } catch (error) {
            console.error(error);
            schedule = [];
        }

        return schedule;
    }

    /**
     * The match results API returns the match results for all matches of a particular event in
     * a particular season. Match results are only available once a match has been played,
     * retrieving info about future matches requires the event schedule API. You cannot
     * receive data about a match that is in progress. If you specify the `matchNumber`,
     * start and/or end optional parameters, you must also specify a `tournamentLevel`.
     * If you specify the `teamNumber` parameter, you cannot specify a `matchNumber`
     * parameter. If you specify the `matchNumber`, you cannot define a `start` or `end`.
     * @param tournamentLevel Optional tournament level of desired match schedule.
     * @param teamNumber Optional team number to search for within the schedule.
     * @param matchNumber Optional specific single match number of result.
     * @param start Optional start match number for subset of results to return (inclusive).
     * @param end Optional end match number for subset of results to return (inclusive).
     */
    public async eventMatchResults(
        tournamentLevel: TournamentLevel | null,
        teamNumber: number | null,
        matchNumber: number | null,
        start: number | null,
        end: number | null,
    ): Promise<MatchResult[]> {
        let matches: MatchResult[] = [];

        const url = new URL(`https://frc-api.firstinspires.org/v3.0/${this.season}/matches/${this.event}`);
        if (typeof tournamentLevel === `string`) url.searchParams.set(`tournamentLevel`, `${tournamentLevel}`);
        if (typeof teamNumber === `number`) url.searchParams.set(`teamNumber`, `${teamNumber}`);
        if (typeof matchNumber === `number`) url.searchParams.set(`matchNumber`, `${matchNumber}`);
        if (typeof start === `number`) url.searchParams.set(`start`, `${start}`);
        if (typeof end === `number`) url.searchParams.set(`end`, `${end}`);

        try {
            const res = await fetch(url, {
                headers: { Authorization: this.authorization },
            });

            if (!res.ok) {
                throw new Error(
                    `${res.status} ${res.statusText} - ${JSON.stringify(await res.json().catch(() => ``))}`,
                );
            }

            matches = (await res.json()).Matches;
        } catch (error) {
            console.error(error);
            matches = [];
        }

        return matches;
    }

    public async scoreDetails(
        tournamentLevel: TournamentLevel,
        teamNumber: number | null,
        matchNumber: number | null,
        start: number | null,
        end: number | null,
    ): Promise<MatchScores[]> {
        let scores: MatchScores[] = [];

        const url = new URL(
            `https://frc-api.firstinspires.org/v3.0/${this.season}/scores/${this.event}/${tournamentLevel}`,
        );
        if (typeof teamNumber === `number`) url.searchParams.set(`teamNumber`, `${teamNumber}`);
        if (typeof matchNumber === `number`) url.searchParams.set(`matchNumber`, `${matchNumber}`);
        if (typeof start === `number`) url.searchParams.set(`start`, `${start}`);
        if (typeof end === `number`) url.searchParams.set(`end`, `${end}`);

        try {
            const res = await fetch(url, {
                headers: { Authorization: this.authorization },
            });

            if (!res.ok) {
                throw new Error(
                    `${res.status} ${res.statusText} - ${JSON.stringify(await res.json().catch(() => ``))}`,
                );
            }

            scores = (await res.json()).MatchScores;
        } catch (error) {
            console.error(error);
            scores = [];
        }

        return scores;
    }
}
