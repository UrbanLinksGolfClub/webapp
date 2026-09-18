import { getCachedOrFetch } from "@/lib/sgt/cache";
import { getUserSgtData } from "@/lib/sgt/endpoints";

// SGT's user-sgt-data payload isn't formally typed (it's a free-form blob
// from a third-party API) -- match any key containing "hcp"/"handicap"
// (e.g. the real field is SGT_COMBO_HCP) rather than assuming an exact
// name, so this keeps working if the field gets renamed or prefixed.
function findHandicap(data: Record<string, unknown>): [key: string, value: string] | null {
  const entry = Object.entries(data).find(([key]) => /hcp|handicap/i.test(key));
  if (!entry) return null;
  const [key, value] = entry;
  return typeof value === "number" || typeof value === "string" ? [key, String(value)] : null;
}

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

  const handicap = sgtData ? findHandicap(sgtData) : null;
  const [handicapKey, handicapValue] = handicap ?? [null, null];

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
      ) : sgtError || !sgtData ? (
        <p className="mt-3 text-sm text-ul-text-muted">Couldn&apos;t load SGT stats right now.</p>
      ) : (
        <>
          {handicapValue && (
            <div className="mt-4 border-b border-ul-cream-dark pb-4">
              <div className="font-heading text-[9px] tracking-[0.16em] text-ul-gold-dark">
                HANDICAP
              </div>
              <div className="mt-1 font-heading text-4xl text-ul-green">{handicapValue}</div>
            </div>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            {Object.entries(sgtData)
              .filter(([key, v]) => key !== handicapKey && (typeof v === "number" || typeof v === "string"))
              .slice(0, 9)
              .map(([key, value]) => (
                <div key={key}>
                  <dt className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
                    {formatFieldLabel(key)}
                  </dt>
                  <dd className="mt-1 font-heading text-xl text-ul-green">{String(value)}</dd>
                </div>
              ))}
          </dl>
        </>
      )}
    </div>
  );
}
