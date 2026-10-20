"use client";

import { useActionState } from "react";
import { updateEventAction, type CreateEventState } from "@/lib/actions/event-actions";

const initialState: CreateEventState = {};

const PHOTOS = [
  ["PEBBLE_BEACH", "Pebble Beach"],
  ["LOUNGE", "Lounge"],
  ["UNEEKOR_CAMERA", "Uneekor camera"],
  ["SWING", "Swing"],
  ["CLUB_INTERIOR", "Club interior"],
  ["BAY_LOUNGE_FULL", "Bay + lounge"],
  ["BAY_LOUNGE_WIDE", "Bay + lounge (wide)"],
  ["SIMULATOR", "Simulator"],
  ["DATA_OVERLAY", "Data overlay"],
];

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTimeLocal: string;
  rsvpDeadlineLocal: string | null;
  photoKey: string;
  photoUrl: string | null;
};

export function EditEventForm({ event }: { event: Event }) {
  const action = updateEventAction.bind(null, event.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4 border border-ul-cream-dark bg-ul-white p-6">
      <h2 className="font-heading text-sm tracking-[0.14em] text-ul-green">EDIT EVENT</h2>
      <div>
        <label className="block text-sm font-medium text-ul-text">Title</label>
        <input
          name="title"
          required
          defaultValue={event.title}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Description</label>
        <input
          name="description"
          defaultValue={event.description ?? ""}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Location</label>
        <input
          name="location"
          defaultValue={event.location ?? ""}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Start time</label>
        <input
          type="datetime-local"
          name="startTime"
          required
          defaultValue={event.startTimeLocal}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">RSVP deadline (optional)</label>
        <input
          type="datetime-local"
          name="rsvpDeadline"
          defaultValue={event.rsvpDeadlineLocal ?? ""}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Stock photo (fallback)</label>
        <select
          name="photoKey"
          defaultValue={event.photoKey}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        >
          {PHOTOS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {event.photoUrl && (
        <div>
          <label className="block text-sm font-medium text-ul-text">Current uploaded photo</label>
          <div className="relative mt-1 h-32 w-full overflow-hidden border border-ul-cream-dark bg-ul-green-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.photoUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm text-ul-text-muted">
            <input type="checkbox" name="removePhoto" />
            Remove this photo (fall back to the stock photo above)
          </label>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ul-text">
          {event.photoUrl ? "Replace uploaded photo" : "Upload a photo (optional)"}
        </label>
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-ul-text-muted">
          If you upload one, it&apos;s used instead of the stock photo (and replaces any existing
          upload). Up to 4MB.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-green-700">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-ul-green px-5 py-2.5 font-heading text-[10.5px] tracking-[0.16em] text-ul-cream disabled:opacity-50"
      >
        {pending ? "SAVING..." : "SAVE CHANGES"}
      </button>
    </form>
  );
}
