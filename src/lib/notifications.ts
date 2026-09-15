import { prisma } from "@/lib/db";

export type Notification = { id: string; text: string };

/** Lightweight "recent activity" feed computed live from real rows, rather
 * than a stored notifications table -- keeps this simple while still being
 * real data, not placeholder copy. */
export async function getRecentNotifications(memberId: string): Promise<Notification[]> {
  const now = new Date();
  const notifications: Notification[] = [];

  const recentJoins = await prisma.bookingJoin.findMany({
    where: { booking: { memberId, status: "BOOKED" } },
    include: { member: true, booking: true },
    orderBy: { joinedAt: "desc" },
    take: 3,
  });
  for (const j of recentJoins) {
    notifications.push({
      id: `join-${j.id}`,
      text: `${j.member.name} joined your ${j.booking.startTime.toLocaleDateString(undefined, { weekday: "long" })} reservation`,
    });
  }

  const soonEvent = await prisma.event.findFirst({
    where: { rsvpDeadline: { gt: now, lt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) } },
    orderBy: { rsvpDeadline: "asc" },
  });
  if (soonEvent?.rsvpDeadline) {
    notifications.push({
      id: `event-${soonEvent.id}`,
      text: `${soonEvent.title} RSVP closes ${soonEvent.rsvpDeadline.toLocaleDateString(undefined, { weekday: "long" })}`,
    });
  }

  const newOpen = await prisma.booking.findFirst({
    where: {
      bookingType: "OPEN",
      status: "BOOKED",
      memberId: { not: memberId },
      startTime: { gt: now },
    },
    include: { member: true },
    orderBy: { createdAt: "desc" },
  });
  if (newOpen) {
    notifications.push({
      id: `open-${newOpen.id}`,
      text: `${newOpen.member.name} opened ${newOpen.startTime.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}`,
    });
  }

  return notifications.slice(0, 3);
}
