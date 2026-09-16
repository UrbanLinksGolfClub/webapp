"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/book", label: "RESERVATIONS" },
  { href: "/admin/members", label: "MEMBERS & PINS" },
  { href: "/admin/events", label: "EVENTS" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="bg-ul-green-dark sm:min-h-screen sm:py-6">
      <div className="flex items-center justify-between px-6 py-4 sm:block sm:border-b sm:border-ul-gold/20 sm:px-6 sm:pb-6 sm:pt-0">
        <Link href="/club" className="flex items-center gap-3">
          <Image src="/brand/logo-cream.png" alt="Urban Links" width={28} height={28} />
          <div>
            <div className="font-heading text-[11px] tracking-[0.2em] text-ul-cream">
              URBAN LINKS
            </div>
            <div className="mt-0.5 font-heading text-[8.5px] tracking-[0.2em] text-ul-gold">
              ADMIN
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-[5px] sm:hidden"
        >
          <span
            className={`block h-[1.5px] w-5 bg-ul-cream transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-ul-cream transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-ul-cream transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <div className={`${open ? "block" : "hidden"} border-t border-ul-cream/10 sm:block sm:border-t-0`}>
        <nav className="grid gap-px py-2 sm:mt-4 sm:py-0">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-l-[3px] px-6 py-3 font-heading text-[10.5px] tracking-[0.18em] ${
                  active
                    ? "border-l-ul-gold bg-ul-gold/15 text-ul-gold"
                    : "border-l-transparent text-ul-cream/80 hover:text-ul-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-6 mt-2 border-t border-ul-gold/20 pb-3 pt-3 sm:mt-7 sm:pb-0 sm:pt-5">
          <Link
            href="/club"
            className="block py-2.5 text-center font-heading text-[9.5px] tracking-[0.14em] text-ul-cream/70 hover:text-ul-gold"
          >
            ← MEMBER VIEW
          </Link>
        </div>
      </div>
    </div>
  );
}
