import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ItemForm from "./ItemForm";

export default async function InventoryPage() {
  const supabase = await createClient();

  const [{ data: items }, { data: alerts }] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("id, name, unit, current_stock, minimum_stock, purchase_price")
      .order("name"),
    supabase.from("v_stock_alerts").select("item_id, name, current_stock, minimum_stock, stock_alert, expiry_alert"),
  ]);

  const alertLabels: Record<string, string> = {
    out_of_stock: "نفدت الكمية",
    low_stock: "كمية منخفضة",
    expiring_soon: "قرب انتهاء الصلاحية",
    expired: "منتهي الصلاحية",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-muted">{items?.length ?? 0} صنف</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">المخزون</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/inventory/suppliers" className="text-primary-strong underline underline-offset-2">
            الموردون
          </Link>
          <Link href="/inventory/purchase-orders" className="text-primary-strong underline underline-offset-2">
            أوامر الشراء
          </Link>
          <Link href="/inventory/transactions" className="text-primary-strong underline underline-offset-2">
            حركات المخزون
          </Link>
        </div>
      </div>

      {alerts?.length ? (
        <div className="rounded-xl border border-danger bg-danger-bg p-4">
          <h2 className="mb-2 text-sm font-semibold text-danger">تنبيهات</h2>
          <ul className="flex flex-col gap-1 text-sm text-danger">
            {alerts.map((a, i) => (
              <li key={i}>
                {a.name} — {alertLabels[a.stock_alert ?? a.expiry_alert ?? ""] ?? "تنبيه"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ItemForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">الوحدة</th>
              <th className="px-4 py-2.5 font-medium">الكمية الحالية</th>
              <th className="px-4 py-2.5 font-medium">الحد الأدنى</th>
              <th className="px-4 py-2.5 font-medium">سعر الشراء</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              items.map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">{it.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{it.unit}</td>
                  <td
                    className={`px-4 py-2.5 font-mono ${
                      it.current_stock <= it.minimum_stock ? "text-danger" : "text-ink"
                    }`}
                  >
                    {it.current_stock}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{it.minimum_stock}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{it.purchase_price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  ما في أصناف بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
