import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import { restoreEntity } from "./actions";
import { isSoftDelete } from "./restorable";

const entityHrefBuilders: Record<string, (id: string) => string> = {
  patients: (id) => `/patients/${id}`,
  users: (id) => `/staff/${id}`,
  suppliers: (id) => `/inventory/suppliers/${id}`,
  invoices: (id) => `/invoices/${id}`,
  prescriptions: (id) => `/clinical/prescriptions/${id}`,
  treatment_plans: (id) => `/clinical/treatment-plans/${id}`,
  purchase_orders: (id) => `/inventory/purchase-orders/${id}`,
  chart_of_accounts: (id) => `/accounting/chart-of-accounts/${id}`,
  journal_entries: (id) => `/accounting/journal/${id}`,
};

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
    .select("id, action, entity_type, entity_id, created_at, actor_id, old_data, new_data")
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
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entries?.length ? (
              entries.map((e) => {
                const softDeleted = isSoftDelete(e);
                const displayAction = softDeleted ? "delete" : e.action;
                return (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-ink">{e.entity_type}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        actionClass[displayAction] ?? "border-ink-muted text-ink-muted"
                      }`}
                    >
                      {actionLabels[displayAction] ?? displayAction}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">
                    {entityHrefBuilders[e.entity_type] ? (
                      <Link
                        href={entityHrefBuilders[e.entity_type](String(e.entity_id))}
                        className="underline underline-offset-2"
                      >
                        {String(e.entity_id).slice(0, 8)}…
                      </Link>
                    ) : (
                      <>{String(e.entity_id).slice(0, 8)}…</>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {new Date(e.created_at).toLocaleString("ar-SY-u-nu-latn")}
                  </td>
                  <td className="px-4 py-2.5">
                    {softDeleted && (
                      <DeleteButton
                        action={restoreEntity.bind(null, e.entity_type, String(e.entity_id))}
                        confirmMessage="استرجاع هذا السجل؟ بيرجع يظهر بكل القوائم من جديد."
                        label="استرجاع"
                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-primary hover:text-primary-strong disabled:opacity-50"
                      />
                    )}
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
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
