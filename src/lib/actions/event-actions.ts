"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseClubDateTimeLocal } from "@/lib/time";

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

// Stored as a data: URI directly on the row rather than in separate object
// storage -- simplest option for a small club app with occasional admin
// uploads, no new service/signup needed. Capped well under what would
// meaningfully bloat the table.
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

type CommonEventFields = {
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date;
  rsvpDeadline: Date | null;
  photoKey: (typeof PHOTO_KEYS)[number];
};

function parseCommonEventFields(formData: FormData): CommonEventFields | { error: string } {
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

  return {
    title: title.trim(),
    description: typeof description === "string" && description.trim() ? description.trim() : null,
    location: typeof location === "string" && location.trim() ? location.trim() : null,
    startTime: parseClubDateTimeLocal(startTime),
    rsvpDeadline:
      typeof rsvpDeadline === "string" && rsvpDeadline
        ? parseClubDateTimeLocal(rsvpDeadline)
        : null,
    photoKey: photoKey as (typeof PHOTO_KEYS)[number],
  };
}

/** Returns null if no file was uploaded (leave the existing photo alone),
 * { photoUrl } if one was, or { error } if it failed validation. */
async function parsePhotoUpload(
  formData: FormData
): Promise<{ photoUrl: string } | { error: string } | null> {
  const photoFile = formData.get("photo");
  if (!(photoFile instanceof File) || photoFile.size === 0) return null;

  if (!photoFile.type.startsWith("image/")) {
    return { error: "Uploaded photo must be an image file." };
  }
  if (photoFile.size > MAX_PHOTO_BYTES) {
    return { error: "Uploaded photo must be smaller than 4MB." };
  }
  const buffer = Buffer.from(await photoFile.arrayBuffer());
  return { photoUrl: `data:${photoFile.type};base64,${buffer.toString("base64")}` };
}

export async function createEventAction(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  await requireAdmin();

  const fields = parseCommonEventFields(formData);
  if ("error" in fields) return fields;

  const photoResult = await parsePhotoUpload(formData);
  if (photoResult && "error" in photoResult) return photoResult;

  await prisma.event.create({
    data: {
      ...fields,
      photoUrl: photoResult?.photoUrl ?? null,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/club");
  return { success: true };
}

export async function updateEventAction(
  eventId: string,
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  await requireAdmin();

  const fields = parseCommonEventFields(formData);
  if ("error" in fields) return fields;

  const photoResult = await parsePhotoUpload(formData);
  if (photoResult && "error" in photoResult) return photoResult;

  const removePhoto = formData.get("removePhoto") === "on";

  await prisma.event.update({
    where: { id: eventId },
    data: {
      ...fields,
      // Leave photoUrl untouched unless a new file was uploaded or the
      // admin explicitly asked to remove the current one.
      ...(photoResult ? { photoUrl: photoResult.photoUrl } : removePhoto ? { photoUrl: null } : {}),
    },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
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
  redirect("/admin/events");
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
