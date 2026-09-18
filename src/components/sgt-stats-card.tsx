import { getCachedOrFetch } from "@/lib/sgt/cache";
import { getUserSgtData } from "@/lib/sgt/endpoints";
import { getMemberHandicap } from "@/lib/sgt/handicap";

function formatFieldLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toUpperCase();
}

export async function SgtStatsCard({
  sgtUsername,
  emptyMessage = "No SGT handle linked yet.",
}: {
  sgtUsername: string | null;
  emptyMessage?: string;
}) {
  let sgtData: Record<string, unknown> | null = null;
  let sgtError = false;

  if (sgtUsername && process.env.SGT_CLUB_URL) {
    try {
      sgtData = await getCachedOrFetch({
        endpoint: "members/user-sgt-data",
        tourId: sgtUsername,
        ttlMs: 30 * 60 * 1000,
        fetcher: () => getUserSgtData(sgtUsername),
      });
    } catch {
      sgtError = true;
    }
  }

  // Sourced from league standings, not the sgtData blob above -- see
  // lib/sgt/handicap.ts for why (members/user-sgt-data returns empty
  // fields for every account, confirmed broken on SGT's side).
  const handicap = await getMemberHandicap(sgtUsername);

  // members/user-sgt-data currently comes back with real keys but empty
  // string values for everyone, so filter those out rather than showing a
  // grid of labels with nothing under them.
  const fields = sgtData
    ? Object.entries(sgtData).filter(
        ([, v]) => (typeof v === "number" || typeof v === "string") && String(v).trim() !== ""
      )
    : [];

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
      ) : sgtError && !handicap ? (
        <p className="mt-3 text-sm text-ul-text-muted">Couldn&apos;t load SGT stats right now.</p>
      ) : !handicap && fields.length === 0 ? (
        <p className="mt-3 text-sm text-ul-text-muted">No SGT stats available yet.</p>
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
          {fields.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {fields.slice(0, 9).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
                    {formatFieldLabel(key)}
                  </dt>
                  <dd className="mt-1 font-heading text-xl text-ul-green">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  );
}
