import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { cancelBookingAction } from "@/lib/actions/booking-actions";
import { amenityLabel } from "@/lib/booking";
import { formatClubDateTime, formatClubTime } from "@/lib/time";
import { LeaveButton } from "./leave-button";

export default async function MyReservationsPage() {
  const session = await auth();
  const memberId = session!.user.id;
  const now = new Date();

  const [hosted, joined] = await Promise.all([
    prisma.booking.findMany({
      where: { memberId, status: "BOOKED", startTime: { gt: now } },
      orderBy: { startTime: "asc" },
      include: { joins: { include: { member: true } } },
    }),
    prisma.bookingJoin.findMany({
      where: { memberId, booking: { status: "BOOKED", startTime: { gt: now } } },
      orderBy: { booking: { startTime: "asc" } },
      include: { booking: { include: { member: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-ul-green">MY RESERVATIONS</h1>
        <Link
          href="/club"
          className="font-heading text-[10px] tracking-[0.18em] text-ul-green hover:text-ul-gold-dark"
        >
          ← BACK TO CLUB
        </Link>
      </div>

      <div>
        <div className="mb-3 font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
          YOU&apos;RE HOSTING
        </div>
        {hosted.length === 0 ? (
          <p className="text-sm text-ul-text-muted">No upcoming reservations.</p>
        ) : (
          <div className="space-y-3">
            {hosted.map((b) => (
              <div key={b.id} className="border border-ul-cream-dark bg-ul-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading text-lg text-ul-green">
                    {formatClubDateTime(b.startTime, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {formatClubTime(b.endTime, { hour: "numeric", minute: "2-digit" })}
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.16em] text-ul-gold-dark">
                    {b.bookingType === "OPEN" ? "OPEN" : "CLOSED"}
                  </span>
                </div>
                {b.joins.length > 0 && (
                  <p className="mt-1.5 text-sm text-ul-text-muted">
                    Joined by{" "}
                    {b.joins
                      .map((j) => `${j.member.name} (${amenityLabel(j.amenity).toLowerCase()})`)
                      .join(", ")}
                  </p>
                )}
                <form
                  action={async () => {
                    "use server";
                    await cancelBookingAction(b.id);
                  }}
                  className="mt-3"
                >
                  <button type="submit" className="font-heading text-[10px] tracking-[0.16em] text-red-700 underline">
                    CANCEL RESERVATION
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
          YOU&apos;VE JOINED
        </div>
        {joined.length === 0 ? (
          <p className="text-sm text-ul-text-muted">You haven&apos;t joined anyone else&apos;s reservation.</p>
        ) : (
          <div className="space-y-3">
            {joined.map((j) => (
              <div key={j.id} className="border border-ul-cream-dark bg-ul-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading text-lg text-ul-green">
                    {formatClubDateTime(j.booking.startTime, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.16em] text-ul-gold-dark">
                    {amenityLabel(j.amenity).toUpperCase()}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-ul-text-muted">Hosted by {j.booking.member.name}</p>
                <LeaveButton bookingId={j.bookingId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
