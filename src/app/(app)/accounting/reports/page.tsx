import Link from "next/link";

const reports = [
  { href: "/accounting/reports/trial-balance", title: "ميزان المراجعة", desc: "مجموع المدين والدائن لكل حساب" },
  { href: "/accounting/reports/income-statement", title: "قائمة الدخل", desc: "الإيرادات والمصروفات وصافي الدخل" },
  { href: "/accounting/reports/balance-sheet", title: "الميزانية العمومية", desc: "الأصول مقابل الخصوم وحقوق الملكية" },
];

export default function ReportsHubPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">المحاسبة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">التقارير المالية</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {reports.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary"
          >
            <h2 className="text-sm font-semibold text-ink">{r.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
