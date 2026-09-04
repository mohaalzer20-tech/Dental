"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addAppointment(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!patientId || !startTime || !endTime) {
    return { error: "الرجاء اختيار المريض ووقت البداية والنهاية" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("appointments").insert({
    patient_id: patientId,
    start_time: new Date(startTime).toISOString(),
    end_time: new Date(endTime).toISOString(),
    notes: notes || null,
  });

  if (error) {
    return { error: "تعذر إضافة الموعد: " + error.message };
  }

  revalidatePath("/appointments");
  return null;
}
