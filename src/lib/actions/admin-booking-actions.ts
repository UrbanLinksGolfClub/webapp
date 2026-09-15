"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createBooking, BookingError } from "@/lib/booking";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function toggleNoShowAction(bookingId: string) {
  await requireAdmin();
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  await prisma.booking.update({
    where: { id: bookingId },
    data: { noShow: !booking.noShow },
  });
  revalidatePath("/admin/book");
}

export type BlockClubState = { error?: string; success?: boolean };

export async function blockClubAction(
  _prevState: BlockClubState,
  formData: FormData
): Promise<BlockClubState> {
  const session = await requireAdmin();

  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  if (typeof startTime !== "string" || typeof endTime !== "string") {
    return { error: "Start and end time are required." };
  }

  try {
    await createBooking({
      memberId: session.user.id,
      bookingType: "CLOSED",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/book");
  return { success: true };
}
