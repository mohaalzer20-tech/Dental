"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function hasConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startIso: string,
  endIso: string,
  excludeId?: string,
) {
  let query = supabase
    .from("appointments")
    .select("id")
    .is("deleted_at", null)
    .neq("status", "cancelled")
    .lt("start_time", endIso)
    .gt("end_time", startIso)
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

export async function addAppointment(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const recallDate = String(formData.get("recall_date") ?? "").trim();
  const appointmentTypeId = String(formData.get("appointment_type_id") ?? "") || null;

  if (!patientId || !startTime || !endTime) {
    return { error: "الرجاء اختيار المريض ووقت البداية والنهاية" };
  }

  const startIso = new Date(startTime).toISOString();
  const endIso = new Date(endTime).toISOString();

  const supabase = await createClient();

  if (await hasConflict(supabase, startIso, endIso)) {
    return { error: "يوجد موعد آخر متعارض مع هذا الوقت" };
  }

  const { error } = await supabase.from("appointments").insert({
    patient_id: patientId,
    start_time: startIso,
    end_time: endIso,
    notes: notes || null,
    recall_date: recallDate || null,
    appointment_type_id: appointmentTypeId,
  });

  if (error) {
    return { error: "تعذر إضافة الموعد: " + error.message };
  }

  revalidatePath("/appointments");
  return null;
}

export async function addAppointmentType(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const duration = Number(formData.get("default_duration_minutes") ?? 30);
  const color = String(formData.get("color") ?? "#22d3ee");

  if (!name) {
    return { error: "اسم النوع مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("appointment_types").insert({
    name,
    default_duration_minutes: duration || 30,
    color,
  });

  if (error) return { error: "تعذر إضافة النوع: " + error.message };

  revalidatePath("/appointments");
  return null;
}

export async function deleteAppointmentType(id: string) {
  const supabase = await createClient();
  await supabase.from("appointment_types").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/appointments");
}

export async function rescheduleAppointment(
  id: string,
  startIso: string,
  endIso: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  if (await hasConflict(supabase, startIso, endIso, id)) {
    return { error: "يوجد موعد آخر متعارض مع هذا الوقت" };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ start_time: startIso, end_time: endIso })
    .eq("id", id);

  if (error) return { error: "تعذر تحديث الموعد: " + error.message };

  revalidatePath("/appointments");
  return {};
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
