const MEMBERSHIP_TYPE_LABELS: Record<string, string> = {
  FOUNDING_MEMBER: "Founding Member",
  RACCOON_RATE: "Raccoon Rate",
};

export function formatMembershipType(type: string | null): string {
  if (!type) return "Not set";
  return MEMBERSHIP_TYPE_LABELS[type] ?? type;
}
