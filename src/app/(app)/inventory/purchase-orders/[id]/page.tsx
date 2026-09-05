import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import POItemForm from "./POItemForm";

export default async function PODetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: po }, { data: items }, { data: inventoryItems }] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("id, status, total_amount, suppliers(id, name)")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("purchase_order_items")
      .select("id, quantity, unit_price, amount, inventory_items(name)")
      .eq("purchase_order_id", id),
    supabase.from("inventory_items").select("id, name").is("deleted_at", null).order("name"),
  ]);

  if (!po) {
    return <p className="text-ink-muted">أمر الشراء غير موجود</p>;
  }

  const supplier = po.suppliers as unknown as { id: string; name: string } | null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">
          {supplier ? (
            <Link href={`/inventory/suppliers/${supplier.id}`} className="underline underline-offset-2">
              {supplier.name}
            </Link>
          ) : (
            "—"
          )}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">أمر شراء</h1>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">البنود</h2>
        <table className="w-full text-right text-sm">
          <thead className="text-ink-muted">
            <tr>
              <th className="pb-2 font-medium">الصنف</th>
              <th className="pb-2 font-medium">الكمية</th>
              <th className="pb-2 font-medium">سعر الوحدة</th>
              <th className="pb-2 font-medium">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="py-2 text-ink">
                  {(it.inventory_items as unknown as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="py-2 font-mono text-ink-muted">{it.quantity}</td>
                <td className="py-2 font-mono text-ink-muted">{it.unit_price}</td>
                <td className="py-2 font-mono text-ink-muted">{it.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-ink-muted">الإجمالي: {po.total_amount}</p>
        <div className="mt-4 border-t border-border pt-4">
          <POItemForm poId={id} items={inventoryItems ?? []} />
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        بعد استلام البضاعة فعلياً، سجّل الكمية عبر صفحة{" "}
        <Link href="/inventory/transactions" className="text-primary-strong underline underline-offset-2">
          حركات المخزون
        </Link>{" "}
        (نوع الحركة: شراء) ليتحدّث المخزون تلقائياً.
      </p>
    </div>
  );
}
