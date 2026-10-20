import { getCachedOrFetch } from "./cache";
import { getTourStandings, type SgtStanding } from "./endpoints";
import { getCachedTours, sortToursByRecency, RECENT_LEAGUE_DEPTH } from "./tours";

function pickHandicap(standings: SgtStanding[], sgtUsername: string): string | null {
  const entry = standings.find((s) => s.user_name === sgtUsername);
  return entry && typeof entry.hcp === "number" ? String(entry.hcp) : null;
}

async function recentStandingsLists(): Promise<SgtStanding[][]> {
  const tours = await getCachedTours();
  const recent = sortToursByRecency(tours).slice(0, RECENT_LEAGUE_DEPTH);
  return Promise.all(
    recent.map((tour) =>
      getCachedOrFetch({
        endpoint: "tours/standings",
        tourId: String(tour.tourId),
        fetcher: () => getTourStandings(tour.tourId),
      }).catch(() => [] as SgtStanding[])
    )
  );
}

/** Single-member lookup, e.g. for a profile page. */
export async function getMemberHandicap(sgtUsername: string | null): Promise<string | null> {
  if (!sgtUsername || !process.env.SGT_CLUB_URL) return null;
  try {
    const lists = await recentStandingsLists();
    for (const standings of lists) {
      const hcp = pickHandicap(standings, sgtUsername);
      if (hcp !== null) return hcp;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Batch version for a member list -- fetches each of the last few leagues'
 * standings once (independently cached already) and resolves every
 * username against that same shared result, instead of each member
 * triggering its own round trips.
 */
export async function getHandicapsForMembers(
  sgtUsernames: (string | null)[]
): Promise<(string | null)[]> {
  if (!process.env.SGT_CLUB_URL || sgtUsernames.every((u) => !u)) {
    return sgtUsernames.map(() => null);
  }

  let lists: SgtStanding[][];
  try {
    lists = await recentStandingsLists();
  } catch {
    return sgtUsernames.map(() => null);
  }

  return sgtUsernames.map((username) => {
    if (!username) return null;
    for (const standings of lists) {
      const hcp = pickHandicap(standings, username);
      if (hcp !== null) return hcp;
    }
    return null;
  });
}
