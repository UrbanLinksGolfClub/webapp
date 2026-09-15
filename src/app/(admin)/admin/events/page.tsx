import { prisma } from "@/lib/db";
import { CreateEventForm } from "./create-event-form";
import { deleteEventAction } from "@/lib/actions/event-actions";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: "asc" },
    include: { _count: { select: { rsvps: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl text-ul-green">EVENTS</h1>

      <div className="max-w-2xl border border-ul-cream-dark bg-ul-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ul-cream-dark text-ul-text-muted">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">When</th>
              <th className="p-3">RSVPs</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ul-cream-dark">
            {events.map((e) => (
              <tr key={e.id}>
                <td className="p-3 text-ul-green">{e.title}</td>
                <td className="p-3 text-ul-green">
                  {e.startTime.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="p-3 text-ul-green">{e._count.rsvps}</td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      await deleteEventAction(e.id);
                    }}
                  >
                    <button type="submit" className="text-red-700 underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td className="p-3 text-ul-text-muted" colSpan={4}>
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateEventForm />
    </div>
  );
}
