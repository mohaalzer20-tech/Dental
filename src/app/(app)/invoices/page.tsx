import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import InvoiceForm from "./InvoiceForm";
import { deleteInvoice } from "./actions";

const statusConfig: Record<string, { label: string; className: string }> = {
  unpaid: { label: "غير مدفوعة", className: "border-danger text-danger" },
  partial: { label: "مدفوعة جزئياً", className: "border-accent text-accent" },
  paid: { label: "مدفوعة", className: "border-primary text-primary-strong" },
  cancelled: { label: "ملغاة", className: "border-ink-muted text-ink-muted" },
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  const supabase = await createClient();

  let invoicesQuery = supabase
    .from("invoices")
    .select("id, invoice_no, total_amount, paid_amount, status, created_at, patients(id, name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (patient_id) invoicesQuery = invoicesQuery.eq("patient_id", patient_id);

  const [{ data: invoices }, { data: patients }, { data: providers }] = await Promise.all([
    invoicesQuery,
    supabase.from("patients").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("users").select("id, full_name").order("full_name"),
  ]);

  const filteredPatientName = patient_id ? (patients ?? []).find((p) => p.id === patient_id)?.name : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{invoices?.length ?? 0} فاتورة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">الفواتير</h1>
        {filteredPatientName && (
          <p className="mt-1 text-sm text-ink-muted">
            مفلترة لـ {filteredPatientName} —{" "}
            <Link href="/invoices" className="underline underline-offset-2">
              إزالة الفلتر
            </Link>
          </p>
        )}
      </div>

      <InvoiceForm patients={patients ?? []} providers={providers ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">رقم الفاتورة</th>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">الإجمالي</th>
              <th className="px-4 py-2.5 font-medium">المدفوع</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {invoices?.length ? (
              invoices.map((inv) => {
                const status = statusConfig[inv.status] ?? statusConfig.unpaid;
                const patient = inv.patients as unknown as { id?: string; name: string } | null;
                return (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono text-ink">
                      <Link href={`/invoices/${inv.id}`} className="underline underline-offset-2">
                        {inv.invoice_no}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-ink">
                      {patient?.id ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{inv.total_amount}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{inv.paid_amount}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <DeleteButton action={deleteInvoice.bind(null, inv.id)} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  ما في فواتير بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
