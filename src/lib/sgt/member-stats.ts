import { getCachedOrFetch } from "./cache";
import { getTourStats } from "./endpoints";
import { getCachedTours, pickMostRecentTour } from "./tours";
import { formatCategoryLabel, primaryValue } from "./stat-format";

export type MemberStat = { category: string; label: string; value: string };

/**
 * This member's own row, pulled out of each stat category for the club's
 * current league (the single most recently-ended one -- not the
 * fall-back-across-several-leagues behavior handicap uses, since "current
 * league" specifically means the one happening now). Sourced from
 * tours/stats, which is solid, unlike members/user-sgt-data.
 */
export async function getMemberLeagueStats(sgtUsername: string | null): Promise<MemberStat[]> {
  if (!sgtUsername || !process.env.SGT_CLUB_URL) return [];

  try {
    const tours = await getCachedTours();
    const current = pickMostRecentTour(tours);
    if (!current) return [];

    const stats = await getCachedOrFetch({
      endpoint: "tours/stats",
      tourId: String(current.tourId),
      fetcher: () => getTourStats(current.tourId),
    });

    const results: MemberStat[] = [];
    for (const [category, rows] of Object.entries(stats)) {
      if (!Array.isArray(rows)) continue;
      const row = rows.find((r) => r.user_name === sgtUsername);
      if (row) {
        results.push({ category, label: formatCategoryLabel(category), value: primaryValue(row) });
      }
    }
    return results;
  } catch {
    return [];
  }
}
