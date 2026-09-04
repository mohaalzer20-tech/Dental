import { createClient } from "@/lib/supabase/server";
import LabOrderForm from "./LabOrderForm";
import VendorForm from "./VendorForm";
import StatusSelect from "./StatusSelect";

export default async function LabPage() {
  const supabase = await createClient();

  const [{ data: orders }, { data: patients }, { data: vendors }] = await Promise.all([
    supabase
      .from("lab_orders")
      .select("id, description, status, cost, sent_date, patients(name), lab_vendors(name)")
      .order("sent_date", { ascending: false }),
    supabase.from("patients").select("id, name").order("name"),
    supabase.from("lab_vendors").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{orders?.length ?? 0} أمر</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">المختبر</h1>
      </div>

      <LabOrderForm patients={patients ?? []} vendors={vendors ?? []} />
      <VendorForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">المخبر</th>
              <th className="px-4 py-2.5 font-medium">الوصف</th>
              <th className="px-4 py-2.5 font-medium">التكلفة</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length ? (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    {(o.patients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    {(o.lab_vendors as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{o.description ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{o.cost}</td>
                  <td className="px-4 py-2.5">
                    <StatusSelect orderId={o.id} status={o.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  ما في أوامر مخبر بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
