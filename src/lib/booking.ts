import { after } from "next/server";
import { prisma } from "@/lib/db";
import type { Booking, BookingType, Amenity } from "@/generated/prisma/client";
import { AMENITY_CAPACITY, amenityLabel } from "@/lib/amenities";
import {
  notifyBookingConfirmed,
  notifyBookingCancelled,
  notifyHostJoined,
  notifyBookingHandedOff,
} from "@/lib/notify";
import { CLUB_TIMEZONE } from "@/lib/time";

// Notifications are a side effect of a booking mutation, never a reason to
// fail one -- log and move on rather than letting a dead email/push
// provider turn into a 500 for the member trying to book.
function notifyInBackground(work: () => Promise<void>) {
  after(() => work().catch((err) => console.error("Notification dispatch failed", err)));
}

export const MAX_ADVANCE_DAYS = 14;
export const MAX_STANDING_BOOKINGS = 2;

// Used to resolve "12am-8am" for Raccoon Rate members against the club's
// local wall-clock time, not the server's.
const RACCOON_RATE_WINDOW_END_HOUR = 8;

// Fixed key for a Postgres advisory lock scoped to booking mutations. The
// club is a single physical facility, so serializing all booking writes
// behind one lock keeps the join-capacity rules correct without needing to
// express "up to N concurrent" as a DB constraint.
const BOOKING_LOCK_KEY = 872345123;

export class BookingError extends Error {}

function getClubLocalHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLUB_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return (hour % 24) + minute / 60;
}

function assertWithinMembershipWindow(
  membershipType: string | null,
  startTime: Date,
  endTime: Date
) {
  if (membershipType !== "RACCOON_RATE") return;

  const startLocal = getClubLocalHour(startTime);
  const endLocal = getClubLocalHour(endTime);
  const spansIntoNextDay = endTime.getTime() - startTime.getTime() > 0 && endLocal < startLocal;

  const withinWindow =
    !spansIntoNextDay &&
    startLocal >= 0 &&
    startLocal < RACCOON_RATE_WINDOW_END_HOUR &&
    endLocal <= RACCOON_RATE_WINDOW_END_HOUR;

  if (!withinWindow) {
    throw new BookingError(
      "Raccoon Rate access runs 12am–8am. Pick a time inside that window."
    );
  }
}

