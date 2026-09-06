import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AccountForm from "./AccountForm";

const typeLabels: Record<string, string> = {
  asset: "أصول",
  liability: "خصوم",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

export default async function ChartOfAccountsPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("chart_of_accounts")
    .select("id, code, name, type, is_system")
    .order("code");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{accounts?.length ?? 0} حساب</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">شجرة الحسابات</h1>
      </div>

      <AccountForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الرمز</th>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">النوع</th>
            </tr>
          </thead>
          <tbody>
            {accounts?.length ? (
              accounts.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink">
                    <Link href={`/accounting/chart-of-accounts/${a.id}`} className="underline underline-offset-2">
                      {a.code}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink">{a.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{typeLabels[a.type] ?? a.type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                  ما في حسابات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
