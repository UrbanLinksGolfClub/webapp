import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { sendPushToMember } from "@/lib/push";
import { amenityLabel } from "@/lib/amenities";
import type { Amenity, Booking } from "@/generated/prisma/client";

function formatSlot(start: Date, end: Date) {
  const day = start.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTime = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day}, ${startTime}–${endTime}`;
}

async function notifyMember(
  memberId: string,
  opts: { subject: string; html: string; title: string; body: string }
) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  await Promise.all([
    sendEmail({ to: member.email, subject: opts.subject, html: opts.html }),
    sendPushToMember(memberId, {
      title: opts.title,
      body: opts.body,
      url: "/club/reservations",
    }),
  ]);
}

export async function notifyBookingConfirmed(booking: Booking) {
  const slot = formatSlot(booking.startTime, booking.endTime);
  const kind = booking.bookingType === "OPEN" ? "open" : "closed";
  await notifyMember(booking.memberId, {
    subject: `Reservation confirmed — ${slot}`,
    html: `<p>Your ${kind} reservation is confirmed for <strong>${slot}</strong>.</p>`,
    title: "Reservation confirmed",
    body: slot,
  });
}

export async function notifyHostJoined({
  hostId,
  joinerId,
  startTime,
  endTime,
  amenity,
}: {
  hostId: string;
  joinerId: string;
  startTime: Date;
  endTime: Date;
  amenity: Amenity;
}) {
  const joiner = await prisma.member.findUnique({ where: { id: joinerId } });
  if (!joiner) return;

  const slot = formatSlot(startTime, endTime);
  const amenityText = amenityLabel(amenity).toLowerCase();
  await notifyMember(hostId, {
    subject: `${joiner.name} joined your reservation`,
    html: `<p><strong>${joiner.name}</strong> joined your ${slot} reservation (${amenityText}).</p>`,
    title: `${joiner.name} joined you`,
    body: `${slot} · ${amenityText}`,
  });
}

export async function notifyBookingCancelled(booking: Booking) {
  const slot = formatSlot(booking.startTime, booking.endTime);
  await notifyMember(booking.memberId, {
    subject: `Reservation cancelled — ${slot}`,
    html: `<p>Your reservation for <strong>${slot}</strong> was cancelled by an admin.</p>`,
    title: "Reservation cancelled",
    body: slot,
  });
}
