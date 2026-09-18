import { getCachedOrFetch } from "./cache";
import { getTourStandings } from "./endpoints";
import { getCachedTours, pickMostRecentTour } from "./tours";

/**
 * Handicap comes from the standings of the most recently played league, not
 * members/user-sgt-data -- that endpoint returns `user_id: false` and empty
 * fields for every account we tested (confirmed against several real,
 * currently-playing members), so it appears broken on SGT's side. Standings
 * data is solid and already carries each player's hcp for that league.
 *
 * This also means a new league becomes the handicap source automatically as
 * soon as it's the most recent one by date -- no code change needed when
 * the club starts a new one.
 */
export async function getMemberHandicap(sgtUsername: string | null): Promise<string | null> {
  if (!sgtUsername || !process.env.SGT_CLUB_URL) return null;
  try {
    const tours = await getCachedTours();
    const mostRecent = pickMostRecentTour(tours);
    if (!mostRecent) return null;

    const standings = await getCachedOrFetch({
      endpoint: "tours/standings",
      tourId: String(mostRecent.tourId),
      fetcher: () => getTourStandings(mostRecent.tourId),
    });

    const entry = standings.find((s) => s.user_name === sgtUsername);
    return entry && typeof entry.hcp === "number" ? String(entry.hcp) : null;
  } catch {
    return null;
  }
}
