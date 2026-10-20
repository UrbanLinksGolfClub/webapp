import { getCachedOrFetch } from "./cache";
import { getTours } from "./endpoints";
import type { SgtTour } from "./endpoints";

/** How many of the most recent leagues to check when looking up a member's
 * numbers. More than one tour can be running at once -- e.g. the Northern
 * Kentucky Cup's "High Cap Twigs" and "Low Cap Sticks" flights both count as
 * current -- so picking only the single newest-by-date tour can miss a
 * member who is playing in the other concurrent one. */
export const RECENT_LEAGUE_DEPTH = 3;

function tourSortDate(t: { start_date?: string; end_date?: string }): number {
  const d = t.end_date ?? t.start_date;
  return d ? new Date(d).getTime() : 0;
}

export async function getCachedTours(): Promise<SgtTour[]> {
  return getCachedOrFetch({
    endpoint: "tours/list",
    ttlMs: 60 * 60 * 1000,
    fetcher: () => getTours(),
  });
}

/** Tours ordered newest-first by end date -- SGT's "active" flag isn't a
 * reliable signal of that (a league can be marked inactive while still
 * being the most recent one played). */
export function sortToursByRecency(tours: SgtTour[]): SgtTour[] {
  return [...tours].sort((a, b) => tourSortDate(b) - tourSortDate(a));
}
