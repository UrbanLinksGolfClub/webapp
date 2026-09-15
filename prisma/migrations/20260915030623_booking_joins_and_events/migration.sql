/*
  Warnings:

  - You are about to drop the column `resourceId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the `resources` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Amenity" AS ENUM ('SIM', 'LOUNGE', 'GREEN', 'TABLE');

-- CreateEnum
CREATE TYPE "PhotoKey" AS ENUM ('BAY_LOUNGE_WIDE', 'BAY_LOUNGE_FULL', 'CLUB_INTERIOR', 'LOUNGE', 'SIMULATOR', 'UNEEKOR_CAMERA', 'DATA_OVERLAY', 'SWING', 'PEBBLE_BEACH');

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_resourceId_fkey";

-- DropIndex
DROP INDEX "bookings_resourceId_status_startTime_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "resourceId";

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "sgtUsername" TEXT;

-- DropTable
DROP TABLE "resources";

-- CreateTable
CREATE TABLE "booking_joins" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amenity" "Amenity" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_joins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "rsvpDeadline" TIMESTAMP(3),
    "photoKey" "PhotoKey" NOT NULL DEFAULT 'CLUB_INTERIOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_rsvps" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_joins_bookingId_amenity_idx" ON "booking_joins"("bookingId", "amenity");

-- CreateIndex
CREATE UNIQUE INDEX "booking_joins_bookingId_memberId_key" ON "booking_joins"("bookingId", "memberId");

-- CreateIndex
CREATE INDEX "events_startTime_idx" ON "events"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "event_rsvps_eventId_memberId_key" ON "event_rsvps"("eventId", "memberId");

-- AddForeignKey
ALTER TABLE "booking_joins" ADD CONSTRAINT "booking_joins_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_joins" ADD CONSTRAINT "booking_joins_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
