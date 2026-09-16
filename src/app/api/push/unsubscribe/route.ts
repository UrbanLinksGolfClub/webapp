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
  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, memberId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
