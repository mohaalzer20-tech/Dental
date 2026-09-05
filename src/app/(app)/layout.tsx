import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
import NavLinks from "./NavLinks";
import GlobalSearch from "./GlobalSearch";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: practice } = await supabase
    .from("practices")
    .select("doctor_name")
    .single();

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-60 shrink-0 flex-col border-l border-border bg-surface print:hidden">
        <div className="border-b border-border px-5 py-5">
          <p className="text-sm font-bold text-primary-strong">عيادتي</p>
          <p className="mt-1 truncate text-xs text-ink-muted">
            {practice?.doctor_name ?? ""}
          </p>
        </div>

        <NavLinks />

        <form action={logout} className="border-t border-border p-3">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-alt hover:text-danger"
          >
            <LogoutIcon className="h-4 w-4 shrink-0" />
            تسجيل خروج
          </button>
        </form>
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
