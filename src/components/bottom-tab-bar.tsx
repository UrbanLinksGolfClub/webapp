"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/club", label: "Book" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Board" },
  { href: "/profile", label: "Profile" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-ul-gold/30 bg-ul-green-dark sm:hidden">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`py-4 text-center font-heading text-[9.5px] tracking-[0.16em] ${
              active
                ? "-mt-px border-t-2 border-ul-gold text-ul-gold"
                : "text-ul-cream/80"
            }`}
          >
            {tab.label.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
