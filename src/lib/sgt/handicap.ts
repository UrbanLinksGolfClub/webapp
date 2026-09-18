import { getCachedOrFetch } from "./cache";
import { getUserSgtData } from "./endpoints";

// SGT's user-sgt-data payload isn't formally typed (it's a free-form blob
// from a third-party API) -- match any key containing "hcp"/"handicap"
// (e.g. the real field is SGT_COMBO_HCP) rather than assuming an exact
// name, so this keeps working if the field gets renamed or prefixed.
export function extractHandicap(data: Record<string, unknown>): [key: string, value: string] | null {
  const entry = Object.entries(data).find(([key]) => /hcp|handicap/i.test(key));
  if (!entry) return null;
  const [key, value] = entry;
  return typeof value === "number" || typeof value === "string" ? [key, String(value)] : null;
}

/** Cached handicap lookup for contexts (like a member list) that only need
 * the one figure, not the full stats payload. Never throws -- a member with
 * no linked handle or a failed live fetch just shows no handicap. */
export async function getMemberHandicap(sgtUsername: string | null): Promise<string | null> {
  if (!sgtUsername || !process.env.SGT_CLUB_URL) return null;
  try {
    const data = await getCachedOrFetch({
      endpoint: "members/user-sgt-data",
      tourId: sgtUsername,
      ttlMs: 30 * 60 * 1000,
      fetcher: () => getUserSgtData(sgtUsername),
    });
    return extractHandicap(data)?.[1] ?? null;
  } catch {
    return null;
  }
}
