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

/** The real UTC instant at which it becomes `hour:00` on `dateKey` in the
 * club's timezone -- accounts for whatever DST offset applies that day, by
 * guessing, checking what that guess reads as in the club's timezone, and
 * correcting by the difference. */
export function clubWallTimeToDate(dateKey: string, hour = 0): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hour));

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

/** Start of the current club-calendar week (Sunday 00:00 in the club's
 * timezone), as a real UTC instant -- not the server's local midnight. */
export function startOfClubWeek(reference: Date = new Date()): Date {
  const todayKey = clubDateKey(reference);
  const [y, m, d] = todayKey.split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const sundayKey = addClubDays(todayKey, -dayOfWeek);
  return clubWallTimeToDate(sundayKey, 0);
}
