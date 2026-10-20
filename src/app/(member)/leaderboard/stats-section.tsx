import type { SgtStanding } from "@/lib/sgt/endpoints";

// Golf stat abbreviations that should render fully uppercase rather than
// just title-cased -- the generic word-by-word capitalization below would
// otherwise turn e.g. "gir" into "Gir".
const ACRONYMS = new Set(["gir", "fir", "yds"]);

function formatCategoryLabel(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/);

  return words
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function primaryValue(row: SgtStanding): string {
  const entries = Object.entries(row).filter(
    ([k]) => k !== "user_name" && k !== "players" && k !== "tourAverage"
  );
  const [, value] = entries[0] ?? [];
  return typeof value === "number" ? value.toFixed(2) : String(value ?? "");
}

export function StatsSection({
  stats,
  tourName,
}: {
  stats: Record<string, SgtStanding[]>;
  tourName: string;
}) {
  const categories = Object.entries(stats).filter(([, rows]) => Array.isArray(rows) && rows.length > 0);
  if (categories.length === 0) return null;

  return (
    <div>
      <div className="font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
        STATS · {tourName.toUpperCase()}
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {categories.map(([category, rows]) => (
          <section key={category} className="border border-ul-cream-dark bg-ul-white">
            <div className="border-b border-ul-cream-dark bg-ul-cream/40 p-3 font-heading text-xs font-bold tracking-[0.1em] text-ul-gold-dark">
              {formatCategoryLabel(category)}
            </div>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-ul-cream-dark">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={row.user_name ?? row.players?.join(",") ?? i}>
                    <td className="p-2.5 text-ul-green">
                      {row.user_name ?? row.players?.join(", ") ?? "Unknown"}
                    </td>
                    <td className="p-2.5 text-right font-heading text-ul-green">{primaryValue(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}
