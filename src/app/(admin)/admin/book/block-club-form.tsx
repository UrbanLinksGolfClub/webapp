"use client";

import { useActionState, useState } from "react";
import { blockClubAction, type BlockClubState } from "@/lib/actions/admin-booking-actions";

const initialState: BlockClubState = {};

export function BlockClubForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(blockClubAction, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-ul-gold/50 px-4 py-2.5 font-heading text-[10.5px] tracking-[0.16em] text-ul-gold-dark hover:bg-ul-gold/10"
      >
        BLOCK THE CLUB
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border border-ul-cream-dark bg-ul-white p-3">
      <div>
        <label className="block font-heading text-[9px] tracking-[0.14em] text-ul-text-muted">
          FROM
        </label>
        <input
          type="datetime-local"
          name="startTime"
          required
          className="mt-1 border border-ul-cream-dark px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block font-heading text-[9px] tracking-[0.14em] text-ul-text-muted">
          TO
        </label>
        <input
          type="datetime-local"
          name="endTime"
          required
          className="mt-1 border border-ul-cream-dark px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-ul-green px-4 py-2 font-heading text-[10px] tracking-[0.14em] text-ul-cream disabled:opacity-50"
      >
        {pending ? "BLOCKING..." : "CONFIRM"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm text-ul-text-muted underline"
      >
        Cancel
      </button>
      {state.error && (
        <p className="w-full text-xs text-red-700" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
