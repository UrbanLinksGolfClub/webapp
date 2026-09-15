"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cancelBooking } from "@/lib/booking";

export async function cancelBookingAction(bookingId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await cancelBooking({
    bookingId,
    memberId: session.user.id,
    isAdmin: session.user.role === "ADMIN",
  });

  revalidatePath("/club");
  revalidatePath("/club/reservations");
  revalidatePath("/admin/book");
}
