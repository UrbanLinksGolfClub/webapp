import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMembershipType } from "@/lib/format";
import { formatClubDate } from "@/lib/time";
import { SgtStatsCard } from "@/components/sgt-stats-card";

export default async function MemberProfilePage(props: PageProps<"/members/[id]">) {
  const { id } = await props.params;

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member || member.status !== "APPROVED") notFound();

  const memberSince = formatClubDate(member.createdAt, { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/members"
        className="font-heading text-[10px] tracking-[0.18em] text-ul-green hover:text-ul-gold-dark"
      >
        ← BACK TO MEMBERS
      </Link>

      <div className="mt-5 grid gap-7 lg:grid-cols-[352px_1fr]">
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
        </div>

        <SgtStatsCard sgtUsername={member.sgtUsername} emptyMessage="No SGT handle linked yet." />
      </div>
    </div>
  );
}
