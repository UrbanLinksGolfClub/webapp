import { getMemberHandicap } from "@/lib/sgt/handicap";
import { getMemberLeagueStats } from "@/lib/sgt/member-stats";

export async function SgtStatsCard({
  sgtUsername,
  emptyMessage = "No SGT handle linked yet.",
}: {
  sgtUsername: string | null;
  emptyMessage?: string;
}) {
  const [handicap, stats] = await Promise.all([
    getMemberHandicap(sgtUsername),
    getMemberLeagueStats(sgtUsername),
  ]);

  return (
    <div className="border border-ul-cream-dark bg-ul-white p-6">
      <div className="font-heading text-[9.5px] font-semibold tracking-[0.28em] text-ul-text-muted">
        THE NUMBERS
      </div>
      {!sgtUsername ? (
        <p className="mt-3 text-sm text-ul-text-muted">{emptyMessage}</p>
      ) : !process.env.SGT_CLUB_URL ? (
        <p className="mt-3 text-sm text-ul-text-muted">
          Simulator Golf Tour isn&apos;t connected for the club yet.
        </p>
      ) : !handicap && stats.length === 0 ? (
        <p className="mt-3 text-sm text-ul-text-muted">
          No SGT stats available yet -- link your handle and play in the current league to see
          numbers here.
        </p>
      ) : (
        <>
          {handicap && (
            <div className="mt-4 border-b border-ul-cream-dark pb-4">
              <div className="font-heading text-[9px] tracking-[0.16em] text-ul-gold-dark">
                HANDICAP
              </div>
              <div className="mt-1 font-heading text-4xl text-ul-green">{handicap}</div>
            </div>
          )}
          {stats.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {stats.map(({ category, label, value }) => (
                <div key={category}>
                  <dt className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
                    {label}
                  </dt>
                  <dd className="mt-1 font-heading text-xl text-ul-green">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  );
}
