"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function setMemberStatusAction(
  memberId: string,
  status: "PENDING" | "APPROVED" | "SUSPENDED"
) {
  await requireAdmin();
  await prisma.member.update({ where: { id: memberId }, data: { status } });
  revalidatePath("/admin/members");
}

const profileSchema = z.object({
  address: z.string().trim().optional(),
  membershipType: z.enum(["FOUNDING_MEMBER", "RACCOON_RATE"]).optional(),
  pinCode: z.string().trim().optional(),
  role: z.enum(["MEMBER", "ADMIN"]),
  status: z.enum(["PENDING", "APPROVED", "SUSPENDED"]),
});

export type UpdateMemberState = { error?: string; success?: boolean };

export async function updateMemberAction(
  memberId: string,
  _prevState: UpdateMemberState,
  formData: FormData
): Promise<UpdateMemberState> {
  await requireAdmin();

  const parsed = profileSchema.safeParse({
    address: formData.get("address") || undefined,
    membershipType: formData.get("membershipType") || undefined,
    pinCode: formData.get("pinCode") || undefined,
    role: formData.get("role"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.member.update({
    where: { id: memberId },
    data: parsed.data,
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  return { success: true };
}
