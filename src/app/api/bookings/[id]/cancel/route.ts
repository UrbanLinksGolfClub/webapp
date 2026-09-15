import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelBooking, BookingError } from "@/lib/booking";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/bookings/[id]/cancel">
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const booking = await cancelBooking({
      bookingId: id,
      memberId: session.user.id,
      isAdmin: session.user.role === "ADMIN",
    });
    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
