/**
 * Stringifies a {@link Date} into a human-readable format of HH:MM[am|pm].
 * @param date The date to stringify.
 * @returns A string representing the time.
 */
export function stringifyTime(date: Date): string {
    const hours = date.getHours() % 12;
    return `${hours === 0 ? 12 : hours}:${`${date.getMinutes()}`.padStart(2, `0`)}${date.getHours() >= 12 ? `pm` : `am`}`;
}

/**
 * Returns the full YouTube embed URL for the specified video ID.
 * @param videoId The video ID to get the URL of.
 * @returns The embed URL.
 */
export function ytEmbedURL(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&color=white&disablekb=1&loop=1&mute=1&playlist=${videoId}&playsinline=false&rel=0`;
}
