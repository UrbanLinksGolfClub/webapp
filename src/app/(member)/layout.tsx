import { auth } from "@/auth";
import { NavBar } from "@/components/nav-bar";
import { BottomTabBar } from "@/components/bottom-tab-bar";

// Member pages show per-user booking/session data; force dynamic rendering
// so no member page can accidentally get frozen as static HTML at build time.
export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar
        isAdmin={session?.user.role === "ADMIN"}
        memberName={session?.user.name ?? ""}
      />
      <main>{children}</main>
      <BottomTabBar />
    </div>
  );
}
