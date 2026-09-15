import { getValidApiKey } from "./auth";

const BASE_URL = "https://simulatorgolftour.com/sgt-api/club-admin";

function clubUrl(): string {
  const url = process.env.SGT_CLUB_URL;
  if (!url) throw new Error("SGT_CLUB_URL is not configured");
  return url;
}

/**
 * Thin GET wrapper around the SGT Club Admin API. Handles attaching the
 * current (auto-refreshed) api-key. Write endpoints can be added as
 * sibling `sgtPost`/etc. helpers later without touching this.
 */
export async function sgtGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const key = await getValidApiKey();
  const search = new URLSearchParams();
  search.set("api-key", key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, String(v));
  }

  const res = await fetch(
    `${BASE_URL}/${clubUrl()}/${path}?${search.toString()}`,
    { method: "GET" }
  );

  if (!res.ok) {
    throw new Error(`SGT API error ${res.status} on ${path}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}
