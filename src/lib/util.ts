/**
 * Stringifies a {@link Date} into a human-readable format of HH:MM[am|pm].
 * @param date The date to stringify.
 * @returns A string representing the time.
 */
export const stringifyTime = (date: Date): string =>
    `${date.getHours() % 12}:${`${date.getMinutes()}`.padStart(2, `0`)}${date.getHours() >= 12 ? `pm` : `am`}`;
