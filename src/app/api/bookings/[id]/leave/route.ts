import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { leaveBooking, BookingError } from "@/lib/booking";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/bookings/[id]/leave">
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    await leaveBooking({ bookingId: id, memberId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to leave reservation" }, { status: 500 });
  }
}
