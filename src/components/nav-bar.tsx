"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/sign-out";

const LINKS = [
  { href: "/club", label: "Club" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/members", label: "Members" },
  { href: "/profile", label: "Profile" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function NavBar({
  isAdmin,
  memberName,
}: {
  isAdmin: boolean;
  memberName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="bg-ul-green-dark">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <Link href="/club" className="flex min-w-0 items-center gap-3">
          <Image
            src="/brand/logo-cream.png"
            alt="Urban Links"
            width={30}
            height={30}
            priority
            className="shrink-0"
          />
          <span className="truncate font-heading text-xs font-medium tracking-[0.22em] text-ul-cream">
            URBAN LINKS
          </span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-[11px] tracking-[0.2em] text-ul-cream/80 transition-colors hover:text-ul-gold"
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/book"
              className="border-l border-ul-cream/20 pl-6 font-heading text-[11px] tracking-[0.2em] text-ul-cream/65 transition-colors hover:text-ul-gold"
            >
              ADMIN
            </Link>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              title="Sign out"
              className="flex h-[30px] w-[30px] items-center justify-center border border-ul-gold/50 font-heading text-[11px] text-ul-gold transition-colors hover:bg-ul-gold/15"
            >
              {initials(memberName)}
            </button>
          </form>
        </nav>

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

      {open && (
        <nav className="border-t border-ul-cream/10 px-6 pb-4 sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 font-heading text-xs tracking-[0.18em] text-ul-cream/85 hover:text-ul-gold"
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/book"
              className="block border-t border-ul-cream/10 py-3 font-heading text-xs tracking-[0.18em] text-ul-cream/85 hover:text-ul-gold"
            >
              ADMIN
            </Link>
          )}
          <form action={signOutAction} className="border-t border-ul-cream/10 pt-3">
            <button
              type="submit"
              className="py-2 font-heading text-xs tracking-[0.18em] text-ul-gold"
            >
              SIGN OUT
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
