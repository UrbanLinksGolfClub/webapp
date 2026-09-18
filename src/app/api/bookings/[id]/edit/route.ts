import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { editBooking, BookingError } from "@/lib/booking";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/bookings/[id]/edit">
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
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
    const booking = await editBooking({
      bookingId: id,
      memberId: session.user.id,
      bookingType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });
    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to edit reservation" }, { status: 500 });
  }
}
