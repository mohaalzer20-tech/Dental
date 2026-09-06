import { createClient } from "@/lib/supabase/server";
import { withClinicSignature } from "@/lib/messageSignature";
import FollowUpsClient, { type FollowUpItem } from "./FollowUpsClient";

export default async function FollowUpsPage() {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in2Days = new Date(now);
  in2Days.setDate(in2Days.getDate() + 2);

  const [{ data: practice }, { data: appointments }, { data: recalls }, { data: invoices }, { data: templates }] =
    await Promise.all([
      supabase.from("practices").select("clinic_name, google_maps_url").single(),
      supabase
        .from("appointments")
        .select("id, start_time, patients!inner(id, name, phone, appointment_reminders_enabled)")
        .is("deleted_at", null)
        .in("status", ["pending", "scheduled", "confirmed"])
        .gte("start_time", now.toISOString())
        .lt("start_time", in2Days.toISOString())
        .eq("patients.appointment_reminders_enabled", true)
        .order("start_time", { ascending: true }),
      supabase
        .from("appointments")
        .select("id, recall_date, patients!inner(id, name, phone, appointment_reminders_enabled)")
        .is("deleted_at", null)
        .eq("recall_completed", false)
        .eq("patients.appointment_reminders_enabled", true)
        .not("recall_date", "is", null)
        .lte("recall_date", today)
        .order("recall_date", { ascending: true }),
      supabase
        .from("invoices")
        .select(
          "id, invoice_no, total_amount, paid_amount, status, created_at, patients!inner(id, name, phone, payment_reminders_enabled)",
        )
        .is("deleted_at", null)
        .in("status", ["unpaid", "partial"])
        .eq("patients.payment_reminders_enabled", true)
        .order("created_at", { ascending: true }),
      supabase.from("communication_templates").select("id, name, body").is("deleted_at", null).order("name"),
    ]);

  const clinicName = practice?.clinic_name ?? "العيادة";
  const mapsUrl = practice?.google_maps_url ?? null;

  const appointmentItems: FollowUpItem[] = (appointments ?? []).map((a) => {
    const patient = a.patients as unknown as { id: string; name: string; phone: string | null };
    const dt = new Date(a.start_time);
    const date = dt.toLocaleDateString("ar-SY-u-nu-latn");
    const time = dt.toLocaleTimeString("ar-SY-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
    return {
      id: a.id,
      patientId: patient.id,
      patientName: patient.name,
      phone: patient.phone,
      detail: `${date} — ${time}`,
      href: `/patients/${patient.id}`,
      defaultMessage: withClinicSignature(
        `أهلاً ${patient.name}، تذكير بموعدك بتاريخ ${date} الساعة ${time}. بانتظارك! ✨`,
        clinicName,
        mapsUrl,
      ),
    };
  });

  const recallItems: FollowUpItem[] = (recalls ?? []).map((r) => {
    const patient = r.patients as unknown as { id: string; name: string; phone: string | null };
    return {
      id: r.id,
      patientId: patient.id,
      patientName: patient.name,
      phone: patient.phone,
      detail: `مستحقة منذ: ${r.recall_date}`,
      href: `/patients/${patient.id}`,
      defaultMessage: withClinicSignature(
        `أهلاً ${patient.name}، اشتقنالك! حان وقت زيارتك الدورية لفحص واطمينان دائم على صحة أسنانك. تواصل معنا لتحديد موعد يناسبك. 😊`,
        clinicName,
        mapsUrl,
      ),
      completeAction: true as const,
    };
  });

  const invoiceItems: FollowUpItem[] = (invoices ?? []).map((inv) => {
    const patient = inv.patients as unknown as { id: string; name: string; phone: string | null };
    const remaining = inv.total_amount - inv.paid_amount;
    return {
      id: inv.id,
      patientId: patient.id,
      patientName: patient.name,
      phone: patient.phone,
      detail: `فاتورة ${inv.invoice_no} — متبقي ${remaining}`,
      href: `/invoices/${inv.id}`,
      defaultMessage: withClinicSignature(
        `أهلاً ${patient.name}، نذكّرك بوجود مبلغ متبقي ${remaining} على فاتورة رقم ${inv.invoice_no}. يرجى التواصل لتسوية الدفعة بأقرب وقت يناسبك.`,
        clinicName,
        mapsUrl,
      ),
    };
  });

  const templateOptions = (templates ?? []).map((t) => ({ id: t.id, name: t.name, body: t.body }));

  return (
    <FollowUpsClient
      appointments={appointmentItems}
      recalls={recallItems}
      invoices={invoiceItems}
      templates={templateOptions}
    />
  );
}
