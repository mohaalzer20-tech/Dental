import { createServiceClient } from "@/lib/supabase/service";
import { sendReminder } from "@/lib/messaging";

type SendResult = "sent" | "failed" | "skipped_no_phone";

async function alreadySent(
  supabase: ReturnType<typeof createServiceClient>,
  relatedType: string,
  relatedId: string,
) {
  const { data } = await supabase
    .from("message_log")
    .select("id")
    .eq("related_type", relatedType)
    .eq("related_id", relatedId)
    .maybeSingle();
  return !!data;
}

async function logAndSend(
  supabase: ReturnType<typeof createServiceClient>,
  params: {
    practiceId: string;
    patientId: string;
    phone: string | null;
    body: string;
    relatedType: string;
    relatedId: string;
  },
): Promise<SendResult> {
  if (!params.phone) {
    await supabase.from("message_log").insert({
      practice_id: params.practiceId,
      patient_id: params.patientId,
      channel: "sms",
      body: params.body,
      status: "failed",
      error: "لا يوجد رقم هاتف للمريض",
      related_type: params.relatedType,
      related_id: params.relatedId,
    });
    return "skipped_no_phone";
  }

  const result = await sendReminder(params.practiceId, params.phone, params.body);
  await supabase.from("message_log").insert({
    practice_id: params.practiceId,
    patient_id: params.patientId,
    channel: result.channel,
    body: params.body,
    status: result.success ? "sent" : "failed",
    sent_at: result.success ? new Date().toISOString() : null,
    error: result.error ?? null,
    related_type: params.relatedType,
    related_id: params.relatedId,
  });
  return result.success ? "sent" : "failed";
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // كل تذكير يُرسل مرة واحدة فقط لكل سجل (alreadySent) — متابعة الدفعات
  // والمواعيد المتأخرة تبقى مسؤولية الموظف بعد أول تذكير آلي، لتفادي الإزعاج المتكرر.
  const supabase = createServiceClient();
  const counts = { appointment_reminder: 0, recall: 0, payment_reminder: 0, failed: 0 };

  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  const today = now.toISOString().slice(0, 10);

  // 1) تذكير بموعد الغد
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, practice_id, patient_id, start_time, patients!inner(phone, name, appointment_reminders_enabled)")
    .is("deleted_at", null)
    .in("status", ["pending", "scheduled", "confirmed"])
    .gte("start_time", tomorrowStart.toISOString())
    .lt("start_time", tomorrowEnd.toISOString())
    .eq("patients.appointment_reminders_enabled", true);

  for (const appt of appointments ?? []) {
    if (await alreadySent(supabase, "appointment_reminder", appt.id)) continue;
    const patient = appt.patients as unknown as { phone: string | null; name: string };
    const time = new Date(appt.start_time).toLocaleString("ar-SY", { hour: "2-digit", minute: "2-digit" });
    const body = `تذكير: لديك موعد غداً الساعة ${time}. لإلغاء أو تعديل الموعد الرجاء التواصل مع العيادة.`;
    const result = await logAndSend(supabase, {
      practiceId: appt.practice_id,
      patientId: appt.patient_id,
      phone: patient.phone,
      body,
      relatedType: "appointment_reminder",
      relatedId: appt.id,
    });
    if (result === "sent") counts.appointment_reminder++;
    else if (result === "failed") counts.failed++;
  }

  // 2) متابعة دورية مستحقة
  const { data: recalls } = await supabase
    .from("appointments")
    .select("id, practice_id, patient_id, recall_date, patients!inner(phone, name, appointment_reminders_enabled)")
    .is("deleted_at", null)
    .eq("recall_completed", false)
    .not("recall_date", "is", null)
    .lte("recall_date", today)
    .eq("patients.appointment_reminders_enabled", true);

  for (const r of recalls ?? []) {
    if (await alreadySent(supabase, "recall", r.id)) continue;
    const patient = r.patients as unknown as { phone: string | null; name: string };
    const body = `حان وقت متابعتك الدورية بعيادتنا — الرجاء التواصل معنا لحجز موعد.`;
    const result = await logAndSend(supabase, {
      practiceId: r.practice_id,
      patientId: r.patient_id,
      phone: patient.phone,
      body,
      relatedType: "recall",
      relatedId: r.id,
    });
    if (result === "sent") counts.recall++;
    else if (result === "failed") counts.failed++;
  }

  // 3) متابعة دفعة متأخرة
  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, practice_id, patient_id, invoice_no, total_amount, paid_amount, patients!inner(phone, name, payment_reminders_enabled)",
    )
    .is("deleted_at", null)
    .in("status", ["unpaid", "partial"])
    .eq("patients.payment_reminders_enabled", true);

  for (const inv of invoices ?? []) {
    if (await alreadySent(supabase, "payment_reminder", inv.id)) continue;
    const patient = inv.patients as unknown as { phone: string | null; name: string };
    const remaining = inv.total_amount - inv.paid_amount;
    const body = `تذكير: لديك مبلغ متبقي ${remaining} على الفاتورة رقم ${inv.invoice_no}. الرجاء التواصل معنا للتسوية.`;
    const result = await logAndSend(supabase, {
      practiceId: inv.practice_id,
      patientId: inv.patient_id,
      phone: patient.phone,
      body,
      relatedType: "payment_reminder",
      relatedId: inv.id,
    });
    if (result === "sent") counts.payment_reminder++;
    else if (result === "failed") counts.failed++;
  }

  return Response.json(counts);
}
