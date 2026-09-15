import Link from "next/link";
import { prisma } from "@/lib/db";
import { setMemberStatusAction } from "@/lib/actions/admin-actions";
import { formatMembershipType } from "@/lib/format";

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = members.filter((m) => m.status === "PENDING");
  const others = members.filter((m) => m.status !== "PENDING");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Members</h1>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-2 font-medium text-amber-700 dark:text-amber-500">
            Pending approval ({pending.length})
          </h2>
          <MemberTable members={pending} />
        </section>
      )}

      <section>
        <h2 className="mb-2 font-medium">All members</h2>
        <MemberTable members={others} />
      </section>
    </div>
  );
}

function MemberTable({
  members,
}: {
  members: {
    id: string;
    name: string;
    email: string;
    status: string;
    role: string;
    membershipType: string | null;
  }[];
}) {
  if (members.length === 0) {
    return <p className="text-sm text-ul-text-muted">None.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-ul-cream-dark">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ul-cream-dark text-ul-text-muted">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Membership</th>
            <th className="p-3">Status</th>
            <th className="p-3">Role</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ul-cream-dark">
          {members.map((m) => (
            <tr key={m.id}>
              <td className="p-3">
                <Link href={`/admin/members/${m.id}`} className="text-ul-green underline">
                  {m.name}
                </Link>
              </td>
              <td className="p-3 text-ul-green">{m.email}</td>
              <td className="p-3 text-ul-green">{formatMembershipType(m.membershipType)}</td>
              <td className="p-3 text-ul-green">{m.status}</td>
              <td className="p-3 text-ul-green">{m.role}</td>
              <td className="p-3">
                <div className="flex gap-3">
                  {m.status !== "APPROVED" && (
                    <form
                      action={async () => {
                        "use server";
                        await setMemberStatusAction(m.id, "APPROVED");
                      }}
                    >
                      <button type="submit" className="text-green-700 underline dark:text-green-500">
                        Approve
                      </button>
                    </form>
                  )}
                  {m.status !== "SUSPENDED" && (
                    <form
                      action={async () => {
                        "use server";
                        await setMemberStatusAction(m.id, "SUSPENDED");
                      }}
                    >
                      <button type="submit" className="text-red-700 underline dark:text-red-500">
                        Suspend
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
