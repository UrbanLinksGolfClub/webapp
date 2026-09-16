import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatMembershipType } from "@/lib/format";
import { getCachedOrFetch } from "@/lib/sgt/cache";
import { getUserSgtData } from "@/lib/sgt/endpoints";
import { PinDisplay } from "./pin-display";
import { ProfileForm } from "./profile-form";
import { PushOptIn } from "@/components/push-opt-in";

export default async function ProfilePage() {
  const session = await auth();
  const member = await prisma.member.findUniqueOrThrow({
    where: { id: session!.user.id },
  });

  const memberSince = member.createdAt.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  let sgtData: Record<string, unknown> | null = null;
  let sgtError = false;
  if (member.sgtUsername && process.env.SGT_CLUB_URL) {
    try {
      sgtData = await getCachedOrFetch({
        endpoint: "members/user-sgt-data",
        tourId: member.sgtUsername,
        ttlMs: 30 * 60 * 1000,
        fetcher: () => getUserSgtData(member.sgtUsername!),
      });
    } catch {
      sgtError = true;
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-7 px-6 py-8 lg:grid-cols-[352px_1fr]">
      <div>
        <div className="border-t-[3px] border-ul-gold bg-ul-green-dark p-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-heading text-[9.5px] font-semibold tracking-[0.28em] text-ul-gold/90">
                {formatMembershipType(member.membershipType).toUpperCase()}
              </div>
              <h1 className="mt-2 font-heading text-3xl leading-tight text-ul-cream">
                {member.name.toUpperCase()}
              </h1>
              <p className="font-accent mt-1 text-base italic text-ul-cream">
                Member since {memberSince}
              </p>
            </div>
            <Image
              src="/brand/logo-raccoon-gold.png"
              alt=""
              width={44}
              height={44}
              className="opacity-90"
            />
          </div>

          <div className="my-5 h-px bg-ul-gold/30" />

          <div className="font-heading text-[9.5px] tracking-[0.22em] text-ul-cream/70">
            DOOR PIN
          </div>
          <div className="mt-2">
            <PinDisplay pin={member.pinCode} />
          </div>
          <p className="mt-3 text-xs text-ul-cream/75">Yours alone. Every entry is logged.</p>
        </div>

        <div className="border border-t-0 border-ul-cream-dark bg-ul-white p-6">
          <ProfileForm
            phone={member.phone}
            address={member.address}
            sgtUsername={member.sgtUsername}
          />
        </div>

        <div className="border border-t-0 border-ul-cream-dark bg-ul-white p-6">
          <div className="font-heading text-[9.5px] font-semibold tracking-[0.28em] text-ul-text-muted">
            NOTIFICATIONS
          </div>
          <p className="mt-2 text-sm text-ul-text-muted">
            Get notified by email and on your phone when someone joins your reservation or a
            reservation is cancelled.
          </p>
          <div className="mt-4">
            <PushOptIn />
          </div>
        </div>
      </div>

      <div className="space-y-0">
        <div className="border border-ul-cream-dark bg-ul-white p-6">
          <div className="font-heading text-[9.5px] font-semibold tracking-[0.28em] text-ul-text-muted">
            THE NUMBERS
          </div>
          {!member.sgtUsername ? (
            <p className="mt-3 text-sm text-ul-text-muted">
              Link your SGT handle above to pull in your stats.
            </p>
          ) : !process.env.SGT_CLUB_URL ? (
            <p className="mt-3 text-sm text-ul-text-muted">
              Simulator Golf Tour isn&apos;t connected for the club yet.
            </p>
          ) : sgtError || !sgtData ? (
            <p className="mt-3 text-sm text-ul-text-muted">
              Couldn&apos;t load your SGT stats right now.
            </p>
          ) : (
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {Object.entries(sgtData)
                .filter(([, v]) => typeof v === "number" || typeof v === "string")
                .slice(0, 9)
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
                      {key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toUpperCase()}
                    </dt>
                    <dd className="mt-1 font-heading text-xl text-ul-green">{String(value)}</dd>
                  </div>
                ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
