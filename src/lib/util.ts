/**
 * Stringifies a {@link Date} into a human-readable format of HH:MM[am|pm].
 * @param date The date to stringify.
 * @returns A string representing the time.
 */
export function stringifyTime(date: Date): string {
    const hours = date.getHours() % 12;
    return `${hours === 0 ? 12 : hours}:${`${date.getMinutes()}`.padStart(2, `0`)}${date.getHours() >= 12 ? `pm` : `am`}`;
}
