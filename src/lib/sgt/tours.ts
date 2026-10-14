import { getCachedOrFetch } from "./cache";
import { getTours } from "./endpoints";
import type { SgtTour } from "./endpoints";

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

/** Whichever league was played most recently -- this is what makes the
 * leaderboard automatically follow a new league once it starts, with no
 * code change needed. */
export function pickMostRecentTour(tours: SgtTour[]): SgtTour | null {
  return sortToursByRecency(tours)[0] ?? null;
}
