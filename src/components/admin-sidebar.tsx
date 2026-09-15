"use client";

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

  return (
    <div className="min-h-screen bg-ul-green-dark py-6">
      <Link
        href="/club"
        className="flex items-center gap-3 border-b border-ul-gold/20 px-6 pb-6"
      >
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

      <nav className="mt-4 grid gap-px">
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

      <div className="mx-6 mt-7 border-t border-ul-gold/20 pt-5">
        <Link
          href="/club"
          className="block py-2.5 text-center font-heading text-[9.5px] tracking-[0.14em] text-ul-cream/70 hover:text-ul-gold"
        >
          ← MEMBER VIEW
        </Link>
      </div>
    </div>
  );
}
