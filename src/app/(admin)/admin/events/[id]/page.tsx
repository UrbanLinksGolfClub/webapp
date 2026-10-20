import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatClubDateTimeLocal } from "@/lib/time";
import { deleteEventAction } from "@/lib/actions/event-actions";
import { EditEventForm } from "./edit-event-form";

export default async function AdminEditEventPage(props: PageProps<"/admin/events/[id]">) {
  const { id } = await props.params;
  const event = await prisma.event.findUnique({ where: { id } });
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
