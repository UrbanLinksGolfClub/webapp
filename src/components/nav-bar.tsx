import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/lib/actions/sign-out";

const LINKS = [
  { href: "/club", label: "Club" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
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
  return (
    <header className="bg-ul-green-dark">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-6">
        <Link href="/club" className="flex items-center gap-3">
          <Image src="/brand/logo-cream.png" alt="Urban Links" width={30} height={30} priority />
          <span className="font-heading text-xs font-medium tracking-[0.22em] text-ul-cream">
            URBAN LINKS
          </span>
        </Link>
        <nav className="flex items-center gap-8">
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
      </div>
    </header>
  );
}
