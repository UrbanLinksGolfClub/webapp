import { getCachedOrFetch } from "./cache";
import { getTourStandings, type SgtStanding } from "./endpoints";
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

function pickHandicap(standings: SgtStanding[], sgtUsername: string): string | null {
  const entry = standings.find((s) => s.user_name === sgtUsername);
  return entry && typeof entry.hcp === "number" ? String(entry.hcp) : null;
}

async function mostRecentStandings(): Promise<SgtStanding[] | null> {
  const tours = await getCachedTours();
  const mostRecent = pickMostRecentTour(tours);
  if (!mostRecent) return null;

  return getCachedOrFetch({
    endpoint: "tours/standings",
    tourId: String(mostRecent.tourId),
    fetcher: () => getTourStandings(mostRecent.tourId),
  });
}

/** Single-member lookup, e.g. for a profile page. */
export async function getMemberHandicap(sgtUsername: string | null): Promise<string | null> {
  if (!sgtUsername || !process.env.SGT_CLUB_URL) return null;
  try {
    const standings = await mostRecentStandings();
    return standings ? pickHandicap(standings, sgtUsername) : null;
  } catch {
    return null;
  }
}

/**
 * Batch version for a member list -- fetches tours/standings once (both
 * independently cached already) and looks every username up against that
 * same result, instead of each member triggering its own tours+standings
 * round trip. A list of N members would otherwise fire up to 2N live SGT
 * requests for the exact same data whenever the cache is cold.
 */
export async function getHandicapsForMembers(
  sgtUsernames: (string | null)[]
): Promise<(string | null)[]> {
  if (!process.env.SGT_CLUB_URL || sgtUsernames.every((u) => !u)) {
    return sgtUsernames.map(() => null);
  }

  let standings: SgtStanding[] | null = null;
  try {
    standings = await mostRecentStandings();
  } catch {
    return sgtUsernames.map(() => null);
  }

  if (!standings) return sgtUsernames.map(() => null);
  const resolved = standings;
  return sgtUsernames.map((username) => (username ? pickHandicap(resolved, username) : null));
}
