import { getMemberLeagueStats } from "@/lib/sgt/member-stats";

export async function SgtStatsCard({
  sgtUsername,
  emptyMessage = "No SGT handle linked yet.",
}: {
  sgtUsername: string | null;
  emptyMessage?: string;
}) {
  const stats = await getMemberLeagueStats(sgtUsername);

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
      ) : stats.length === 0 ? (
        <p className="mt-3 text-sm text-ul-text-muted">
          No SGT stats available yet -- link your handle and play in the current league to see
          numbers here.
        </p>
      ) : (
        <dl className="mt-4 divide-y divide-ul-cream-dark">
          {stats.map(({ category, label, value }) => (
            <div key={category} className="flex items-center justify-between py-2.5">
              <dt className="font-heading text-xs tracking-[0.1em] text-ul-text-muted">{label}</dt>
              <dd className="font-heading text-lg text-ul-green">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