export async function createBooking({
  memberId,
  bookingType,
  startTime,
  endTime,
}: {
  memberId: string;
  bookingType: BookingType;
  startTime: Date;
  endTime: Date;
}) {
  const now = new Date();
  const maxAdvance = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

  if (startTime <= now) {
    throw new BookingError("Reservations must be in the future.");
  }
  if (startTime > maxAdvance) {
    throw new BookingError(
      `Reservations can only be made up to ${MAX_ADVANCE_DAYS} days in advance.`
    );
  }
  if (endTime <= startTime) {
    throw new BookingError("Invalid time range.");
  }

  const member = await prisma.member.findUniqueOrThrow({ where: { id: memberId } });
  assertWithinMembershipWindow(member.membershipType, startTime, endTime);

  const booking = await prisma.$transaction(async (tx) => {
    // Serialize all booking mutations for this single-facility club.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOKING_LOCK_KEY})`;

    const standingCount = await tx.booking.count({
      where: { memberId, status: "BOOKED", startTime: { gt: now } },
    });
    if (standingCount >= MAX_STANDING_BOOKINGS) {
      throw new BookingError(
        `You've got ${MAX_STANDING_BOOKINGS} upcoming reservations already — the most a membership allows at once. Cancel one to book another.`
      );
    }

    try {
      return await tx.booking.create({
        data: { memberId, bookingType, startTime, endTime, status: "BOOKED" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("bookings_no_overlap") || message.includes("23P01")) {
        throw new BookingError("The club is already reserved during that time.");
      }
      throw err;
    }
  });

  notifyInBackground(() => notifyBookingConfirmed(booking));
  return booking;
}

/**
 * Only a closed reservation can be edited -- an open one can only ever be
 * cancelled (see cancelBooking), since it may already have other members'
 * amenity claims riding on its current time.
 */
export async function editBooking({
  bookingId,
  memberId,
  startTime,
  endTime,
  bookingType,
}: {
  bookingId: string;
  memberId: string;
  startTime: Date;
  endTime: Date;
  bookingType: BookingType;
}) {
  const now = new Date();
  const maxAdvance = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

  if (startTime <= now) {
    throw new BookingError("Reservations must be in the future.");
  }
  if (startTime > maxAdvance) {
    throw new BookingError(
      `Reservations can only be made up to ${MAX_ADVANCE_DAYS} days in advance.`
    );
  }
  if (endTime <= startTime) {
    throw new BookingError("Invalid time range.");
  }

  const member = await prisma.member.findUniqueOrThrow({ where: { id: memberId } });
  assertWithinMembershipWindow(member.membershipType, startTime, endTime);

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOKING_LOCK_KEY})`;

    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new BookingError("Reservation not found.");
    if (booking.memberId !== memberId) {
      throw new BookingError("You can only edit your own reservations.");
    }
    if (booking.status !== "BOOKED") {
      throw new BookingError("This reservation is already cancelled or completed.");
    }
    if (booking.bookingType !== "CLOSED") {
      throw new BookingError(
        "Open reservations can't be edited -- cancel it instead. Anyone who already joined keeps their spot."
      );
    }

    try {
      return await tx.booking.update({
        where: { id: bookingId },
        data: { startTime, endTime, bookingType },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("bookings_no_overlap") || message.includes("23P01")) {
        throw new BookingError("The club is already reserved during that time.");
      }
      throw err;
    }
  });
}

export async function cancelBooking({
  bookingId,
  memberId,
  isAdmin,
}: {
  bookingId: string;
  memberId: string;
  isAdmin: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOKING_LOCK_KEY})`;

    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { joins: { orderBy: { joinedAt: "asc" } } },
    });
    if (!booking) throw new BookingError("Reservation not found.");
    if (!isAdmin && booking.memberId !== memberId) {
      throw new BookingError("You can only cancel your own reservations.");
    }
    if (booking.status !== "BOOKED") {
      throw new BookingError("This reservation is already cancelled or completed.");
    }

    // An open reservation that other members already joined doesn't just
    // free up -- whoever joined first inherits hosting so the group keeps
    // the time, and the rest of the joins are untouched. Only an open
    // reservation nobody joined, or a closed one, actually opens back up.
    if (booking.bookingType === "OPEN" && booking.joins.length > 0) {
      const [newHost] = booking.joins;
      const previousHostId = booking.memberId;
      await tx.bookingJoin.delete({ where: { id: newHost.id } });
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { memberId: newHost.memberId },
      });

      notifyInBackground(() =>
        notifyBookingHandedOff(updated, newHost.memberId, previousHostId)
      );
      return updated;
    }

    const cancelledBySomeoneElse = isAdmin && booking.memberId !== memberId;

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    if (cancelledBySomeoneElse) {
      notifyInBackground(() => notifyBookingCancelled(updated));
    }

    return updated;
  });
}

/** Join an open reservation, claiming one amenity for that session. */
export async function joinBooking({
  bookingId,
  memberId,
  amenity,
}: {
  bookingId: string;
  memberId: string;
  amenity: Amenity;
}) {
  let hostBooking: Booking | null = null;

  const join = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOKING_LOCK_KEY})`;

    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { joins: true },
    });
    if (!booking) throw new BookingError("Reservation not found.");
    if (booking.status !== "BOOKED") {
      throw new BookingError("This reservation is no longer available.");
    }
    if (booking.bookingType !== "OPEN") {
      throw new BookingError("This reservation is closed to other members.");
    }
    if (booking.startTime <= new Date()) {
      throw new BookingError("This reservation has already started.");
    }
    if (booking.memberId === memberId) {
      throw new BookingError("You're already hosting this reservation.");
    }
    if (booking.joins.some((j) => j.memberId === memberId)) {
      throw new BookingError("You've already joined this reservation.");
    }

    const claimedCount = booking.joins.filter((j) => j.amenity === amenity).length;
    // The host implicitly occupies one SIM slot.
    const occupied = amenity === "SIM" ? claimedCount + 1 : claimedCount;
    if (occupied >= AMENITY_CAPACITY[amenity]) {
      throw new BookingError(`${amenityLabel(amenity)} is already claimed for that session.`);
    }

    hostBooking = booking;
    return tx.bookingJoin.create({
      data: { bookingId, memberId, amenity },
    });
  });

  if (hostBooking) {
    const booking: Booking = hostBooking;
    notifyInBackground(() =>
      notifyHostJoined({
        hostId: booking.memberId,
        joinerId: memberId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amenity,
      })
    );
  }

  return join;
}

export async function leaveBooking({
  bookingId,
  memberId,
}: {
  bookingId: string;
  memberId: string;
}) {
  const join = await prisma.bookingJoin.findUnique({
    where: { bookingId_memberId: { bookingId, memberId } },
  });
  if (!join) throw new BookingError("You haven't joined this reservation.");
  await prisma.bookingJoin.delete({ where: { id: join.id } });
}

export { amenityLabel };
