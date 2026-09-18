import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PHOTO_SRC } from "@/lib/photos";
import { formatClubDate, formatClubTime } from "@/lib/time";
import { RsvpButton } from "./rsvp-button";

export default async function EventsPage() {
  const session = await auth();
  const memberId = session!.user.id;

  const events = await prisma.event.findMany({
    where: { startTime: { gt: new Date() } },
    orderBy: { startTime: "asc" },
    include: {
      _count: { select: { rsvps: true } },
      rsvps: { where: { memberId }, select: { id: true } },
    },
  });

  const [hero, ...rest] = events;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="border-b border-ul-cream-dark pb-6">
        <div className="font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-gold-dark">
          THE CLUB YEAR
        </div>
        <h1 className="mt-2 font-heading text-4xl text-ul-green sm:text-5xl">
          WHAT&apos;S COMING UP
        </h1>
      </div>

      {events.length === 0 ? (
        <p className="mt-8 text-sm text-ul-text-muted">Nothing on the calendar yet.</p>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {hero && (
            <div id={hero.id} className="relative col-span-2 row-span-2 min-h-[430px] overflow-hidden">
              <Image
                src={PHOTO_SRC[hero.photoKey]}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                priority
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(0deg, rgba(30,50,40,.95) 0%, rgba(30,50,40,.08) 65%)" }}
              />
              <div className="absolute left-5 top-5 bg-ul-gold px-3 py-1.5 font-heading text-[9.5px] font-semibold tracking-[0.2em] text-ul-green-dark">
                NEXT UP
              </div>
              <div className="absolute inset-x-0 bottom-0 p-7">
                <div className="font-heading text-[11px] tracking-[0.24em] text-ul-gold">
                  {formatClubDate(hero.startTime, { weekday: "short", month: "short", day: "numeric" })}{" "}
                  · {formatClubTime(hero.startTime, { hour: "numeric" })}
                </div>
                <h2 className="mt-2 font-heading text-4xl leading-tight text-ul-cream">
                  {hero.title}
                </h2>
                {hero.description && (
                  <p className="font-accent mt-2 text-lg italic text-ul-cream/85">
                    {hero.description}
                  </p>
                )}
                <div className="mt-5">
                  <RsvpButton eventId={hero.id} initiallyIn={hero.rsvps.length > 0} />
                  <span className="ml-4 text-xs text-ul-cream/70">
                    {hero._count.rsvps} in
                    {hero.rsvpDeadline &&
                      ` · RSVP by ${formatClubDate(hero.rsvpDeadline, { weekday: "long" })}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {rest.map((e) => (
            <div key={e.id} id={e.id} className="relative col-span-2 min-h-[207px] overflow-hidden sm:col-span-1">
              <Image
                src={PHOTO_SRC[e.photoKey]}
                alt=""
                fill
                sizes="(min-width: 640px) 25vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(0deg, rgba(30,50,40,.93), rgba(30,50,40,.15))" }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-heading text-[9px] tracking-[0.22em] text-ul-gold">
                  {formatClubDate(e.startTime, { weekday: "short", month: "short", day: "numeric" })}{" "}
                  · {formatClubTime(e.startTime, { hour: "numeric" })}
                </div>
                <div className="mt-1 font-heading text-xl leading-tight text-ul-cream">
                  {e.title}
                </div>
                <div className="mt-1 text-xs text-ul-cream/75">{e._count.rsvps} in</div>
              </div>
              <div className="absolute right-3 top-3">
                <RsvpButton eventId={e.id} initiallyIn={e.rsvps.length > 0} variant="outline" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
