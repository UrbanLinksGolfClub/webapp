import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatClubDateTime, formatClubDateTimeLocal } from "@/lib/time";
import { deleteEventAction } from "@/lib/actions/event-actions";
import { EditEventForm } from "./edit-event-form";

export default async function AdminEditEventPage(props: PageProps<"/admin/events/[id]">) {
  const { id } = await props.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      rsvps: {
        orderBy: { createdAt: "asc" },
        include: { member: { select: { name: true, email: true, phone: true } } },
      },
    },
  });
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{event.title}</h1>
        <Link href="/admin/events" className="text-sm text-ul-green underline">
          ← Back to events
        </Link>
      </div>

      <EditEventForm
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          startTimeLocal: formatClubDateTimeLocal(event.startTime),
          rsvpDeadlineLocal: event.rsvpDeadline ? formatClubDateTimeLocal(event.rsvpDeadline) : null,
          photoKey: event.photoKey,
          photoUrl: event.photoUrl,
        }}
      />

      <div id="rsvps" className="max-w-2xl">
        <h2 className="mb-3 font-heading text-[10px] font-semibold tracking-[0.28em] text-ul-text-muted">
          RSVPS ({event.rsvps.length})
        </h2>
        <div className="overflow-x-auto border border-ul-cream-dark bg-ul-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ul-cream-dark text-ul-text-muted">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">RSVPed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ul-cream-dark">
              {event.rsvps.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 text-ul-green">{r.member.name}</td>
                  <td className="p-3 text-ul-green">{r.member.email}</td>
                  <td className="p-3 text-ul-green">{r.member.phone ?? "—"}</td>
                  <td className="p-3 text-ul-text-muted">
                    {formatClubDateTime(r.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
              {event.rsvps.length === 0 && (
                <tr>
                  <td className="p-3 text-ul-text-muted" colSpan={4}>
                    No RSVPs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await deleteEventAction(event.id);
        }}
      >
        <button type="submit" className="text-sm text-red-700 underline">
          Delete this event
        </button>
      </form>
    </div>
  );
}
