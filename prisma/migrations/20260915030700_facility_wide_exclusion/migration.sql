-- The club is a single physical facility: there is only ever one booking
-- (open or closed) occupying a given time slot. Broaden the old CLOSED-only
-- exclusion constraint to cover every booking, regardless of type.
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_closed_no_overlap";

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    tsrange("startTime", "endTime") WITH &&
  )
  WHERE (status = 'BOOKED');
