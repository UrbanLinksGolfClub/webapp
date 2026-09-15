import type { Amenity } from "@/generated/prisma/client";

// SIM capacity includes the host (host is always implicitly "on the sim");
// LOUNGE/GREEN/TABLE are exclusive to one joiner each. Client-safe (no
// Prisma client import) so both server and client components can use it.
export const AMENITY_CAPACITY: Record<Amenity, number> = {
  SIM: 4,
  LOUNGE: 1,
  GREEN: 1,
  TABLE: 1,
};

export function amenityLabel(amenity: Amenity): string {
  switch (amenity) {
    case "SIM":
      return "The sim";
    case "LOUNGE":
      return "Lounge";
    case "GREEN":
      return "Putting green";
    case "TABLE":
      return "Table";
  }
}
