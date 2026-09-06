import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusPill from "@/components/StatusPill";
import AccountForm from "./AccountForm";
import { accountTypeLabels, accountTypeTone, accountTypeOrder } from "../accountTypeStyles";

export default async function ChartOfAccountsPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("chart_of_accounts")
    .select("id, code, name, type, is_system")
    .order("code");

  const groups = accountTypeOrder.map((type) => ({
    type,
    accounts: (accounts ?? []).filter((a) => a.type === type),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{accounts?.length ?? 0} حساب</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">شجرة الحسابات</h1>
        <p className="mt-1 text-sm text-ink-muted">
          الحسابات مقسّمة حسب نوعها لتسهيل القراءة — كل مجموعة لها لون مميز.
        </p>
      </div>

      <AccountForm />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map(({ type, accounts: typeAccounts }) => (
          <div key={type} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <StatusPill tone={accountTypeTone[type]}>{accountTypeLabels[type]}</StatusPill>
              <span className="font-mono text-xs text-ink-muted">{typeAccounts.length} حساب</span>
            </div>
            {typeAccounts.length ? (
              <table className="w-full text-right text-sm">
                <tbody>
                  {typeAccounts.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-4 py-2.5 font-mono text-ink-muted">
                        <Link href={`/accounting/chart-of-accounts/${a.id}`} className="underline underline-offset-2">
                          {a.code}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-ink">{a.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">ما في حسابات بهذا النوع بعد</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
