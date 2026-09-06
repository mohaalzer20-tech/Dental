import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
import NavLinks, { ToothIcon } from "./NavLinks";
import GlobalSearch from "./GlobalSearch";
import Avatar from "@/components/Avatar";
import { roleLabels } from "@/lib/roleLabels";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: practice }, { data: me }] = await Promise.all([
    supabase.from("practices").select("doctor_name").single(),
    user
      ? supabase.from("users").select("full_name, role").eq("id", user.id).single()
      : Promise.resolve({ data: null as { full_name: string; role: string } | null }),
  ]);

  const displayName = me?.full_name ?? practice?.doctor_name ?? "";
  const roleLabel = me?.role ? (roleLabels[me.role] ?? me.role) : "";

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-60 shrink-0 flex-col border-l border-border bg-surface print:hidden">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cat-cyan to-cat-violet text-on-primary">
            <ToothIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-primary-strong">عيادتي</p>
            <p className="truncate text-[10px] text-ink-muted">نظام إدارة العيادات</p>
          </div>
        </div>

        <NavLinks />

        <div className="flex items-center gap-2.5 border-t border-border p-3">
          <Avatar name={displayName || "؟"} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{displayName}</p>
            <p className="truncate text-[11px] text-ink-muted">{roleLabel}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="تسجيل خروج"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-alt hover:text-danger"
            >
              <LogoutIcon className="h-4 w-4 shrink-0" />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-border bg-surface px-8 py-3 print:hidden">
          <GlobalSearch />
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 16l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 12H9" strokeLinecap="round" />
    </svg>
  );
}
