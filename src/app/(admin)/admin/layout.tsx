import { AdminSidebar } from "@/components/admin-sidebar";

// Admin pages read live DB state and are gated by proxy.ts (not visible to
// Next's static-analysis) rather than by calling auth()/cookies() directly
// in every page, so force dynamic rendering here to prevent any of them
// from being frozen as static HTML at build time.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[216px_1fr] bg-ul-cream">
      <AdminSidebar />
      <main className="px-8 py-7">{children}</main>
    </div>
  );
}
