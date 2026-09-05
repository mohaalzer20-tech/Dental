import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import { deleteSupplier } from "../actions";
import SupplierEditForm from "./SupplierEditForm";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  submitted: "مُرسل",
  ordered: "تم الطلب",
  partially_received: "استُلم جزئياً",
  received: "تم الاستلام",
  cancelled: "ملغى",
};

export default async function SupplierProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id, name, phone, contact_person, address, payment_terms")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!supplier) {
    return <p className="text-ink-muted">المورد غير موجود</p>;
  }

  const { data: purchaseOrders } = await supabase
    .from("purchase_orders")
    .select("id, order_number, status, total_amount, order_date")
    .eq("supplier_id", id)
    .is("deleted_at", null)
    .order("order_date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-muted">ملف المورد</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{supplier.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {supplier.contact_person ?? "بدون مسؤول"} — {supplier.phone ?? "بدون هاتف"}
          </p>
        </div>
        <DeleteButton
          action={deleteSupplier.bind(null, supplier.id)}
          confirmMessage="متأكد إنك تبي تحذف هذا المورد؟"
        />
      </div>

      <SupplierEditForm supplier={supplier} />

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">أوامر الشراء</h2>
        {purchaseOrders?.length ? (
          <table className="w-full text-right text-sm">
            <thead className="text-ink-muted">
              <tr>
                <th className="pb-2 font-medium">الرقم</th>
                <th className="pb-2 font-medium">الحالة</th>
                <th className="pb-2 font-medium">الإجمالي</th>
                <th className="pb-2 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="border-t border-border">
                  <td className="py-2 font-mono text-ink">
                    <Link href={`/inventory/purchase-orders/${po.id}`} className="underline underline-offset-2">
                      {po.order_number ?? po.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-2 text-ink-muted">{statusLabels[po.status] ?? po.status}</td>
                  <td className="py-2 font-mono text-ink-muted">{po.total_amount}</td>
                  <td className="py-2 font-mono text-ink-muted">{po.order_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-ink-muted">ما في أوامر شراء من هذا المورد بعد</p>
        )}
      </div>
    </div>
  );
}
