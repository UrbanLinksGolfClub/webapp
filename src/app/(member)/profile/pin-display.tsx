"use client";

import { useState } from "react";

export function PinDisplay({ pin }: { pin: string | null }) {
  const [hidden, setHidden] = useState(false);
  const digits = (pin ?? "----").padEnd(4, "-").split("").slice(0, 4);

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {digits.map((d, i) => (
          <div
            key={i}
            className="flex h-12 w-9 items-center justify-center border border-ul-gold/55 font-heading text-2xl text-ul-gold"
          >
            {hidden ? "•" : d}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setHidden((h) => !h)}
        className="font-heading text-[9px] tracking-[0.14em] text-ul-cream/75 hover:text-ul-gold"
      >
        TAP TO
        <br />
        {hidden ? "SHOW" : "HIDE"}
      </button>
    </div>
  );
}
