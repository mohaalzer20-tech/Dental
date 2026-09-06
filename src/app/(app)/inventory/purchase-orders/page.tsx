import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import POForm from "./POForm";
import { deletePurchaseOrder } from "./actions";

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
      .select("id, order_number, status, total_amount, order_date, suppliers(id, name)")
      .is("deleted_at", null)
      .order("order_date", { ascending: false }),
    supabase.from("suppliers").select("id, name").is("deleted_at", null).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{orders?.length ?? 0} أمر شراء</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">أوامر الشراء</h1>
      </div>

      <POForm suppliers={suppliers ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">أمر الشراء</th>
              <th className="px-4 py-2.5 font-medium">المورد</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium">الإجمالي</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders?.length ? (
              orders.map((o) => {
                const supplier = o.suppliers as unknown as { id?: string; name: string } | null;
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono text-ink">
                      <Link href={`/inventory/purchase-orders/${o.id}`} className="underline underline-offset-2">
                        {o.order_number ?? o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-ink">
                      {supplier?.id ? (
                        <Link href={`/inventory/suppliers/${supplier.id}`} className="underline underline-offset-2">
                          {supplier.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{statusLabels[o.status] ?? o.status}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{o.total_amount}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{o.order_date}</td>
                    <td className="px-4 py-2.5">
                      <DeleteButton action={deletePurchaseOrder.bind(null, o.id)} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
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
