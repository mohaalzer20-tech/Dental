export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* file-tab signature, referencing a patient folder tab */}
        <div className="absolute -top-3 right-6 h-4 w-16 rounded-t-md bg-accent" />

        <div className="relative rounded-2xl border border-border bg-surface p-8 shadow-[0_1px_2px_rgba(18,33,29,0.04),0_8px_24px_rgba(18,33,29,0.06)]">
          <div className="mb-6 flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-primary-strong">عيادتي</span>
            <span className="font-mono text-[11px] tracking-wide text-ink-muted">
              نظام إدارة العيادات
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
