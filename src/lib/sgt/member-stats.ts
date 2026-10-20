import { getCachedOrFetch } from "./cache";
import { getTourStats } from "./endpoints";
import { getCachedTours, sortToursByRecency, RECENT_LEAGUE_DEPTH } from "./tours";
import { formatCategoryLabel, primaryValue } from "./stat-format";

export type MemberStat = { category: string; label: string; value: string };

/**
 * This member's own row, pulled out of each stat category. Checks the last
 * few leagues by recency rather than just the single newest one -- two
 * flights of the same cup (e.g. "High Cap Twigs" and "Low Cap Sticks") can
 * be running at the same time, and whichever one happens to sort first
 * isn't necessarily the one this member actually plays in. Sourced from
 * tours/stats, which is solid, unlike members/user-sgt-data.
 */
export async function getMemberLeagueStats(sgtUsername: string | null): Promise<MemberStat[]> {
  if (!sgtUsername || !process.env.SGT_CLUB_URL) return [];

  try {
    const tours = await getCachedTours();
    const recent = sortToursByRecency(tours).slice(0, RECENT_LEAGUE_DEPTH);

    for (const tour of recent) {
      const stats = await getCachedOrFetch({
        endpoint: "tours/stats",
        tourId: String(tour.tourId),
        fetcher: () => getTourStats(tour.tourId),
      }).catch(() => null);
      if (!stats) continue;

      const results: MemberStat[] = [];
      for (const [category, rows] of Object.entries(stats)) {
        if (!Array.isArray(rows)) continue;
        const row = rows.find((r) => r.user_name === sgtUsername);
        if (row) {
          results.push({ category, label: formatCategoryLabel(category), value: primaryValue(row) });
        }
      }
      if (results.length > 0) return results;
    }
    return [];
  } catch {
    return [];
  }
}
