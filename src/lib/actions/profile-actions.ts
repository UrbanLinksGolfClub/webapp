"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const selfProfileSchema = z.object({
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  sgtUsername: z.string().trim().optional(),
});

export type UpdateProfileState = { error?: string; success?: boolean };

export async function updateOwnProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = selfProfileSchema.safeParse({
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    sgtUsername: formData.get("sgtUsername") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.member.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/profile");
  return { success: true };
}
