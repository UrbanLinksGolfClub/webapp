"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ExistingBooking = { startTime: string; endTime: string };
type BookingKind = "CLOSED" | "OPEN";
type Slot = { hour: number; start: Date; end: Date; available: boolean };

// Anchored to the club's own timezone, not the browser's -- otherwise a
// browser in US time zones already sees UTC's "tomorrow" every evening,
// and "today" becomes unreachable since it's also used as minDate.
function toDateInputValue(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(d);
}

function addDays(dateStr: string, delta: number) {
  const [y, m, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day + delta)).toISOString().slice(0, 10);
}

function dayLabel(d: Date, today: Date) {
  if (d.toDateString() === today.toDateString()) return "TODAY";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }).toUpperCase();
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export function ClubBookingWidget({
  standingCount,
  isRaccoonRate,
}: {
  standingCount: number;
  isRaccoonRate: boolean;
}) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [date, setDate] = useState(toDateInputValue(today));
  const [bookings, setBookings] = useState<ExistingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalDuration, setModalDuration] = useState<1 | 2>(1);
  const [bookingType, setBookingType] = useState<BookingKind>("OPEN");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const minDate = toDateInputValue(today);
  const maxDate = useMemo(() => addDays(minDate, 13), [minDate]);

  function goToDate(next: string) {
    if (next < minDate || next > maxDate) return;
    setDate(next);
  }

  function shiftDay(delta: number) {
    goToDate(addDays(date, delta));
  }

  useEffect(() => {
    let cancelled = false;
    const from = new Date(`${date}T00:00:00`);
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    setLoading(true);
    fetch(`/api/bookings?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setBookings(d.bookings ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, refreshKey]);

  const standingFull = standingCount >= 2;

  // Always a single, fixed hourly grid -- how long a reservation runs is
  // decided in the confirm popup, not by rendering two different slot lists.
  const slots = useMemo<Slot[]>(() => {
    const now = new Date();
    return Array.from({ length: 24 }, (_, hour) => {
      const start = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      // Fixed 1-hour slots, so a valid Raccoon Rate hour just needs to start
      // and end within 12am-8am -- hour 7 (7-8am) is the last valid one.
      if (isRaccoonRate && start.getHours() >= 8) return null;
      const isPast = start <= now;
      const taken = bookings.some((b) =>
        overlaps(start, end, new Date(b.startTime), new Date(b.endTime))
      );
      return { hour, start, end, available: !isPast && !taken };
    }).filter((s): s is Slot => s !== null);
  }, [date, bookings, isRaccoonRate]);

  const nextHourSlot = selectedSlot
    ? slots.find((s) => s.hour === selectedSlot.hour + 1)
    : undefined;
  const canDoTwoHours = selectedSlot ? !!nextHourSlot?.available : false;

  function openConfirm(slot: Slot) {
    setSelectedSlot(slot);
    setModalDuration(1);
    setBookingType("OPEN");
    setError(null);
  }

  async function reserve() {
    if (!selectedSlot) return;
    const endTime = new Date(selectedSlot.start.getTime() + modalDuration * 60 * 60 * 1000);
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType,
          startTime: selectedSlot.start.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to reserve.");
        return;
      }
      setSelectedSlot(null);
      router.refresh();
      setRefreshKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => shiftDay(-1)}
          disabled={date === minDate}
          className="border border-ul-cream-dark px-2.5 py-1.5 text-ul-green hover:border-ul-green disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous day"
        >
          ‹
        </button>
        <span className="font-heading text-lg tracking-wide text-ul-green">
          {dayLabel(new Date(`${date}T00:00:00`), today)}
        </span>
        <button
          type="button"
          onClick={() => shiftDay(1)}
          disabled={date === maxDate}
          className="border border-ul-cream-dark px-2.5 py-1.5 text-ul-green hover:border-ul-green disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next day"
        >
          ›
        </button>
        <span className="flex items-center gap-1.5 border border-ul-cream-dark px-3 py-1.5">
          <span aria-hidden>📅</span>
          <input
            type="date"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={(e) => goToDate(e.target.value)}
            className="text-sm text-ul-green outline-none"
          />
        </span>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-ul-text-muted">Loading availability...</p>
      ) : slots.length === 0 ? (
        <p className="mt-5 text-sm text-ul-text-muted">Nothing open on this day.</p>
      ) : (
        <div className="mt-5 divide-y divide-ul-cream-dark border border-ul-cream-dark bg-ul-white">
          {slots.map((slot) => (
            <button
              key={slot.hour}
              type="button"
              disabled={!slot.available}
              onClick={() => openConfirm(slot)}
              className="flex w-full items-center justify-between px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-[#FBFAF3]"
            >
              <span className="font-heading text-base text-ul-green">
                {slot.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                {" – "}
                {slot.end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </span>
              <span
                className={`font-heading text-[10px] tracking-[0.16em] ${slot.available ? "text-ul-gold-dark" : "text-ul-text-muted"}`}
              >
                {slot.available ? "AVAILABLE — RESERVE" : "TAKEN"}
              </span>
            </button>
          ))}
        </div>
      )}

      {standingFull && (
        <p className="mt-4 text-sm text-amber-700">
          You&apos;ve got 2 upcoming reservations already — the most a membership allows at once.
          Cancel one to book another.
        </p>
      )}

      {selectedSlot && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          style={{ background: "rgba(11,26,42,.5)" }}
          onClick={(e) => e.target === e.currentTarget && setSelectedSlot(null)}
        >
          <div className="w-full max-w-lg border-t-[3px] border-ul-gold bg-ul-cream p-7">
            <div className="font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
              CONFIRM
            </div>
            <div className="mt-2 font-heading text-3xl text-ul-green">
              {selectedSlot.start.toLocaleTimeString(undefined, { hour: "numeric" })}{" "}
              {dayLabel(selectedSlot.start, today)}
            </div>

            <div className="mt-5">
              <div className="font-heading text-[9px] tracking-[0.18em] text-ul-text-muted">
                LENGTH
              </div>
              <div className="mt-2 flex border border-ul-cream-dark">
                <button
                  type="button"
                  onClick={() => setModalDuration(1)}
                  className={`flex-1 px-4 py-2 font-heading text-[10.5px] tracking-[0.14em] ${modalDuration === 1 ? "bg-ul-green text-ul-cream" : "text-ul-green hover:bg-ul-cream-dark/20"}`}
                >
                  1 HOUR
                </button>
                <button
                  type="button"
                  onClick={() => canDoTwoHours && setModalDuration(2)}
                  disabled={!canDoTwoHours}
                  title={!canDoTwoHours ? "The following hour isn't open" : undefined}
                  className={`flex-1 px-4 py-2 font-heading text-[10.5px] tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40 ${modalDuration === 2 ? "bg-ul-green text-ul-cream" : "text-ul-green hover:bg-ul-cream-dark/20"}`}
                >
                  2 HOURS
                </button>
              </div>
              {!canDoTwoHours && (
                <p className="mt-1.5 text-xs text-ul-text-muted">
                  The following hour is already taken, so only a 1-hour reservation is available
                  here.
                </p>
              )}
            </div>

            <div className="my-5 grid gap-2.5">
              <button
                type="button"
                onClick={() => setBookingType("OPEN")}
                className={`p-4 text-left ${bookingType === "OPEN" ? "bg-ul-green" : "border border-ul-cream-dark bg-ul-white hover:border-ul-green"}`}
              >
                <div
                  className={`font-heading text-sm tracking-[0.14em] ${bookingType === "OPEN" ? "text-ul-cream" : "text-ul-green"}`}
                >
                  OPEN — LET MEMBERS JOIN
                </div>
                <div
                  className={`mt-1 text-xs ${bookingType === "OPEN" ? "text-ul-cream/75" : "text-ul-text-muted"}`}
                >
                  Only you use a standing slot. Others can play the sim or claim the lounge,
                  green, or table.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setBookingType("CLOSED")}
                className={`p-4 text-left ${bookingType === "CLOSED" ? "bg-ul-green" : "border border-ul-cream-dark bg-ul-white hover:border-ul-green"}`}
              >
                <div
                  className={`font-heading text-sm tracking-[0.14em] ${bookingType === "CLOSED" ? "text-ul-cream" : "text-ul-green"}`}
                >
                  CLOSED — THE WHOLE CLUB
                </div>
                <div
                  className={`mt-1 text-xs ${bookingType === "CLOSED" ? "text-ul-cream/75" : "text-ul-text-muted"}`}
                >
                  Nothing else is bookable during your hour.
                </div>
              </button>
            </div>
            {error && (
              <p className="mb-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={reserve}
              disabled={submitting}
              className="w-full bg-ul-gold py-4 text-center font-heading text-xs font-semibold tracking-[0.2em] text-ul-green-dark transition-colors hover:bg-ul-gold-dark disabled:opacity-50"
            >
              {submitting
                ? "RESERVING..."
                : `RESERVE (${modalDuration} HOUR${modalDuration > 1 ? "S" : ""}) — USES ${standingCount + 1} OF 2`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
