import type { Config } from "@netlify/functions";
import { getCachedOrFetch } from "../../src/lib/sgt/cache";
import { getTours, getTourStats } from "../../src/lib/sgt/endpoints";

export default async () => {
  try {
    const tours = await getCachedOrFetch({
      endpoint: "tours/list",
      ttlMs: 60 * 60 * 1000,
      fetcher: () => getTours(),
    });

    for (const tour of tours) {
      const tourId = String(tour.tourId);
      await getCachedOrFetch({
        endpoint: "tours/stats",
        tourId,
        fetcher: () => getTourStats(tourId),
      });
    }

    return new Response("SGT stats cache refreshed", { status: 200 });
  } catch (err) {
    console.error("SGT stats refresh failed", err);
    return new Response("SGT stats refresh failed", { status: 500 });
  }
};

export const config: Config = {
  schedule: "*/20 * * * *",
};
