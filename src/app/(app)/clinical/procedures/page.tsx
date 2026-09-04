import { createClient } from "@/lib/supabase/server";
import ProcedureForm from "./ProcedureForm";

export default async function ProceduresPage() {
  const supabase = await createClient();
  const { data: procedures } = await supabase
    .from("procedures")
    .select("id, name, category, base_price, is_active")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{procedures?.length ?? 0} إجراء</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">كتالوج الإجراءات</h1>
      </div>

      <ProcedureForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">التصنيف</th>
              <th className="px-4 py-2.5 font-medium">السعر الأساسي</th>
            </tr>
          </thead>
          <tbody>
            {procedures?.length ? (
              procedures.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">{p.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{p.category ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{p.base_price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                  ما في إجراءات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
