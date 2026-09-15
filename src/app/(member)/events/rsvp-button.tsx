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
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (isIn) {
        await cancelRsvpAction(eventId);
        setIsIn(false);
      } else {
        await rsvpEventAction(eventId);
        setIsIn(true);
      }
    });
  }

  const base = "px-5 py-2.5 text-center font-heading text-[10.5px] tracking-[0.18em] transition-colors disabled:opacity-50";
  const solid = "bg-ul-gold text-ul-green-dark hover:bg-ul-gold-dark";
  const outline = "border border-ul-cream/50 text-ul-cream hover:border-ul-gold hover:text-ul-gold";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`${base} ${variant === "solid" ? solid : outline}`}
    >
      {isIn ? "I'M IN ✓" : "I'M IN"}
    </button>
  );
}
