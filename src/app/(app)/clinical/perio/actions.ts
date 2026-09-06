"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addPerioEntry(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const toothNumber = Number(formData.get("tooth_number") ?? 0);
  const pocketDepth = formData.get("pocket_depth") ? Number(formData.get("pocket_depth")) : null;
  const bleeding = formData.get("bleeding") === "on";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!patientId || !toothNumber) {
    return { error: "الرجاء اختيار المريض والسن" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("perio_charts").insert({
    patient_id: patientId,
    tooth_number: toothNumber,
    pocket_depth: pocketDepth,
    bleeding,
    notes: notes || null,
  });

  if (error) {
    return { error: "تعذر تسجيل القياس: " + error.message };
  }

  revalidatePath("/clinical/perio");
  return null;
}

export async function deletePerioEntry(id: string) {
  const supabase = await createClient();
  await supabase.from("perio_charts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/clinical/perio");
}
