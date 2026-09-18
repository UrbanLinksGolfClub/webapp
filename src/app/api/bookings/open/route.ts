import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openReservations = await prisma.booking.findMany({
    where: {
      bookingType: "OPEN",
      status: "BOOKED",
      memberId: { not: session.user.id },
      startTime: { gt: new Date() },
    },
    include: {
      member: { select: { name: true } },
      joins: { include: { member: { select: { name: true } } } },
    },
    orderBy: { startTime: "asc" },
    take: 6,
  });

  return NextResponse.json({ openReservations });
}
