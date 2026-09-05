import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import JournalEntryForm from "./JournalEntryForm";

const sourceLabels: Record<string, string> = {
  manual: "يدوي",
  payment: "دفعة",
  expense: "مصروف",
};

export default async function JournalPage() {
  const supabase = await createClient();

  const [{ data: entries }, { data: accounts }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select("id, entry_no, entry_date, memo, source_type")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("chart_of_accounts").select("id, code, name").eq("is_active", true).order("code"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{entries?.length ?? 0} قيد</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">القيود اليومية</h1>
      </div>

      <JournalEntryForm accounts={accounts ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">رقم القيد</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
              <th className="px-4 py-2.5 font-medium">البيان</th>
              <th className="px-4 py-2.5 font-medium">المصدر</th>
            </tr>
          </thead>
          <tbody>
            {entries?.length ? (
              entries.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink">
                    <Link href={`/accounting/journal/${e.id}`} className="underline underline-offset-2">
                      {e.entry_no}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {new Date(e.entry_date).toLocaleDateString("ar-SY-u-nu-latn")}
                  </td>
                  <td className="px-4 py-2.5 text-ink">{e.memo ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{sourceLabels[e.source_type] ?? e.source_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  ما في قيود بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
