import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePatient } from "../actions";
import DeleteButton from "@/components/DeleteButton";
import PatientEditForm from "./PatientEditForm";
import PaymentReminderToggle from "./PaymentReminderToggle";
import { conditionLabels } from "../../clinical/conditionLabels";

const appointmentStatusLabels: Record<string, string> = {
  pending: "بانتظار التأكيد",
  scheduled: "مجدول",
  confirmed: "مؤكد",
  completed: "منتهي",
  cancelled: "ملغى",
  no_show: "لم يحضر",
};

const invoiceStatusLabels: Record<string, string> = {
  unpaid: "غير مدفوعة",
  partial: "مدفوعة جزئياً",
  paid: "مدفوعة",
  cancelled: "ملغاة",
};

const planStatusLabels: Record<string, string> = {
  draft: "مسودة",
  proposed: "مقترحة",
  accepted: "مقبولة",
  in_progress: "قيد التنفيذ",
  completed: "منتهية",
  cancelled: "ملغاة",
};

const labStatusLabels: Record<string, string> = {
  sent: "أُرسل",
  in_progress: "قيد التنفيذ",
  received: "تم الاستلام",
  cancelled: "ملغى",
};

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, name, phone, dob, notes, payment_reminders_enabled, created_at")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!patient) {
    return <p className="text-ink-muted">المريض غير موجود</p>;
  }

  const [
    { data: appointments },
    { data: invoices },
    { data: treatmentPlans },
    { data: treatments },
    { data: prescriptions },
    { data: chartEntries },
    { data: labOrders },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, start_time, status")
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("start_time", { ascending: false })
      .limit(5),
    supabase
      .from("invoices")
      .select("id, invoice_no, total_amount, paid_amount, status")
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("treatment_plans")
      .select("id, title, status")
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("treatments")
      .select("id, diagnosis, cost, performed_at, procedures(name)")
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("performed_at", { ascending: false })
      .limit(5),
    supabase
      .from("prescriptions")
      .select("id, diagnosis, created_at")
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("dental_chart_entries")
      .select("id, tooth_number, condition")
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("diagnosed_date", { ascending: false })
      .limit(10),
    supabase
      .from("lab_orders")
      .select("id, description, status")
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("sent_date", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-muted">ملف المريض</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{patient.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {patient.phone ?? "بدون رقم هاتف"} {patient.dob ? `— تاريخ الميلاد: ${patient.dob}` : ""}
          </p>
          {patient.notes && <p className="mt-1 text-sm text-ink-muted">ملاحظات: {patient.notes}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <PaymentReminderToggle id={patient.id} enabled={patient.payment_reminders_enabled} />
          <DeleteButton
            action={deletePatient.bind(null, patient.id)}
            confirmMessage="متأكد إنك تبي تحذف هذا المريض؟ بيختفي من كل القوائم بس يضل بسجل التدقيق."
          />
        </div>
      </div>

      <PatientEditForm patient={patient} />

      <Section title="المواعيد" seeAllHref={`/appointments?patient_id=${id}`}>
        {appointments?.length ? (
          <ul className="flex flex-col gap-2">
            {appointments.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <span className="font-mono text-ink-muted">
                  {new Date(a.start_time).toLocaleString("ar-SY")}
                </span>
                <span className="text-ink-muted">{appointmentStatusLabels[a.status] ?? a.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow text="ما في مواعيد" />
        )}
      </Section>

      <Section title="الفواتير والمدفوعات" seeAllHref={`/invoices?patient_id=${id}`}>
        {invoices?.length ? (
          <ul className="flex flex-col gap-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex justify-between text-sm">
                <Link href={`/invoices/${inv.id}`} className="font-mono text-ink underline underline-offset-2">
                  {inv.invoice_no}
                </Link>
                <span className="flex items-center gap-3 text-ink-muted">
                  {inv.paid_amount}/{inv.total_amount} — {invoiceStatusLabels[inv.status] ?? inv.status}
                  <Link href={`/invoices/${inv.id}/print`} className="underline underline-offset-2">
                    طباعة
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow text="ما في فواتير" />
        )}
      </Section>

      <Section title="خطط العلاج" seeAllHref={`/clinical/treatment-plans?patient_id=${id}`}>
        {treatmentPlans?.length ? (
          <ul className="flex flex-col gap-2">
            {treatmentPlans.map((tp) => (
              <li key={tp.id} className="flex justify-between text-sm">
                <Link
                  href={`/clinical/treatment-plans/${tp.id}`}
                  className="text-ink underline underline-offset-2"
                >
                  {tp.title}
                </Link>
                <span className="text-ink-muted">{planStatusLabels[tp.status] ?? tp.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow text="ما في خطط علاج" />
        )}
      </Section>

      <Section title="المعالجات" seeAllHref={`/clinical/treatments?patient_id=${id}`}>
        {treatments?.length ? (
          <ul className="flex flex-col gap-2">
            {treatments.map((t) => (
              <li key={t.id} className="flex justify-between text-sm">
                <span className="text-ink">
                  {(t.procedures as unknown as { name: string } | null)?.name ?? t.diagnosis ?? "معالجة"}
                </span>
                <span className="font-mono text-ink-muted">{t.cost}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow text="ما في معالجات" />
        )}
      </Section>

      <Section title="الوصفات" seeAllHref={`/clinical/prescriptions?patient_id=${id}`}>
        {prescriptions?.length ? (
          <ul className="flex flex-col gap-2">
            {prescriptions.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <Link
                  href={`/clinical/prescriptions/${p.id}`}
                  className="text-ink underline underline-offset-2"
                >
                  {p.diagnosis ?? "وصفة"}
                </Link>
                <span className="flex items-center gap-3 text-ink-muted">
                  <span className="font-mono">{new Date(p.created_at).toLocaleDateString("ar-SY")}</span>
                  <Link href={`/clinical/prescriptions/${p.id}/print`} className="underline underline-offset-2">
                    طباعة
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow text="ما في وصفات" />
        )}
      </Section>

      <Section title="رسم الأسنان" seeAllHref={`/clinical/dental-chart?patient_id=${id}`}>
        {chartEntries?.length ? (
          <ul className="flex flex-wrap gap-2">
            {chartEntries.map((c) => (
              <li
                key={c.id}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-ink-muted"
              >
                سن {c.tooth_number} — {conditionLabels[c.condition] ?? c.condition}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow text="ما في سجلات" />
        )}
      </Section>

      <Section title="طلبات المختبر" seeAllHref={`/lab?patient_id=${id}`}>
        {labOrders?.length ? (
          <ul className="flex flex-col gap-2">
            {labOrders.map((o) => (
              <li key={o.id} className="flex justify-between text-sm">
                <span className="text-ink">{o.description ?? "طلب مختبر"}</span>
                <span className="text-ink-muted">{labStatusLabels[o.status] ?? o.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow text="ما في طلبات مختبر" />
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  seeAllHref,
  children,
}: {
  title: string;
  seeAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <Link href={seeAllHref} className="text-xs text-ink-muted underline underline-offset-2">
          عرض الكل
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-sm text-ink-muted">{text}</p>;
}
