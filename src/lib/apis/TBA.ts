import { fetch } from "@tauri-apps/plugin-http";

export type MediaType =
    | `youtube`
    | `cdphotothread`
    | `imgur`
    | `facebook-profile`
    | `youtube-channel`
    | `twitter-profile`
    | `github-profile`
    | `instagram-profile`
    | `periscope-profile`
    | `gitlab-profile`
    | `grabcad`
    | `instagram-image`
    | `external-link`
    | `avatar`;

export interface Media {
    type: MediaType;
    foreign_key: string;
    details?: any;
    preferred?: boolean;
    team_keys: `frc${number}`[];
    direct_url?: string;
    view_url?: string;
}

export class TBA {
    private readonly season: number;
    private readonly authKey: string;

    /**
     * @param season The current competition year. Must be 4 digits.
     * @param authKey The TBA authentication key to use.
     */
    public constructor(season: number, authKey: string) {
        this.season = season;
        this.authKey = authKey;
    }

    /**
     * Returns the link to an image of a team's avatar.
     * @param season Competition season. Must be 4 digits.
     * @param teamNumber Team number of the team who's avatar is being requested.
     */
    public avatar(teamNumber: number): string {
        return `https://www.thebluealliance.com/avatar/${this.season}/frc${teamNumber}.png`;
    }

    /**
     * Gets a list of Media (videos / pictures) for the given team and year.
     * @param teamNumber Team number of the team who's media is being requested.
     */
    public async teamMedia(teamNumber: number): Promise<Media[]> {
        let media: Media[] = [];

        const url = new URL(`https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/media/${this.season}`);

        try {
            const res = await fetch(url, {
                headers: { "X-TBA-Auth-Key": this.authKey },
            });

            if (!res.ok) {
                throw new Error(
                    `${res.status} ${res.statusText} - ${JSON.stringify(await res.json().catch(() => `Unknown`))}`,
                );
            }

            media = await res.json();
        } catch (error) {
            console.error(error);
            media = [];
        }

        return media;
    }
}
