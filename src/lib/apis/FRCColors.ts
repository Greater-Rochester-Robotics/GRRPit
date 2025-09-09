export interface FRCTeamColors {
    primaryHex: `#${string}`;
    secondaryHex: `#${string}`;
    verified: boolean;
}

/**
 * Interface for interacting with the FRC Colors API.
 */
export class FRCColors {
    private constructor() {}

    /**
     * Returns the link to an image of a team's avatar.
     * *Warning: this uses an internal API and may break in the future.*
     * @param teamNumber Team number of the team who's avatar is being requested.
     */
    public static avatar(teamNumber: number): string {
        return `https://api.frc-colors.com/internal/team/${teamNumber}/avatar.png`;
    }

    /**
     * Get the colors for a team by number.
     * @param teamNumber Team number of the team who's colors are being requested.
     */
    public static async colors(teamNumber: number): Promise<FRCTeamColors | null> {
        const url = new URL(`https://api.frc-colors.com/v1/team/${teamNumber}`);

        try {
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(
                    `${res.status} ${res.statusText} - ${JSON.stringify(await res.json().catch(() => ``))}`,
                );
            }

            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
