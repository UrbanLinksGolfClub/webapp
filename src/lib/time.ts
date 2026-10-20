// The club is a single physical facility in Fort Thomas, KY. Every date/time
// shown anywhere in the app -- to a member on their phone or rendered on the
// server -- should reflect the club's own local time, not whatever timezone
// happens to be running the code. Server rendering in particular runs on
// Netlify's Node runtime, which defaults to UTC, so any formatting call
// without an explicit timeZone silently shows UTC-shifted times to everyone.
export const CLUB_TIMEZONE = "America/New_York";

export function formatClubTime(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleTimeString(undefined, { ...opts, timeZone: CLUB_TIMEZONE });
}

export function formatClubDate(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleDateString(undefined, { ...opts, timeZone: CLUB_TIMEZONE });
}

export function formatClubDateTime(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleString(undefined, { ...opts, timeZone: CLUB_TIMEZONE });
}

/** Y-M-D calendar date string for `d`, evaluated in the club's timezone. */
export function clubDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CLUB_TIMEZONE }).format(d);
}

/** Add `days` to a Y-M-D date string as pure calendar arithmetic -- no
 * timezone/instant is involved, so this can't be thrown off by DST. */
export function addClubDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** The real UTC instant at which it becomes `hour:minute` on `dateKey` in
 * the club's timezone -- accounts for whatever DST offset applies that
 * day, by guessing, checking what that guess reads as in the club's
 * timezone, and correcting by the difference. */
export function clubWallTimeToDate(dateKey: string, hour = 0, minute = 0): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hour, minute));

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLUB_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(guess);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute)
  );
  return new Date(guess.getTime() + (guess.getTime() - asUtc));
}

/**
 * Parses a <input type="datetime-local"> value (e.g. "2026-11-15T16:00")
 * as wall-clock time in the club's timezone and returns the real UTC
 * instant. A datetime-local value has no timezone of its own -- plain
 * `new Date(value)` on it is parsed in whatever timezone is *running the
 * code*, which on the server is UTC, not Eastern. An admin entering 4pm
 * would otherwise have it stored as 4pm UTC and display back as 11am.
 */
export function parseClubDateTimeLocal(value: string): Date {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [hourStr, minuteStr] = timePart.split(":");
  return clubWallTimeToDate(datePart, Number(hourStr), Number(minuteStr ?? 0));
}

/** Inverse of parseClubDateTimeLocal -- formats a Date as a
 * datetime-local-compatible string ("2026-11-15T16:00") representing its
 * Eastern wall-clock value, for pre-filling an edit form's input with the
 * time it should show, not whatever the server's own timezone would give. */
export function formatClubDateTimeLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLUB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // Some engines render midnight as "24" with hour12: false.
  const hour = map.hour === "24" ? "00" : map.hour;
  return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}`;
}

/** Start of the current club-calendar week (Sunday 00:00 in the club's
 * timezone), as a real UTC instant -- not the server's local midnight. */
export function startOfClubWeek(reference: Date = new Date()): Date {
  const todayKey = clubDateKey(reference);
  const [y, m, d] = todayKey.split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const sundayKey = addClubDays(todayKey, -dayOfWeek);
  return clubWallTimeToDate(sundayKey, 0);
}
