"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addToWaitlist(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const desiredFrom = String(formData.get("desired_from") ?? "") || null;
  const desiredTo = String(formData.get("desired_to") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!patientId) {
    return { error: "الرجاء اختيار المريض" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("appointment_waitlist").insert({
    patient_id: patientId,
    desired_from: desiredFrom ? new Date(desiredFrom).toISOString() : null,
    desired_to: desiredTo ? new Date(desiredTo).toISOString() : null,
    notes: notes || null,
  });

  if (error) return { error: "تعذر الإضافة: " + error.message };

  revalidatePath("/appointments/waitlist");
  return null;
}

export async function toggleNotified(id: string, notified: boolean) {
  const supabase = await createClient();
  await supabase.from("appointment_waitlist").update({ notified }).eq("id", id);
  revalidatePath("/appointments/waitlist");
}

export async function removeFromWaitlist(id: string) {
  const supabase = await createClient();
  await supabase.from("appointment_waitlist").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/appointments/waitlist");
}
