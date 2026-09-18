import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMembershipType } from "@/lib/format";
import { getMemberHandicap } from "@/lib/sgt/handicap";

export default async function MembersDirectoryPage() {
  const members = await prisma.member.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, membershipType: true, sgtUsername: true },
  });

  // Run in parallel -- each lookup is independently cached, but a member
  // list this size shouldn't wait on N sequential SGT round-trips.
  const handicaps = await Promise.all(
    members.map((m) => getMemberHandicap(m.sgtUsername))
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="border-b border-ul-cream-dark pb-6">
        <div className="font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-gold-dark">
          THE CLUB
        </div>
        <h1 className="mt-2 font-heading text-4xl text-ul-green sm:text-5xl">MEMBERS</h1>
      </div>

      {members.length === 0 ? (
        <p className="mt-8 text-sm text-ul-text-muted">No members yet.</p>
      ) : (
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="flex items-start justify-between gap-3 border border-ul-cream-dark bg-ul-white p-5 transition-colors hover:border-ul-green"
            >
              <div>
                <div className="font-heading text-lg text-ul-green">{m.name}</div>
                <div className="mt-1 font-heading text-[9.5px] tracking-[0.2em] text-ul-gold-dark">
                  {formatMembershipType(m.membershipType).toUpperCase()}
                </div>
              </div>
              {handicaps[i] && (
                <div className="shrink-0 text-right">
                  <div className="font-heading text-[8.5px] tracking-[0.16em] text-ul-text-muted">
                    HCP
                  </div>
                  <div className="font-heading text-xl text-ul-green">{handicaps[i]}</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
