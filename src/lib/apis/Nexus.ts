export interface Match {
    label: string;
    status: `Queuing soon` | `Now queuing` | `On deck` | `On field`;
    redTeams: Array<string | null> | null;
    blueTeams: Array<string | null> | null;
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

export interface Announcement {
    id: string;
    announcement: string;
    postedTime: number;
}

export interface PartsRequest {
    id: string;
    parts: string;
    requestedByTeam: string;
    postedTime: number;
}

export interface EventStatus {
    eventKey: string;
    dataAsOfTime: number;
    nowQueuing: string | null;
    matches: Match[];
    announcements: Announcement[];
    partsRequests: PartsRequest[];
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
    public async liveEventStatus(): Promise<EventStatus | null> {
        const url = new URL(`https://frc.nexus/api/v1/event/${this.eventKey}`);

        let status: EventStatus | null = null;
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
