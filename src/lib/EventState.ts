/**
 * Represents the current phase of the event.
 */
export enum EventPhase {
    PRACTICE,
    QUALIFICATIONS,
    PLAYOFFS,
}

/**
 * Represents the state of the event.
 */
export interface EventState {
    now: Date;
    phase: EventPhase;
    rankings: Array<{
        rank: number;
        teamNumber: number;
        wins: number;
        losses: number;
        ties: number;
        rankingScore: number;
    }>;
    schedule: ScheduledMatch[];
    upNext: {
        label: string;
        match?: {
            status: string;
            usRed: boolean;
            teams: UpNextTeam[];
        };
    };
}

export interface ScheduledMatch {
    matchNumber: number;
    startTime: Date;
    usRed: boolean;
    playoffs: boolean;
    teams: Array<{
        teamNumber: number;
        red: boolean;
    }>;
    result?: {
        winner: `Red` | `Blue` | `Tie`;
        scoreRed: number;
        scoreBlue: number;
        awardedRp: number;
    };
}

export interface UpNextTeam {
    teamNumber: number;
    red: boolean;
    images: string[];
}
