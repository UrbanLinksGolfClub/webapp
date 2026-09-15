import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditMemberForm } from "./edit-member-form";

export default async function AdminMemberDetailPage(
  props: PageProps<"/admin/members/[id]">
) {
  const { id } = await props.params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{member.name}</h1>
        <p className="text-sm text-ul-text-muted">
          {member.email} {member.phone ? `· ${member.phone}` : ""}
        </p>
      </div>
      <EditMemberForm member={member} />
    </div>
  );
}
