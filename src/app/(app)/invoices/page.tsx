import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InvoiceForm from "./InvoiceForm";

const statusConfig: Record<string, { label: string; className: string }> = {
  unpaid: { label: "غير مدفوعة", className: "border-danger text-danger" },
  partial: { label: "مدفوعة جزئياً", className: "border-accent text-accent" },
  paid: { label: "مدفوعة", className: "border-primary text-primary-strong" },
  cancelled: { label: "ملغاة", className: "border-ink-muted text-ink-muted" },
};

export default async function InvoicesPage() {
  const supabase = await createClient();

  const [{ data: invoices }, { data: patients }, { data: providers }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_no, total_amount, paid_amount, status, created_at, patients(name)")
      .order("created_at", { ascending: false }),
    supabase.from("patients").select("id, name").order("name"),
    supabase.from("users").select("id, full_name").order("full_name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{invoices?.length ?? 0} فاتورة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">الفواتير</h1>
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
            </tr>
          </thead>
          <tbody>
            {invoices?.length ? (
              invoices.map((inv) => {
                const status = statusConfig[inv.status] ?? statusConfig.unpaid;
                return (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono text-ink">
                      <Link href={`/invoices/${inv.id}`} className="underline underline-offset-2">
                        {inv.invoice_no}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-ink">
                      {(inv.patients as unknown as { name: string } | null)?.name ?? "—"}
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
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
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
