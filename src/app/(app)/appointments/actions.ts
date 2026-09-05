"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addAppointment(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const recallDate = String(formData.get("recall_date") ?? "").trim();

  if (!patientId || !startTime || !endTime) {
    return { error: "الرجاء اختيار المريض ووقت البداية والنهاية" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("appointments").insert({
    patient_id: patientId,
    start_time: new Date(startTime).toISOString(),
    end_time: new Date(endTime).toISOString(),
    notes: notes || null,
    recall_date: recallDate || null,
  });

  if (error) {
    return { error: "تعذر إضافة الموعد: " + error.message };
  }

  revalidatePath("/appointments");
  return null;
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("appointments").update({ status }).eq("id", appointmentId);
  revalidatePath("/appointments");
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  await supabase.from("appointments").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/appointments");
}

export async function updateRecallDate(id: string, recallDate: string) {
  const supabase = await createClient();
  await supabase
    .from("appointments")
    .update({ recall_date: recallDate || null, recall_completed: false })
    .eq("id", id);
  revalidatePath("/appointments");
  revalidatePath("/follow-ups");
}

export async function markRecallCompleted(id: string) {
  const supabase = await createClient();
  await supabase.from("appointments").update({ recall_completed: true }).eq("id", id);
  revalidatePath("/appointments");
  revalidatePath("/follow-ups");
}
