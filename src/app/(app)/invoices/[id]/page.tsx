import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import ItemForm from "./ItemForm";
import PaymentForm from "./PaymentForm";
import DiscountForm from "./DiscountForm";
import { deletePayment } from "../actions";

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
      .select(
        "id, invoice_no, patient_id, subtotal, discount_amount, total_amount, paid_amount, status, notes, patients(id, name), users(id, full_name)",
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("invoice_items")
      .select("id, description, quantity, unit_price, amount, treatment_id")
      .eq("invoice_id", id),
    supabase.from("payments").select("id, amount, method, paid_at, notes").eq("invoice_id", id).order("paid_at", { ascending: false }),
  ]);

  if (!invoice) {
    return <p className="text-ink-muted">الفاتورة غير موجودة</p>;
  }

  const patient = invoice.patients as unknown as { id: string; name: string } | null;
  const provider = invoice.users as unknown as { id: string; full_name: string } | null;

  const [{ data: patientTreatments }, { data: billedTreatmentRows }] = await Promise.all([
    supabase
      .from("treatments")
      .select("id, diagnosis, cost, performed_at, procedures(name)")
      .eq("patient_id", invoice.patient_id)
      .is("deleted_at", null)
      .order("performed_at", { ascending: false }),
    supabase
      .from("invoice_items")
      .select("treatment_id, invoices!inner(deleted_at)")
      .not("treatment_id", "is", null)
      .is("invoices.deleted_at", null),
  ]);

  const billedTreatmentIds = new Set((billedTreatmentRows ?? []).map((r) => r.treatment_id));
  const availableTreatments = (patientTreatments ?? [])
    .filter((t) => !billedTreatmentIds.has(t.id))
    .map((t) => {
      const procedure = t.procedures as unknown as { name: string } | null;
      return {
        id: t.id,
        cost: Number(t.cost) || 0,
        label: `${procedure?.name ?? t.diagnosis ?? "معالجة"} — ${new Date(t.performed_at).toLocaleDateString("ar-SY")}`,
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-muted">{invoice.invoice_no}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">
            فاتورة{" "}
            {patient ? (
              <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                {patient.name}
              </Link>
            ) : (
              "—"
            )}
          </h1>
          {provider && (
            <p className="text-sm text-ink-muted">
              الطبيب:{" "}
              <Link href={`/staff/${provider.id}`} className="underline underline-offset-2">
                {provider.full_name}
              </Link>
            </p>
          )}
        </div>
        <Link
          href={`/invoices/${id}/print`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt"
        >
          طباعة الفاتورة
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-ink-muted">المجموع الفرعي</p>
          <p className="mt-1 font-mono text-lg text-ink">{invoice.subtotal}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-ink-muted">الخصم</p>
          <p className="mt-1 font-mono text-lg text-ink">{invoice.discount_amount}</p>
          <div className="mt-1">
            <DiscountForm invoiceId={invoice.id} discountAmount={invoice.discount_amount} />
          </div>
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
                <td className="py-2 text-ink">
                  {it.description}
                  {it.treatment_id && (
                    <span className="mr-2 rounded-full border border-border px-2 py-0.5 text-xs text-ink-muted">
                      من معالجة
                    </span>
                  )}
                </td>
                <td className="py-2 font-mono text-ink-muted">{it.quantity}</td>
                <td className="py-2 font-mono text-ink-muted">{it.unit_price}</td>
                <td className="py-2 font-mono text-ink-muted">{it.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 border-t border-border pt-4">
          <ItemForm invoiceId={id} treatments={availableTreatments} />
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
              <th className="pb-2 font-medium"></th>
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
                <td className="py-2">
                  <DeleteButton
                    action={deletePayment.bind(null, p.id, id)}
                    confirmMessage="متأكد إنك تبي تحذف هذي الدفعة؟ بينعكس القيد المحاسبي المرتبط فيها تلقائياً."
                  />
                </td>
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
