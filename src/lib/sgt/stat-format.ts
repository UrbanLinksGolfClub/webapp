import type { SgtStanding } from "./endpoints";

// Golf stat abbreviations that should render fully uppercase rather than
// just title-cased -- the generic word-by-word capitalization below would
// otherwise turn e.g. "gir" into "Gir".
const ACRONYMS = new Set(["gir", "fir", "yds"]);

export function formatCategoryLabel(key: string): string {
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

export function primaryValue(row: SgtStanding): string {
  const entries = Object.entries(row).filter(
    ([k]) => k !== "user_name" && k !== "players" && k !== "tourAverage"
  );
  const [, value] = entries[0] ?? [];
  return typeof value === "number" ? value.toFixed(2) : String(value ?? "");
}
