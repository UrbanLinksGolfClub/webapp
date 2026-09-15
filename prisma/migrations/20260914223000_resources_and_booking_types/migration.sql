-- Rename membership tier: Full Reign -> Raccoon Rate (12am-8am restricted tier)
ALTER TYPE "MembershipType" RENAME VALUE 'FULL_REIGN' TO 'RACCOON_RATE';

-- Drop old bay-based booking model in favor of a single-facility,
-- multi-resource model (closed vs. open bookings).
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_no_overlap";
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_bayId_fkey";
DROP INDEX IF EXISTS "bookings_bayId_status_startTime_idx";
ALTER TABLE "bookings" DROP COLUMN "bayId";
DROP TABLE "bays";

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('CLOSED', 'OPEN');

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- AlterTable: bookings now carry a booking type and an optional resource
-- (null resourceId means the booking is CLOSED -- the whole facility).
ALTER TABLE "bookings" ADD COLUMN "bookingType" "BookingType" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "bookings" ALTER COLUMN "bookingType" DROP DEFAULT;
ALTER TABLE "bookings" ADD COLUMN "resourceId" TEXT;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "bookings_resourceId_status_startTime_idx" ON "bookings"("resourceId", "status", "startTime");

-- CreateIndex
CREATE INDEX "bookings_bookingType_status_startTime_idx" ON "bookings"("bookingType", "status", "startTime");

-- No two CLOSED bookings (whole-facility reservations) may ever overlap.
-- Capacity sharing for OPEN bookings is enforced at the application layer
-- (inside a transaction serialized with a Postgres advisory lock), since
-- "up to N concurrent" isn't expressible as a simple exclusion constraint.
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_closed_no_overlap"
  EXCLUDE USING gist (
    tsrange("startTime", "endTime") WITH &&
  )
  WHERE (status = 'BOOKED' AND "bookingType" = 'CLOSED');
