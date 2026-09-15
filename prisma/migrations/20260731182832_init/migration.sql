-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "membershipType" TEXT,
    "pinCode" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "bayId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sgt_api_key" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sgt_api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sgt_stats_cache" (
    "id" TEXT NOT NULL,
    "clubUrl" TEXT NOT NULL,
    "tourId" TEXT NOT NULL DEFAULT '',
    "endpoint" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sgt_stats_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "bookings_memberId_status_startTime_idx" ON "bookings"("memberId", "status", "startTime");

-- CreateIndex
CREATE INDEX "bookings_bayId_status_startTime_idx" ON "bookings"("bayId", "status", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "sgt_stats_cache_clubUrl_tourId_endpoint_key" ON "sgt_stats_cache"("clubUrl", "tourId", "endpoint");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "bays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prevent overlapping bookings on the same bay at the database level, regardless of
-- slot length (1h or 2h) or application-layer races. Only "BOOKED" rows are checked --
-- cancelled/completed bookings never conflict.
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "bayId" WITH =,
    tsrange("startTime", "endTime") WITH &&
  )
  WHERE (status = 'BOOKED');
