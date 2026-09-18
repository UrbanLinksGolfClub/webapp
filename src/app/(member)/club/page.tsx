import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MAX_STANDING_BOOKINGS } from "@/lib/booking";
import { getRecentNotifications } from "@/lib/notifications";
import { PHOTO_SRC } from "@/lib/photos";
import { CLUB_TIMEZONE, formatClubDate, formatClubTime } from "@/lib/time";
import { ClubBookingWidget } from "./club-booking-widget";
import { OpenReservationsSection } from "./open-reservations-section";

export default async function ClubPage() {
  const session = await auth();
  const memberId = session!.user.id;
  const now = new Date();

  const [member, upcomingHostBookings, standingCount, openReservations, nextEvent, notifications] =
    await Promise.all([
      prisma.member.findUniqueOrThrow({ where: { id: memberId } }),
      prisma.booking.findMany({
        where: { memberId, status: "BOOKED", startTime: { gt: now } },
        orderBy: { startTime: "asc" },
        include: { joins: { include: { member: true } } },
        take: 1,
      }),
      prisma.booking.count({
        where: { memberId, status: "BOOKED", startTime: { gt: now } },
      }),
      prisma.booking.findMany({
        where: {
          bookingType: "OPEN",
          status: "BOOKED",
          memberId: { not: memberId },
          startTime: { gt: now },
        },
        include: {
          member: { select: { name: true } },
          joins: { include: { member: { select: { name: true } } } },
        },
        orderBy: { startTime: "asc" },
        take: 6,
      }),
      prisma.event.findFirst({
        where: { startTime: { gt: now } },
        orderBy: { startTime: "asc" },
        include: { _count: { select: { rsvps: true } } },
      }),
      getRecentNotifications(memberId),
    ]);

  const upNext = upcomingHostBookings[0];
  const isRaccoonRate = member.membershipType === "RACCOON_RATE";

  return (
    <div>
      {notifications.length > 0 && (
        <div className="border-b border-ul-cream-dark bg-ul-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-3">
            <span className="shrink-0 font-heading text-[9.5px] font-semibold tracking-[0.24em] text-ul-gold-dark">
              RECENT
            </span>
            {notifications.map((n, i) => (
              <span key={n.id} className="flex items-center gap-4 text-sm">
                {i > 0 && <span className="h-3.5 w-px bg-ul-cream-dark" />}
                <span className={i === 0 ? "text-ul-text" : "text-ul-text-muted"}>{n.text}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hero: up next for you */}
      <div className="relative overflow-hidden bg-ul-green-dark">
        <Image
          src={PHOTO_SRC.BAY_LOUNGE_WIDE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(30,50,40,.95) 0%, rgba(30,50,40,.62) 100%)",
          }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 py-9 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-gold">
              UP NEXT FOR YOU
            </div>
            {upNext ? (
              <>
                <h1 className="mt-2 font-heading text-3xl font-medium leading-tight text-ul-cream sm:text-4xl sm:leading-none md:text-5xl">
                  {formatUpNext(upNext.startTime)}
                </h1>
                <p className="font-accent mt-2 text-lg italic text-ul-cream/95">
                  {durationLabel(upNext.startTime, upNext.endTime)},{" "}
                  {upNext.bookingType === "OPEN" ? "open" : "closed"}
                  {upNext.joins.length > 0 &&
                    ` — ${upNext.joins.map((j) => j.member.name).join(" and ")} joined you`}
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-2 font-heading text-3xl font-medium leading-tight text-ul-cream sm:text-4xl sm:leading-none md:text-5xl">
                  NOTHING BOOKED
                </h1>
                <p className="font-accent mt-2 text-lg italic text-ul-cream/95">
                  Grab a time below whenever you&apos;re ready
                </p>
              </>
            )}
            <Link
              href="/club/reservations"
              className="mt-4 inline-block border border-ul-cream/40 px-4 py-2 font-heading text-[10px] tracking-[0.18em] text-ul-cream transition-colors hover:border-ul-gold hover:text-ul-gold"
            >
              MY RESERVATIONS
            </Link>
          </div>
          <div className="shrink-0 sm:text-right">
            <div className="font-heading text-[10px] tracking-[0.2em] text-ul-cream/75">
              STANDING RESERVATIONS
            </div>
            <div className="mt-2 flex justify-start gap-1.5 sm:justify-end">
              {Array.from({ length: MAX_STANDING_BOOKINGS }, (_, i) => (
                <span
                  key={i}
                  className={`block h-1.5 w-8 ${i < standingCount ? "bg-ul-gold" : "bg-ul-cream/25"}`}
                />
              ))}
            </div>
            <div className="mt-2 text-xs text-ul-cream/85">
              {standingCount} used · {MAX_STANDING_BOOKINGS - standingCount} available
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Open reservations -- what's joinable right now, front and center */}
        <div className="mb-9">
          <div className="mb-4 font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
            OPEN RESERVATIONS — JOIN FREE
          </div>
          <OpenReservationsSection
            initial={openReservations.map((b) => ({
              ...b,
              startTime: b.startTime.toISOString(),
              endTime: b.endTime.toISOString(),
            }))}
          />
        </div>

        {/* Full day schedule -- book any open time slot */}
        <div className="mb-9">
          <div className="mb-4 font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
            BOOK A TIME
          </div>
          <ClubBookingWidget standingCount={standingCount} isRaccoonRate={isRaccoonRate} />
        </div>

        <div>
          <div className="mb-4 font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
            ON THE CALENDAR
          </div>
          {nextEvent ? (
            <div className="max-w-md">
              <div className="relative h-[186px] overflow-hidden">
                <Image
                  src={PHOTO_SRC[nextEvent.photoKey]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 448px, 100vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(30,50,40,.92) 0%, rgba(30,50,40,.15) 70%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="font-heading text-[9px] tracking-[0.24em] text-ul-gold">
                    {formatClubDate(nextEvent.startTime, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {formatClubTime(nextEvent.startTime, { hour: "numeric" })}
                  </div>
                  <div className="mt-1 font-heading text-2xl text-ul-cream">{nextEvent.title}</div>
                  <div className="mt-1 text-xs text-ul-cream/75">
                    {nextEvent._count.rsvps} members in
                    {nextEvent.rsvpDeadline &&
                      ` · RSVP by ${formatClubDate(nextEvent.rsvpDeadline, { weekday: "long" })}`}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <Link
                  href={`/events#${nextEvent.id}`}
                  className="flex-1 bg-ul-green px-4 py-3 text-center font-heading text-[10.5px] tracking-[0.18em] text-ul-cream transition-colors hover:bg-ul-green-light"
                >
                  RSVP
                </Link>
                <Link
                  href="/events"
                  className="flex-1 border border-ul-cream-dark bg-ul-white px-4 py-3 text-center font-heading text-[10.5px] tracking-[0.18em] text-ul-green transition-colors hover:border-ul-green"
                >
                  ALL EVENTS
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ul-text-muted">Nothing on the calendar yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function clubDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CLUB_TIMEZONE }).format(d);
}

function formatUpNext(start: Date): string {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const time = formatClubTime(start, { hour: "numeric" });
  if (clubDateKey(start) === clubDateKey(now)) return `TODAY, ${time}`;
  if (clubDateKey(start) === clubDateKey(tomorrow)) return `TOMORROW, ${time}`;
  return `${formatClubDate(start, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}, ${time}`;
}

function durationLabel(start: Date, end: Date): string {
  const hours = Math.round((end.getTime() - start.getTime()) / (60 * 60 * 1000));
  return hours === 1 ? "One hour" : `${hours} hours`;
}
