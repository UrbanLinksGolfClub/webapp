import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createBooking, BookingError } from "@/lib/booking";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      status: "BOOKED",
      startTime: { lt: new Date(to) },
      endTime: { gt: new Date(from) },
    },
    include: {
      member: { select: { id: true, name: true } },
      joins: { include: { member: { select: { id: true, name: true } } } },
    },
    orderBy: { startTime: "asc" },
  });

  // Members can see who's hosting an open session (they might join it),
  // but never who booked a closed one -- redact server-side rather than
  // just hiding it in the UI, since otherwise the name would still be
  // sitting in the response JSON for anyone to read via devtools.
  const sanitized = bookings.map((b) => ({
    ...b,
    member: b.bookingType === "OPEN" ? b.member : null,
  }));

  return NextResponse.json({ bookings: sanitized });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bookingType, startTime, endTime } = body ?? {};

  if (
    (bookingType !== "OPEN" && bookingType !== "CLOSED") ||
    typeof startTime !== "string" ||
    typeof endTime !== "string"
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const booking = await createBooking({
      memberId: session.user.id,
      bookingType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
