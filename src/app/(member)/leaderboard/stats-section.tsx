import type { SgtStanding } from "@/lib/sgt/endpoints";

function formatCategoryLabel(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
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
            <div className="border-b border-ul-cream-dark p-3 font-heading text-xs tracking-[0.08em] text-ul-green">
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
