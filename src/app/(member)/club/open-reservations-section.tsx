"use client";

import { useState } from "react";
import { usePolling } from "@/lib/use-polling";
import { OpenReservationCard } from "./open-reservation-card";

type Amenity = "SIM" | "LOUNGE" | "GREEN" | "TABLE";

type Booking = {
  id: string;
  startTime: string;
  endTime: string;
  member: { name: string };
  joins: { amenity: Amenity; member: { name: string } }[];
};

export function OpenReservationsSection({ initial }: { initial: Booking[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initial);

  async function refresh() {
    try {
      const res = await fetch("/api/bookings/open");
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.openReservations ?? []);
    } catch {
      // Transient network hiccup -- keep showing the last known state and
      // try again on the next poll.
    }
  }

  // Pick up reservations opened/claimed by other members without a manual
  // reload.
  usePolling(refresh, 20000);

  if (bookings.length === 0) {
    return <p className="text-sm text-ul-text-muted">Nothing open right now.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {bookings.map((b) => (
        <OpenReservationCard key={b.id} booking={b} />
      ))}
    </div>
  );
}
