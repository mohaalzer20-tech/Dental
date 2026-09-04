"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function bookAppointment(_prevState: { error: string } | null, formData: FormData) {
  const practiceId = String(formData.get("practice_id") ?? "");
  const name = String(formData.get("patient_name") ?? "").trim();
  const phone = String(formData.get("patient_phone") ?? "").trim();
  const preferredTime = String(formData.get("preferred_time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !phone || !preferredTime) {
    return { error: "الرجاء تعبئة الاسم والهاتف والوقت المفضّل" };
  }

  const supabase = await createClient();

  const { data: token, error } = await supabase.rpc("request_appointment", {
    p_practice_id: practiceId,
    p_patient_name: name,
    p_patient_phone: phone,
    p_preferred_time: new Date(preferredTime).toISOString(),
    p_notes: notes || null,
  });

  if (error) {
    return { error: "تعذر إرسال طلب الحجز: " + error.message };
  }

  redirect(`/track/${token}`);
}
