import { createClient } from "@/lib/supabase/server";
import ItemForm from "./ItemForm";
import PaymentForm from "./PaymentForm";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: invoice }, { data: items }, { data: payments }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_no, subtotal, discount_amount, total_amount, paid_amount, status, notes, patients(name), users(full_name)")
      .eq("id", id)
      .single(),
    supabase.from("invoice_items").select("id, description, quantity, unit_price, amount").eq("invoice_id", id),
    supabase.from("payments").select("id, amount, method, paid_at, notes").eq("invoice_id", id).order("paid_at", { ascending: false }),
  ]);

  if (!invoice) {
    return <p className="text-ink-muted">الفاتورة غير موجودة</p>;
  }

  const patientName = (invoice.patients as unknown as { name: string } | null)?.name ?? "—";
  const providerName = (invoice.users as unknown as { full_name: string } | null)?.full_name;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{invoice.invoice_no}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">فاتورة {patientName}</h1>
        {providerName && <p className="text-sm text-ink-muted">الطبيب: {providerName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-ink-muted">المجموع الفرعي</p>
          <p className="mt-1 font-mono text-lg text-ink">{invoice.subtotal}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-ink-muted">الخصم</p>
          <p className="mt-1 font-mono text-lg text-ink">{invoice.discount_amount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-ink-muted">الإجمالي</p>
          <p className="mt-1 font-mono text-lg text-primary-strong">{invoice.total_amount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-ink-muted">المدفوع</p>
          <p className="mt-1 font-mono text-lg text-ink">{invoice.paid_amount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">البنود</h2>
        <table className="w-full text-right text-sm">
          <thead className="text-ink-muted">
            <tr>
              <th className="pb-2 font-medium">الوصف</th>
              <th className="pb-2 font-medium">الكمية</th>
              <th className="pb-2 font-medium">سعر الوحدة</th>
              <th className="pb-2 font-medium">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="py-2 text-ink">{it.description}</td>
                <td className="py-2 font-mono text-ink-muted">{it.quantity}</td>
                <td className="py-2 font-mono text-ink-muted">{it.unit_price}</td>
                <td className="py-2 font-mono text-ink-muted">{it.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 border-t border-border pt-4">
          <ItemForm invoiceId={id} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">الدفعات</h2>
        <table className="w-full text-right text-sm">
          <thead className="text-ink-muted">
            <tr>
              <th className="pb-2 font-medium">المبلغ</th>
              <th className="pb-2 font-medium">الطريقة</th>
              <th className="pb-2 font-medium">التاريخ</th>
              <th className="pb-2 font-medium">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-2 font-mono text-ink">{p.amount}</td>
                <td className="py-2 text-ink-muted">{p.method}</td>
                <td className="py-2 font-mono text-ink-muted">
                  {new Date(p.paid_at).toLocaleDateString("ar-SY")}
                </td>
                <td className="py-2 text-ink-muted">{p.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 border-t border-border pt-4">
          <PaymentForm invoiceId={id} />
        </div>
      </div>
    </div>
  );
}
