"use client";

import { useActionState } from "react";
import { updateOwnProfileAction, type UpdateProfileState } from "@/lib/actions/profile-actions";

const initialState: UpdateProfileState = {};

export function ProfileForm({
  phone,
  address,
  sgtUsername,
}: {
  phone: string | null;
  address: string | null;
  sgtUsername: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateOwnProfileAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div>
        <label className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
          PHONE
        </label>
        <input
          name="phone"
          defaultValue={phone ?? ""}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
          ADDRESS
        </label>
        <input
          name="address"
          defaultValue={address ?? ""}
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="font-heading text-[9px] tracking-[0.16em] text-ul-text-muted">
          SGT HANDLE
        </label>
        <input
          name="sgtUsername"
          defaultValue={sgtUsername ?? ""}
          placeholder="your Simulator Golf Tour username"
          className="mt-1 w-full border border-ul-cream-dark px-3 py-2 text-sm"
        />
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
        className="border border-ul-cream-dark py-2.5 text-center font-heading text-[10px] tracking-[0.16em] text-ul-green hover:border-ul-green disabled:opacity-50"
      >
        {pending ? "SAVING..." : "SAVE DETAILS"}
      </button>
    </form>
  );
}
