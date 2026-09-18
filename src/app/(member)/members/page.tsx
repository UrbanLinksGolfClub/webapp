import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMembershipType } from "@/lib/format";

export default async function MembersDirectoryPage() {
  const members = await prisma.member.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, membershipType: true },
  });

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
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="border border-ul-cream-dark bg-ul-white p-5 transition-colors hover:border-ul-green"
            >
              <div className="font-heading text-lg text-ul-green">{m.name}</div>
              <div className="mt-1 font-heading text-[9.5px] tracking-[0.2em] text-ul-gold-dark">
                {formatMembershipType(m.membershipType).toUpperCase()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
