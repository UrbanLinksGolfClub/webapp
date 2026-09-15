"use client";

import { useActionState } from "react";
import { createEventAction, type CreateEventState } from "@/lib/actions/event-actions";

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

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4 border border-ul-cream-dark bg-ul-white p-6">
      <h2 className="font-heading text-sm tracking-[0.14em] text-ul-green">NEW EVENT</h2>
      <div>
        <label className="block text-sm font-medium text-ul-text">Title</label>
        <input
          name="title"
          required
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Description</label>
        <input name="description" className="mt-1 w-full border border-ul-cream-dark px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Location</label>
        <input name="location" className="mt-1 w-full border border-ul-cream-dark px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Start time</label>
        <input
          type="datetime-local"
          name="startTime"
          required
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">RSVP deadline (optional)</label>
        <input
          type="datetime-local"
          name="rsvpDeadline"
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ul-text">Photo</label>
        <select name="photoKey" className="mt-1 w-full border border-ul-cream-dark px-3 py-2">
          {PHOTOS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {state.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-green-700">Event created.</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-ul-green px-5 py-2.5 font-heading text-[10.5px] tracking-[0.16em] text-ul-cream disabled:opacity-50"
      >
        {pending ? "CREATING..." : "CREATE EVENT"}
      </button>
    </form>
  );
}
