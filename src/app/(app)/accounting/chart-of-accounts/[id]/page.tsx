import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const DEBIT_NORMAL = new Set(["asset", "expense"]);

export default async function AccountLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: account }, { data: lines }] = await Promise.all([
    supabase.from("chart_of_accounts").select("id, code, name, type").eq("id", id).single(),
    supabase
      .from("journal_entry_lines")
      .select("id, debit, credit, description, created_at, journal_entry_id, journal_entries(entry_no, entry_date, memo)")
      .eq("account_id", id)
      .order("created_at"),
  ]);

  if (!account) {
    return <p className="text-ink-muted">الحساب غير موجود</p>;
  }

  const debitNormal = DEBIT_NORMAL.has(account.type);
  const rows = (lines ?? []).reduce<
    Array<{
      id: string;
      debit: number;
      credit: number;
      description: string | null;
      journal_entry_id: string;
      entry: { entry_no: string; entry_date: string; memo: string | null } | null;
      balance: number;
    }>
  >((acc, l) => {
    const delta = debitNormal ? Number(l.debit) - Number(l.credit) : Number(l.credit) - Number(l.debit);
    const previousBalance = acc.length ? acc[acc.length - 1].balance : 0;
    const entry = l.journal_entries as unknown as {
      entry_no: string;
      entry_date: string;
      memo: string | null;
    } | null;
    acc.push({ ...l, entry, balance: previousBalance + delta });
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{account.code}</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">دفتر أستاذ: {account.name}</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
              <th className="px-4 py-2.5 font-medium">القيد</th>
              <th className="px-4 py-2.5 font-medium">الوصف</th>
              <th className="px-4 py-2.5 font-medium">مدين</th>
              <th className="px-4 py-2.5 font-medium">دائن</th>
              <th className="px-4 py-2.5 font-medium">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {r.entry ? new Date(r.entry.entry_date).toLocaleDateString("ar-SY-u-nu-latn") : "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink">
                    {r.entry ? (
                      <Link
                        href={`/accounting/journal/${r.journal_entry_id}`}
                        className="underline underline-offset-2"
                      >
                        {r.entry.entry_no}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{r.description ?? r.entry?.memo ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink">{Number(r.debit) > 0 ? r.debit : "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink">{Number(r.credit) > 0 ? r.credit : "—"}</td>
                  <td className="px-4 py-2.5 font-mono font-medium text-primary-strong">
                    {r.balance.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  ما في حركات على هذا الحساب بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
