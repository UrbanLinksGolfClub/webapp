import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.member.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash,
        name: "Admin",
        status: "APPROVED",
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin member: ${adminEmail}`);
  } else {
    console.log(
      "SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set - skipping admin member seed."
    );
  }

  const events: {
    title: string;
    description: string;
    location: string;
    startTime: Date;
    rsvpDeadline?: Date;
    photoKey:
      | "PEBBLE_BEACH"
      | "LOUNGE"
      | "UNEEKOR_CAMERA"
      | "SWING"
      | "CLUB_INTERIOR"
      | "BAY_LOUNGE_FULL"
      | "DATA_OVERLAY";
  }[] = [
    {
      title: "The Four Majors — Round One",
      description: "Pebble Beach · three flights",
      location: "Pebble Beach",
      startTime: daysFromNow(5, 18),
      rsvpDeadline: daysFromNow(3, 20),
      photoKey: "PEBBLE_BEACH",
    },
    {
      title: "NFL Sunday",
      description: "Guests welcome",
      location: "The Lounge",
      startTime: daysFromNow(8, 13),
      photoKey: "LOUNGE",
    },
    {
      title: "Fitting Night",
      description: "Uneekor fitting session, limited slots",
      location: "Simulator Bay",
      startTime: daysFromNow(19, 17),
      photoKey: "UNEEKOR_CAMERA",
    },
    {
      title: "Member-Guest",
      description: "Two-man scramble. Bring one.",
      location: "The Club",
      startTime: daysFromNow(28, 16),
      photoKey: "SWING",
    },
    {
      title: "NKY Cup Opens",
      description: "Match play · brackets out",
      location: "The Club",
      startTime: daysFromNow(42, 10),
      photoKey: "CLUB_INTERIOR",
    },
    {
      title: "The Turkey Shoot",
      description: "Closest-to-the-pin all day. Bring the family.",
      location: "The Club",
      startTime: daysFromNow(63, 10),
      photoKey: "BAY_LOUNGE_FULL",
    },
    {
      title: "Club Championship",
      description: "Ten weeks, three flights, one live finale.",
      location: "The Club",
      startTime: daysFromNow(77, 10),
      photoKey: "DATA_OVERLAY",
    },
  ];

  for (const e of events) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (!existing) {
      await prisma.event.create({ data: e });
    }
  }
  console.log(`Seeded ${events.length} event(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
