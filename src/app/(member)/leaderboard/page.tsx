import { getCachedOrFetch } from "@/lib/sgt/cache";
import { getTourStandings, getTourStats } from "@/lib/sgt/endpoints";
import { getCachedTours, pickMostRecentTour } from "@/lib/sgt/tours";
import { SgtNotConfigured, SgtErrorState } from "@/components/sgt-not-configured";
import { StatsSection } from "./stats-section";

export default async function LeaderboardPage(props: PageProps<"/leaderboard">) {
  if (!process.env.SGT_CLUB_URL) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <h1 className="font-heading text-3xl text-ul-green">LEADERBOARD</h1>
        <SgtNotConfigured />
      </div>
    );
  }

  const searchParams = await props.searchParams;

  try {
    const tours = await getCachedTours();
    const mostRecent = pickMostRecentTour(tours);

    const requestedTourId = searchParams.tourId;
    const requested = Array.isArray(requestedTourId) ? requestedTourId[0] : requestedTourId;
    const selectedTour = requested
      ? tours.find((t) => String(t.tourId) === requested)
      : mostRecent;

    const [standings, stats] = await Promise.all([
      selectedTour
        ? getCachedOrFetch({
            endpoint: "tours/standings",
            tourId: String(selectedTour.tourId),
            fetcher: () => getTourStandings(selectedTour.tourId),
          })
        : Promise.resolve(null),
      selectedTour
        ? getCachedOrFetch({
            endpoint: "tours/stats",
            tourId: String(selectedTour.tourId),
            fetcher: () => getTourStats(selectedTour.tourId),
          })
        : Promise.resolve(null),
    ]);

    return (
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <h1 className="font-heading text-3xl text-ul-green">LEADERBOARD</h1>

        {tours.length > 0 && (
          <div>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
              <span className="font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
                LEAGUES
              </span>
              <form className="flex items-center gap-2">
                <select
                  name="tourId"
                  defaultValue={selectedTour ? String(selectedTour.tourId) : undefined}
                  className="border border-ul-cream-dark bg-ul-white px-3 py-1.5 text-sm text-ul-green"
                >
                  {tours.map((t) => (
                    <option key={t.tourId} value={t.tourId}>
                      {t.name} {t.tourId === mostRecent?.tourId ? "(most recent)" : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="border border-ul-cream-dark px-3 py-1.5 font-heading text-[10px] tracking-[0.14em] text-ul-green hover:border-ul-green"
                >
                  VIEW
                </button>
              </form>
            </div>

            {standings && (
              <div className="border border-ul-cream-dark bg-ul-white">
                {standings.length === 0 ? (
                  <p className="p-5 text-sm text-ul-text-muted">No standings for this league yet.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-ul-cream-dark text-ul-text-muted">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Player</th>
                        <th className="p-3">Events</th>
                        <th className="p-3">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ul-cream-dark">
                      {standings.map((row, i) => (
                        <tr key={row.user_name ?? row.players?.join(",") ?? i}>
                          <td className="p-3 font-heading text-ul-gold-dark">{i + 1}</td>
                          <td className="p-3 text-ul-green">
                            {row.user_name ?? row.players?.join(", ") ?? "Unknown"}
                          </td>
                          <td className="p-3 text-ul-green">
                            {typeof row.events === "number" ? row.events : "—"}
                          </td>
                          <td className="p-3 font-heading text-ul-green">
                            {typeof row.points === "number" ? row.points : (row.first as number) ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {stats && selectedTour && <StatsSection stats={stats} tourName={selectedTour.name} />}
      </div>
    );
  } catch (err) {
    console.error(err);
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <h1 className="font-heading text-3xl text-ul-green">LEADERBOARD</h1>
        <SgtErrorState />
      </div>
    );
  }
}
