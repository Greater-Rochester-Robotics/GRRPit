export interface NexusMatch {
    label: string;
    status: `Queuing soon` | `Now queuing` | `On deck` | `On field`;
    redTeams: NexusMatchTeams;
    blueTeams: NexusMatchTeams;
    times: {
        scheduledStartTime: number | null;
        estimatedQueueTime: number | null;
        estimatedOnDeckTime: number | null;
        estimatedOnFieldTime: number | null;
        estimatedStartTime: number | null;
        actualQueueTime: number | null;
        actualOnDeckTime: number | null;
        actualOnFieldTime: number | null;
    };
    breakAfter: `Break` | `Lunch` | `End of day` | `Alliance selection` | `Awards break` | null;
    replayOf: string | null;
}

export type NexusMatchTeams = Array<string | null> | null;

export interface NexusAnnouncement {
    id: string;
    announcement: string;
    postedTime: number;
}

export interface NexusPartsRequest {
    id: string;
    parts: string;
    requestedByTeam: string;
    postedTime: number;
}

export interface NexusEventStatus {
    eventKey: string;
    dataAsOfTime: number;
    nowQueuing: string | null;
    matches: NexusMatch[];
    announcements: NexusAnnouncement[];
    partsRequests: NexusPartsRequest[];
}

/**
 * Interface for interacting with the Nexus API.
 */
export class Nexus {
    private readonly eventKey: string;
    private readonly apiKey: string;

    public constructor(eventKey: string, apiKey: string) {
        this.eventKey = eventKey;
        this.apiKey = apiKey;
    }

    /**
     * Returns the live status of the event.
     */
    public async liveEventStatus(): Promise<NexusEventStatus | null> {
        const url = new URL(`https://frc.nexus/api/v1/event/${this.eventKey}`);

        let status: NexusEventStatus | null = null;
        try {
            const res = await fetch(url, {
                headers: { "Nexus-Api-Key": this.apiKey },
            });

            if (!res.ok) {
                throw new Error(
                    `${res.status} ${res.statusText} - ${JSON.stringify(await res.json().catch(() => ``))}`,
                );
            }

            status = await res.json();
        } catch (error) {
            console.error(error);
            status = null;
        }

        return status;
    }
}
