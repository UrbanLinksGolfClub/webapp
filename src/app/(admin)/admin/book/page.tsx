import { prisma } from "@/lib/db";
import { BlockClubForm } from "./block-club-form";
import { WeekCalendar } from "./week-calendar";

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default async function AdminBookPage() {
  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "BOOKED",
      startTime: { lt: weekEnd },
      endTime: { gt: weekStart },
    },
    include: { member: true, joins: { include: { member: true } } },
    orderBy: { startTime: "asc" },
  });

  const hoursBooked = bookings.reduce(
    (sum, b) => sum + (b.endTime.getTime() - b.startTime.getTime()) / (60 * 60 * 1000),
    0
  );
  const distinctMembers = new Set(bookings.map((b) => b.memberId));
  const totalMembers = await prisma.member.count({ where: { status: "APPROVED" } });
  const noShows = bookings.filter((b) => b.noShow).length;
  const utilization = Math.round((hoursBooked / (24 * 7)) * 100);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="font-heading text-[9.5px] font-semibold tracking-[0.28em] text-ul-gold-dark">
            {weekStart.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}
            {" — "}
            {new Date(weekEnd.getTime() - 1).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}
          </div>
          <h1 className="mt-1 font-heading text-3xl text-ul-green">THE BOOK</h1>
        </div>
        <BlockClubForm />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <WeekCalendar weekStart={weekStart.toISOString()} bookings={bookings.map(serialize)} />

        <div>
          <div className="border border-ul-cream-dark bg-ul-white p-5">
            <div className="font-heading text-[9.5px] font-semibold tracking-[0.28em] text-ul-text-muted">
              THIS WEEK
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Hours booked" value={hoursBooked.toFixed(0)} />
              <Row label="Utilisation" value={`${utilization}%`} />
              <Row
                label="Distinct members in"
                value={`${distinctMembers.size} of ${totalMembers}`}
              />
              <Row label="No-shows flagged" value={String(noShows)} accent />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ul-text-muted">{label}</dt>
      <dd className={`font-heading text-base ${accent ? "text-ul-gold-dark" : "text-ul-green"}`}>
        {value}
      </dd>
    </div>
  );
}

function serialize(b: {
  id: string;
  bookingType: string;
  startTime: Date;
  endTime: Date;
  noShow: boolean;
  member: { name: string };
  joins: { amenity: string; member: { name: string } }[];
}) {
  return {
    id: b.id,
    bookingType: b.bookingType as "OPEN" | "CLOSED",
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    noShow: b.noShow,
    hostName: b.member.name,
    joins: b.joins.map((j) => ({ amenity: j.amenity, memberName: j.member.name })),
  };
}
