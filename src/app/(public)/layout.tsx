export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="text-lg font-bold text-primary-strong">عيادتي</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
