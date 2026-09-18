import { getValidApiKey, bootstrapApiKey } from "./auth";

const BASE_URL = "https://simulatorgolftour.com/sgt-api/club-admin";

function clubUrl(): string {
  const url = process.env.SGT_CLUB_URL;
  if (!url) throw new Error("SGT_CLUB_URL is not configured");
  return url;
}

async function fetchJson(
  key: string,
  path: string,
  params: Record<string, string | number | undefined>
): Promise<unknown> {
  const search = new URLSearchParams();
  search.set("api-key", key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, String(v));
  }

  const res = await fetch(`${BASE_URL}/${clubUrl()}/${path}?${search.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`SGT API error ${res.status} on ${path}: ${await res.text()}`);
  }

  return res.json();
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
  const data = await fetchJson(key, path, params);

  // SGT can respond 200 OK with a bare JSON-encoded error string (e.g. for
  // an invalid key) instead of a proper error status or object -- this was
  // previously getting treated as valid data (iterated character-by-
  // character as if it were an object). getValidApiKey() only reacts to
  // its own stored expiry timestamp, so it has no way to notice a key
  // that's been invalidated some other way (a new one minted elsewhere,
  // manually revoked, etc). Treat a bare string response as that signal,
  // mint a fresh key, and retry once before giving up.
  if (typeof data === "string") {
    const freshKey = await bootstrapApiKey();
    const retry = await fetchJson(freshKey, path, params);
    if (typeof retry === "string") {
      throw new Error(`SGT API error on ${path}: ${retry}`);
    }
    return retry as T;
  }

  return data as T;
}
