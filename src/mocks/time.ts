// Mock dates are relative to "now" so screens always read "Edited 2 hours ago", "9 days left"…

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const hoursAgo = (h: number) => new Date(Date.now() - h * HOUR).toISOString();
export const daysAgo = (d: number) => new Date(Date.now() - d * DAY).toISOString();
export const daysFromNow = (d: number) => new Date(Date.now() + d * DAY).toISOString();

/**
 * The admin mocks were written on this day. `at("2026-10-30T03:30:00Z")` keeps that date's distance from
 * it ("2 days before") but measured from today, so "going live", "ends in 2 days" and "past due" stay
 * true whenever the demo runs.
 */
const AUTHORED_AT = Date.parse("2026-11-01T12:00:00Z");
export const at = (iso: string) => new Date(Date.now() - (AUTHORED_AT - Date.parse(iso))).toISOString();
