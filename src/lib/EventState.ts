export type ImageMap = Map<number, string[]>;

export interface Match {
    number: number;
    redTeams: number[];
    blueTeams: number[];
}

/**
 * Represents the state of the event.
 */
export interface EventState {
    now: Date;
    phase: EventPhase;
    rankings: RankingData;
    schedule: ScheduleData;
    upNext: UpNextData;
    playoffs?: PlayoffData;
}

export enum EventPhase {
    PRACTICE,
    QUALIFICATIONS,
    PLAYOFFS,
}

export type RankingData = Ranking[];

export interface Ranking {
    rank: number;
    teamNumber: number;
    us: boolean;
    wins: number;
    losses: number;
    ties: number;
    rankingScore: number;
}

export type ScheduleData = ScheduledMatch[];

export interface ScheduledMatch extends Match {
    description: string;
    startTime: Date;
    usRed: boolean;
    result?: {
        winner: `Red` | `Blue` | `Tie`;
        usWin: boolean;
        scoreRed: number;
        scoreBlue: number;
        awardedRp?: number;
    };
}

export interface UpNextData {
    label: string;
    match?: UpNextMatch;
}

export interface UpNextMatch extends Match {
    status: string;
    images: ImageMap;
}

export interface PlayoffData {
    matches: PlayoffMatch[];
    alliances: PlayoffAlliance[];
}

export interface PlayoffMatch extends Match {
    name: string;
    usRed: boolean | null;
    redFill: string;
    blueFill: string;
}

export interface PlayoffAlliance {
    number: number;
    teams: number[];
    color: `#${string}`;
    us: boolean;
}
