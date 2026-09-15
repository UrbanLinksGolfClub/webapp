/*
  Warnings:

  - The `membershipType` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('FOUNDING_MEMBER', 'FULL_REIGN');

-- AlterTable
ALTER TABLE "members" DROP COLUMN "membershipType",
ADD COLUMN     "membershipType" "MembershipType";
