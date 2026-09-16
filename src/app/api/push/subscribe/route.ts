import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const authKey = body?.keys?.auth;

  if (typeof endpoint !== "string" || typeof p256dh !== "string" || typeof authKey !== "string") {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { memberId: session.user.id, p256dh, auth: authKey },
    create: { memberId: session.user.id, endpoint, p256dh, auth: authKey },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
