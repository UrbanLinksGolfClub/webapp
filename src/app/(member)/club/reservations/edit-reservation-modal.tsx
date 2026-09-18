"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addClubDays, clubDateKey } from "@/lib/time";

type BookingKind = "CLOSED" | "OPEN";

export function EditReservationModal({
  bookingId,
  startTime,
  endTime,
}: {
  bookingId: string;
  startTime: string;
  endTime: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStart = new Date(startTime);
  const currentDurationHours = Math.round(
    (new Date(endTime).getTime() - currentStart.getTime()) / (60 * 60 * 1000)
  );

  const todayKey = clubDateKey(new Date());
  const maxDate = addClubDays(todayKey, 13);

  const [date, setDate] = useState(clubDateKey(currentStart));
  const [hour, setHour] = useState(currentStart.getHours());
  const [duration, setDuration] = useState<1 | 2>(currentDurationHours === 2 ? 2 : 1);
  const [bookingType, setBookingType] = useState<BookingKind>("CLOSED");

  function openModal() {
    setDate(clubDateKey(currentStart));
    setHour(currentStart.getHours());
    setDuration(currentDurationHours === 2 ? 2 : 1);
    setBookingType("CLOSED");
    setError(null);
    setOpen(true);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    const newStart = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
    const newEnd = new Date(newStart.getTime() + duration * 60 * 60 * 1000);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save changes.");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="font-heading text-[10px] tracking-[0.16em] text-ul-green underline"
      >
        EDIT
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          style={{ background: "rgba(11,26,42,.5)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md border-t-[3px] border-ul-gold bg-ul-cream p-7">
            <div className="font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
              EDIT RESERVATION
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
                  DATE
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayKey}
                  max={maxDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full border border-ul-cream-dark bg-ul-white px-3 py-2 text-sm text-ul-green"
                />
              </div>
              <div>
                <label className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
                  START TIME
                </label>
                <select
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="mt-1 w-full border border-ul-cream-dark bg-ul-white px-3 py-2 text-sm text-ul-green"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: "numeric" })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-heading text-[9px] tracking-[0.18em] text-ul-text-muted">
                LENGTH
              </div>
              <div className="mt-2 flex border border-ul-cream-dark">
                <button
                  type="button"
                  onClick={() => setDuration(1)}
                  className={`flex-1 px-4 py-2 font-heading text-[10.5px] tracking-[0.14em] ${duration === 1 ? "bg-ul-green text-ul-cream" : "text-ul-green hover:bg-ul-cream-dark/20"}`}
                >
                  1 HOUR
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(2)}
                  className={`flex-1 px-4 py-2 font-heading text-[10.5px] tracking-[0.14em] ${duration === 2 ? "bg-ul-green text-ul-cream" : "text-ul-green hover:bg-ul-cream-dark/20"}`}
                >
                  2 HOURS
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-heading text-[9px] tracking-[0.18em] text-ul-text-muted">
                TYPE
              </div>
              <div className="mt-2 flex border border-ul-cream-dark">
                <button
                  type="button"
                  onClick={() => setBookingType("CLOSED")}
                  className={`flex-1 px-4 py-2 font-heading text-[10.5px] tracking-[0.14em] ${bookingType === "CLOSED" ? "bg-ul-green text-ul-cream" : "text-ul-green hover:bg-ul-cream-dark/20"}`}
                >
                  CLOSED
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType("OPEN")}
                  className={`flex-1 px-4 py-2 font-heading text-[10.5px] tracking-[0.14em] ${bookingType === "OPEN" ? "bg-ul-green text-ul-cream" : "text-ul-green hover:bg-ul-cream-dark/20"}`}
                >
                  OPEN
                </button>
              </div>
              {bookingType === "OPEN" && (
                <p className="mt-1.5 text-xs text-ul-text-muted">
                  Once saved as open, other members can join -- you won&apos;t be able to edit it
                  again after that, only cancel.
                </p>
              )}
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-ul-cream-dark px-4 py-3 text-center font-heading text-[10.5px] tracking-[0.18em] text-ul-green hover:border-ul-green"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex-1 bg-ul-gold py-3 text-center font-heading text-[10.5px] font-semibold tracking-[0.18em] text-ul-green-dark hover:bg-ul-gold-dark disabled:opacity-50"
              >
                {submitting ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
