"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addPrescription(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();

  if (!patientId) {
    return { error: "الرجاء اختيار المريض" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .insert({ patient_id: patientId, diagnosis: diagnosis || null })
    .select("id")
    .single();

  if (error) {
    return { error: "تعذر إنشاء الوصفة: " + error.message };
  }

  redirect(`/clinical/prescriptions/${data.id}`);
}

export async function addPrescriptionItem(_prevState: { error: string } | null, formData: FormData) {
  const prescriptionId = String(formData.get("prescription_id") ?? "");
  const medicationName = String(formData.get("medication_name") ?? "").trim();
  const dosage = String(formData.get("dosage") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim();

  if (!medicationName) {
    return { error: "اسم الدواء مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("prescription_items").insert({
    prescription_id: prescriptionId,
    medication_name: medicationName,
    dosage: dosage || null,
    frequency: frequency || null,
    duration: duration || null,
  });

  if (error) {
    return { error: "تعذر إضافة الدواء: " + error.message };
  }

  revalidatePath(`/clinical/prescriptions/${prescriptionId}`);
  return null;
}
