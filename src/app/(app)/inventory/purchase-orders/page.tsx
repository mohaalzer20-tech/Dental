import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import POForm from "./POForm";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  submitted: "مُرسل",
  ordered: "تم الطلب",
  partially_received: "استُلم جزئياً",
  received: "تم الاستلام",
  cancelled: "ملغى",
};

export default async function PurchaseOrdersPage() {
  const supabase = await createClient();

  const [{ data: orders }, { data: suppliers }] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("id, order_number, status, total_amount, order_date, suppliers(name)")
      .order("order_date", { ascending: false }),
    supabase.from("suppliers").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{orders?.length ?? 0} أمر شراء</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">أوامر الشراء</h1>
      </div>

      <POForm suppliers={suppliers ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المورد</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium">الإجمالي</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length ? (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    <Link href={`/inventory/purchase-orders/${o.id}`} className="underline underline-offset-2">
                      {(o.suppliers as unknown as { name: string } | null)?.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{statusLabels[o.status] ?? o.status}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{o.total_amount}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{o.order_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  ما في أوامر شراء بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
