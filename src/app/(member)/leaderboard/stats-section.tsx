import type { SgtStanding } from "@/lib/sgt/endpoints";
import { formatCategoryLabel, primaryValue } from "@/lib/sgt/stat-format";

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
