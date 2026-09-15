"use client";

import { useActionState } from "react";
import { updateMemberAction, type UpdateMemberState } from "@/lib/actions/admin-actions";

type Member = {
  id: string;
  address: string | null;
  membershipType: string | null;
  pinCode: string | null;
  role: string;
  status: string;
};

const initialState: UpdateMemberState = {};

export function EditMemberForm({ member }: { member: Member }) {
  const action = updateMemberAction.bind(null, member.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium" htmlFor="address">
          Address
        </label>
        <input
          id="address"
          name="address"
          defaultValue={member.address ?? ""}
          className="mt-1 w-full rounded-md border border-ul-cream-dark px-3 py-2 dark:bg-ul-green"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="membershipType">
          Membership type
        </label>
        <select
          id="membershipType"
          name="membershipType"
          defaultValue={member.membershipType ?? ""}
          className="mt-1 w-full rounded-md border border-ul-cream-dark px-3 py-2 dark:bg-ul-green"
        >
          <option value="">Not set</option>
          <option value="FOUNDING_MEMBER">Founding Member</option>
          <option value="RACCOON_RATE">Raccoon Rate</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="pinCode">
          PIN code
        </label>
        <input
          id="pinCode"
          name="pinCode"
          defaultValue={member.pinCode ?? ""}
          className="mt-1 w-full rounded-md border border-ul-cream-dark px-3 py-2 dark:bg-ul-green"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={member.status}
          className="mt-1 w-full rounded-md border border-ul-cream-dark px-3 py-2 dark:bg-ul-green"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue={member.role}
          className="mt-1 w-full rounded-md border border-ul-cream-dark px-3 py-2 dark:bg-ul-green"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-green-600">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-ul-green px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
