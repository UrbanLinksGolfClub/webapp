"use client";

import { useState, useTransition } from "react";
import { rsvpEventAction, cancelRsvpAction } from "@/lib/actions/event-actions";

export function RsvpButton({
  eventId,
  initiallyIn,
  variant = "solid",
}: {
  eventId: string;
  initiallyIn: boolean;
  variant?: "solid" | "outline";
}) {
  const [isIn, setIsIn] = useState(initiallyIn);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setError(null);
      try {
        if (isIn) {
          await cancelRsvpAction(eventId);
          setIsIn(false);
        } else {
          await rsvpEventAction(eventId);
          setIsIn(true);
        }
      } catch {
        setError("Something went wrong -- try again.");
      }
    });
  }

  const base = "px-5 py-2.5 text-center font-heading text-[10.5px] tracking-[0.18em] transition-colors disabled:opacity-50";
  const solid = "bg-ul-gold text-ul-green-dark hover:bg-ul-gold-dark";
  const outline = "border border-ul-cream/50 text-ul-cream hover:border-ul-gold hover:text-ul-gold";

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`${base} ${variant === "solid" ? solid : outline}`}
      >
        {isIn ? "I'M IN ✓" : "I'M IN"}
      </button>
      {error && (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
