"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Forbidden");
}

export type CreateEventState = { error?: string; success?: boolean };

const PHOTO_KEYS = [
  "BAY_LOUNGE_WIDE",
  "BAY_LOUNGE_FULL",
  "CLUB_INTERIOR",
  "LOUNGE",
  "SIMULATOR",
  "UNEEKOR_CAMERA",
  "DATA_OVERLAY",
  "SWING",
  "PEBBLE_BEACH",
] as const;

export async function createEventAction(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  await requireAdmin();

  const title = formData.get("title");
  const description = formData.get("description");
  const location = formData.get("location");
  const startTime = formData.get("startTime");
  const rsvpDeadline = formData.get("rsvpDeadline");
  const photoKey = formData.get("photoKey");

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Title is required." };
  }
  if (typeof startTime !== "string" || !startTime) {
    return { error: "Start time is required." };
  }
  if (typeof photoKey !== "string" || !PHOTO_KEYS.includes(photoKey as (typeof PHOTO_KEYS)[number])) {
    return { error: "Invalid photo." };
  }

  await prisma.event.create({
    data: {
      title: title.trim(),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      location: typeof location === "string" && location.trim() ? location.trim() : null,
      startTime: new Date(startTime),
      rsvpDeadline:
        typeof rsvpDeadline === "string" && rsvpDeadline ? new Date(rsvpDeadline) : null,
      photoKey: photoKey as (typeof PHOTO_KEYS)[number],
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/club");
  return { success: true };
}

export async function deleteEventAction(eventId: string) {
  await requireAdmin();
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/club");
}

export async function rsvpEventAction(eventId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.eventRsvp.upsert({
    where: { eventId_memberId: { eventId, memberId: session.user.id } },
    update: {},
    create: { eventId, memberId: session.user.id },
  });
  revalidatePath("/events");
  revalidatePath("/club");
}

export async function cancelRsvpAction(eventId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.eventRsvp.deleteMany({
    where: { eventId, memberId: session.user.id },
  });
  revalidatePath("/events");
  revalidatePath("/club");
}
