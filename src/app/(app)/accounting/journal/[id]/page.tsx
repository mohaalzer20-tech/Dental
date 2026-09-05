import { createClient } from "@/lib/supabase/server";

export default async function JournalEntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: entry }, { data: lines }] = await Promise.all([
    supabase.from("journal_entries").select("id, entry_no, entry_date, memo, source_type").eq("id", id).single(),
    supabase
      .from("journal_entry_lines")
      .select("id, debit, credit, description, chart_of_accounts(code, name)")
      .eq("journal_entry_id", id),
  ]);

  if (!entry) {
    return <p className="text-ink-muted">القيد غير موجود</p>;
  }

  const totalDebit = lines?.reduce((s, l) => s + Number(l.debit), 0) ?? 0;
  const totalCredit = lines?.reduce((s, l) => s + Number(l.credit), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{entry.entry_no}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{entry.memo ?? "قيد يومية"}</h1>
        <p className="mt-1 text-sm text-ink-muted">{new Date(entry.entry_date).toLocaleDateString("ar-SY")}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الحساب</th>
              <th className="px-4 py-2.5 font-medium">الوصف</th>
              <th className="px-4 py-2.5 font-medium">مدين</th>
              <th className="px-4 py-2.5 font-medium">دائن</th>
            </tr>
          </thead>
          <tbody>
            {lines?.map((l) => {
              const account = l.chart_of_accounts as unknown as { code: string; name: string } | null;
              return (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">{account ? `${account.code} - ${account.name}` : "—"}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{l.description ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink">{Number(l.debit) > 0 ? l.debit : "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink">{Number(l.credit) > 0 ? l.credit : "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-surface-alt">
              <td className="px-4 py-2.5 font-medium text-ink" colSpan={2}>
                الإجمالي
              </td>
              <td className="px-4 py-2.5 font-mono font-medium text-primary-strong">{totalDebit.toFixed(2)}</td>
              <td className="px-4 py-2.5 font-mono font-medium text-primary-strong">{totalCredit.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
