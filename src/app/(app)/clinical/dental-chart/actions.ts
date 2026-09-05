"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const conditionLabels = [
  "healthy",
  "caries",
  "filled",
  "crown",
  "bridge",
  "implant",
  "root_canal",
  "extraction",
  "missing",
  "fractured",
];

export async function addChartEntry(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const toothNumber = Number(formData.get("tooth_number") ?? 0);
  const condition = String(formData.get("condition") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!patientId || !toothNumber || !conditionLabels.includes(condition)) {
    return { error: "الرجاء اختيار المريض والسن والحالة" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("dental_chart_entries").insert({
    patient_id: patientId,
    tooth_number: toothNumber,
    condition,
    notes: notes || null,
  });

  if (error) {
    return { error: "تعذر تسجيل الحالة: " + error.message };
  }

  revalidatePath("/clinical/dental-chart");
  return null;
}

export async function deleteChartEntry(id: string) {
  const supabase = await createClient();
  await supabase.from("dental_chart_entries").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/clinical/dental-chart");
}

export async function resolveChartEntry(id: string) {
  const supabase = await createClient();
  await supabase
    .from("dental_chart_entries")
    .update({ resolved_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  revalidatePath("/clinical/dental-chart");
  revalidatePath("/clinical/treatments");
}
