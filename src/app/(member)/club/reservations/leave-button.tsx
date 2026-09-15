"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LeaveButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function leave() {
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/bookings/${bookingId}/leave`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to leave.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={leave}
        disabled={pending}
        className="font-heading text-[10px] tracking-[0.16em] text-red-700 underline disabled:opacity-50"
      >
        {pending ? "LEAVING..." : "LEAVE RESERVATION"}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
