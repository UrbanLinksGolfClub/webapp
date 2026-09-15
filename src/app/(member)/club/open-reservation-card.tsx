"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AMENITY_CAPACITY, amenityLabel } from "@/lib/amenities";

type Amenity = "SIM" | "LOUNGE" | "GREEN" | "TABLE";

type Booking = {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  member: { name: string };
  joins: { amenity: Amenity; member: { name: string } }[];
};

const AMENITIES: Amenity[] = ["SIM", "LOUNGE", "GREEN", "TABLE"];

export function OpenReservationCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<Amenity | null>(null);

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const remaining = (amenity: Amenity) => {
    const claimed = booking.joins.filter((j) => j.amenity === amenity).length;
    const occupied = amenity === "SIM" ? claimed + 1 : claimed;
    return AMENITY_CAPACITY[amenity] - occupied;
  };

  const openSpots = AMENITIES.filter((a) => remaining(a) > 0).length;

  async function join(amenity: Amenity) {
    setJoining(amenity);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amenity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to join.");
        return;
      }
      router.refresh();
    } finally {
      setJoining(null);
    }
  }

  return (
    <div className="border border-ul-cream-dark border-l-[3px] border-l-ul-gold bg-ul-white p-5">
      <div className="flex items-baseline justify-between">
        <span className="font-heading text-lg text-ul-green">
          {start.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()} ·{" "}
          {start.toLocaleTimeString(undefined, { hour: "numeric" })}–
          {end.toLocaleTimeString(undefined, { hour: "numeric" })}
        </span>
        <span className="font-heading text-[10px] tracking-[0.16em] text-ul-gold-dark">
          {openSpots} SPOT{openSpots === 1 ? "" : "S"}
        </span>
      </div>
      <div className="mt-1.5 text-sm text-ul-text-muted">
        Hosted by {booking.member.name}
        {booking.joins.length > 0 &&
          ` · ${booking.joins.map((j) => j.member.name).join(", ")} joined`}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {AMENITIES.map((amenity) => {
          const left = remaining(amenity);
          const claimedFully = left <= 0;
          return (
            <button
              key={amenity}
              type="button"
              disabled={claimedFully || joining !== null}
              onClick={() => join(amenity)}
              className={`font-heading text-[9px] tracking-[0.14em] px-2.5 py-1 disabled:cursor-not-allowed ${
                claimedFully
                  ? "bg-ul-cream text-ul-text-muted"
                  : "border border-ul-cream-dark text-ul-text-muted hover:border-ul-green hover:text-ul-green"
              }`}
            >
              {joining === amenity
                ? "JOINING..."
                : `${amenityLabel(amenity).toUpperCase()}${claimedFully ? "" : " · JOIN"}`}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
