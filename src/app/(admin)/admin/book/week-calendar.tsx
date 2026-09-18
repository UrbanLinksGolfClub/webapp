"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/lib/actions/booking-actions";
import { toggleNoShowAction } from "@/lib/actions/admin-booking-actions";
import { addClubDays, clubDateKey, clubWallTimeToDate, formatClubDateTime, formatClubTime } from "@/lib/time";

type Booking = {
  id: string;
  bookingType: "OPEN" | "CLOSED";
  startTime: string;
  endTime: string;
  noShow: boolean;
  hostName: string;
  joins: { amenity: string; memberName: string }[];
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function WeekCalendar({
  weekStart,
  bookings,
}: {
  weekStart: string;
  bookings: Booking[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const startKey = clubDateKey(new Date(weekStart));

  // Day keys (Y-M-D in the club's own timezone), not browser-local dates --
  // otherwise an admin browsing from outside Eastern time would see
  // bookings shifted onto the wrong day of the week.
  const dayKeys = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addClubDays(startKey, i)),
    [startKey]
  );

  function bookingAt(dayKey: string, hour: number): Booking | undefined {
    const cellStart = clubWallTimeToDate(dayKey, hour);
    const cellEnd = new Date(cellStart.getTime() + 60 * 60 * 1000);
    return bookings.find((b) => {
      const bs = new Date(b.startTime);
      const be = new Date(b.endTime);
      return bs < cellEnd && be > cellStart;
    });
  }

  const selected = bookings.find((b) => b.id === selectedId);

  async function cancel() {
    if (!selected) return;
    setBusy(true);
    try {
      await cancelBookingAction(selected.id);
      setSelectedId(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function flagNoShow() {
    if (!selected) return;
    setBusy(true);
    try {
      await toggleNoShowAction(selected.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex gap-5 text-xs text-ul-text-muted">
        <Legend color="bg-ul-green" label="Closed" />
        <Legend color="bg-ul-gold" label="Open" />
      </div>

      <div className="overflow-x-auto border border-ul-cream-dark bg-ul-white p-5">
        <div className="min-w-[720px]">
          <div className="flex gap-0.5 pl-[86px]">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 font-heading text-[8px] text-ul-text-muted">
                {h === 0 ? "12a" : h < 12 ? h : h === 12 ? "12p" : h - 12}
              </div>
            ))}
          </div>
          <div className="mt-2 grid gap-1">
            {dayKeys.map((dayKey) => {
              const [, , dayOfMonth] = dayKey.split("-").map(Number);
              const dayOfWeek = new Date(`${dayKey}T00:00:00Z`).getUTCDay();
              return (
              <div key={dayKey} className="flex items-center gap-0.5">
                <div className="w-[86px] font-heading text-[11px] tracking-[0.08em] text-ul-green">
                  {DAY_LABELS[dayOfWeek]} {dayOfMonth}
                </div>
                <div className="grid flex-1 gap-0.5" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
                  {HOURS.map((h) => {
                    const b = bookingAt(dayKey, h);
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={!b}
                        onClick={() => b && setSelectedId(b.id)}
                        className={`h-[30px] ${
                          !b
                            ? "bg-ul-cream"
                            : b.id === selectedId
                              ? "ring-2 ring-inset ring-ul-text"
                              : ""
                        } ${b?.bookingType === "CLOSED" ? "bg-ul-green cursor-pointer" : ""} ${
                          b?.bookingType === "OPEN" ? "bg-ul-gold cursor-pointer" : ""
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        </div>
        <p className="font-accent mt-4 text-base italic text-ul-text-muted">
          Click any block to see who booked it, cancel it, or flag a no-show.
        </p>
      </div>

      {selected && (
        <div className="mt-5 border border-ul-cream-dark border-t-[3px] border-t-ul-gold bg-ul-white p-5">
          <div className="font-heading text-[9.5px] font-semibold tracking-[0.26em] text-ul-text-muted">
            SELECTED ·{" "}
            {formatClubDateTime(new Date(selected.startTime), {
              weekday: "short",
              hour: "numeric",
            })}
            –{formatClubTime(new Date(selected.endTime), { hour: "numeric" })}
          </div>
          <div className="mt-2 font-heading text-xl text-ul-green">
            {selected.hostName.toUpperCase()}
          </div>
          <div className="mt-1 text-sm text-ul-text-muted">
            {selected.bookingType === "OPEN" ? "Open reservation" : "Closed reservation"}
            {selected.joins.length > 0 &&
              ` · ${selected.joins.map((j) => `${j.memberName} (${j.amenity.toLowerCase()})`).join(", ")}`}
            {selected.noShow && " · No-show flagged"}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={busy}
              onClick={flagNoShow}
              className="border border-ul-cream-dark px-3 py-2.5 font-heading text-[10px] tracking-[0.14em] text-ul-green hover:border-ul-green disabled:opacity-50"
            >
              {selected.noShow ? "UNFLAG NO-SHOW" : "FLAG A NO-SHOW"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={cancel}
              className="border border-ul-gold px-3 py-2.5 font-heading text-[10px] tracking-[0.14em] text-ul-gold-dark hover:bg-ul-gold/10 disabled:opacity-50"
            >
              CANCEL RESERVATION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`block h-2.5 w-2.5 ${color}`} />
      {label}
    </span>
  );
}
