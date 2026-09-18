import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatMembershipType } from "@/lib/format";
import { PinDisplay } from "./pin-display";
import { ProfileForm } from "./profile-form";
import { PushOptIn } from "@/components/push-opt-in";
import { SgtStatsCard } from "@/components/sgt-stats-card";
import { formatClubDate } from "@/lib/time";

export default async function ProfilePage() {
  const session = await auth();
  const member = await prisma.member.findUniqueOrThrow({
    where: { id: session!.user.id },
  });

  const memberSince = formatClubDate(member.createdAt, {
    month: "long",
    year: "numeric",
  });

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
        <SgtStatsCard
          sgtUsername={member.sgtUsername}
          emptyMessage="Link your SGT handle above to pull in your stats."
        />
      </div>
    </div>
  );
}
