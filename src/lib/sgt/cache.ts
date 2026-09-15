import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const DEFAULT_TTL_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Reads SGT data from sgt_stats_cache if fresh, otherwise calls `fetcher`
 * (a live SGT API call) and persists the result. If the live call fails
 * and a stale cached copy exists, serves the stale copy rather than
 * blanking the UI.
 */
export async function getCachedOrFetch<T>({
  endpoint,
  tourId = "",
  ttlMs = DEFAULT_TTL_MS,
  fetcher,
}: {
  endpoint: string;
  tourId?: string;
  ttlMs?: number;
  fetcher: () => Promise<T>;
}): Promise<T> {
  const clubUrl = process.env.SGT_CLUB_URL ?? "";

  const existing = await prisma.sgtStatsCache.findUnique({
    where: { clubUrl_tourId_endpoint: { clubUrl, tourId, endpoint } },
  });

  if (existing && existing.expiresAt > new Date()) {
    return existing.payload as T;
  }

  try {
    const fresh = await fetcher();
    await prisma.sgtStatsCache.upsert({
      where: { clubUrl_tourId_endpoint: { clubUrl, tourId, endpoint } },
      update: {
        payload: fresh as Prisma.InputJsonValue,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + ttlMs),
      },
      create: {
        clubUrl,
        tourId,
        endpoint,
        payload: fresh as Prisma.InputJsonValue,
        expiresAt: new Date(Date.now() + ttlMs),
      },
    });
    return fresh;
  } catch (err) {
    if (existing) {
      console.error(`SGT live fetch failed for ${endpoint}, serving stale cache`, err);
      return existing.payload as T;
    }
    throw err;
  }
}
