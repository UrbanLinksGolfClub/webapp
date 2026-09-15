import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { joinBooking, BookingError } from "@/lib/booking";

const VALID_AMENITIES = new Set(["SIM", "LOUNGE", "GREEN", "TABLE"]);

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/bookings/[id]/join">
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();
  const amenity = body?.amenity;

  if (typeof amenity !== "string" || !VALID_AMENITIES.has(amenity)) {
    return NextResponse.json({ error: "Invalid amenity" }, { status: 400 });
  }

  try {
    const join = await joinBooking({
      bookingId: id,
      memberId: session.user.id,
      amenity: amenity as "SIM" | "LOUNGE" | "GREEN" | "TABLE",
    });
    return NextResponse.json({ join }, { status: 201 });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to join reservation" }, { status: 500 });
  }
}
