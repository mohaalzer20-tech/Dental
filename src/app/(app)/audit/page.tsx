import { createClient } from "@/lib/supabase/server";

const actionLabels: Record<string, string> = {
  create: "إنشاء",
  update: "تعديل",
  delete: "حذف",
};

const actionClass: Record<string, string> = {
  create: "border-primary text-primary-strong",
  update: "border-accent text-accent",
  delete: "border-danger text-danger",
};

export default async function AuditPage() {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("audit_log")
    .select("id, action, entity_type, entity_id, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">آخر {entries?.length ?? 0} حركة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">سجل التدقيق</h1>
        <p className="text-sm text-ink-muted">متاح للطبيب فقط — يوثّق كل إنشاء/تعديل/حذف بالنظام.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الجدول</th>
              <th className="px-4 py-2.5 font-medium">العملية</th>
              <th className="px-4 py-2.5 font-medium">المعرّف</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {entries?.length ? (
              entries.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink">{e.entity_type}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        actionClass[e.action] ?? "border-ink-muted text-ink-muted"
                      }`}
                    >
                      {actionLabels[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">
                    {String(e.entity_id).slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {new Date(e.created_at).toLocaleString("ar-SY")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  ما في حركات مسجّلة بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
