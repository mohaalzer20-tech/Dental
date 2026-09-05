import { createClient } from "@/lib/supabase/server";
import ClinicLetterhead from "@/components/ClinicLetterhead";
import PrintButton from "@/components/PrintButton";
import SignatureBlock from "@/components/SignatureBlock";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: practice }, { data: invoice }, { data: items }] = await Promise.all([
    supabase.from("practices").select("clinic_name, doctor_name, address, phone, tax_number").single(),
    supabase
      .from("invoices")
      .select(
        "id, invoice_no, created_at, subtotal, discount_amount, total_amount, paid_amount, patients(name, phone, dob)",
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase.from("invoice_items").select("description, quantity, unit_price, amount").eq("invoice_id", id),
  ]);

  if (!invoice) {
    return <p className="text-ink-muted">الفاتورة غير موجودة</p>;
  }

  const patient = invoice.patients as unknown as { name: string; phone: string | null; dob: string | null } | null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 print:max-w-none">
      <ClinicLetterhead practice={practice} taxNumber={practice?.tax_number} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">فاتورة {invoice.invoice_no}</h1>
          <p className="text-sm text-ink-muted">
            التاريخ: {new Date(invoice.created_at).toLocaleDateString("ar-SY")}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-border p-4 text-sm">
        <p className="text-ink">المريض: {patient?.name ?? "—"}</p>
        {patient?.phone && <p className="text-ink-muted">الهاتف: {patient.phone}</p>}
        {patient?.dob && <p className="text-ink-muted">تاريخ الميلاد: {patient.dob}</p>}
      </div>

      <table className="w-full text-right text-sm">
        <thead className="text-ink-muted">
          <tr>
            <th className="border-b border-border pb-2 font-medium">العلاج / الوصف</th>
            <th className="border-b border-border pb-2 font-medium">الكمية</th>
            <th className="border-b border-border pb-2 font-medium">سعر الوحدة</th>
            <th className="border-b border-border pb-2 font-medium">المجموع</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((it, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-2 text-ink">{it.description}</td>
              <td className="py-2 font-mono text-ink-muted">{it.quantity}</td>
              <td className="py-2 font-mono text-ink-muted">{it.unit_price}</td>
              <td className="py-2 font-mono text-ink-muted">{it.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col items-end gap-1 text-sm">
        <p className="text-ink-muted">المجموع الفرعي: <span className="font-mono text-ink">{invoice.subtotal}</span></p>
        <p className="text-ink-muted">الخصم: <span className="font-mono text-ink">{invoice.discount_amount}</span></p>
        <p className="text-base font-bold text-ink">الإجمالي: <span className="font-mono">{invoice.total_amount}</span></p>
        <p className="text-ink-muted">المدفوع: <span className="font-mono text-ink">{invoice.paid_amount}</span></p>
        <p className="text-ink-muted">
          المتبقي: <span className="font-mono text-ink">{invoice.total_amount - invoice.paid_amount}</span>
        </p>
      </div>

      <SignatureBlock labels={["توقيع المريض", "توقيع وختم العيادة"]} />
    </div>
  );
}
