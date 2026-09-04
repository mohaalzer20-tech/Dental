"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addTreatment(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const procedureId = String(formData.get("procedure_id") ?? "") || null;
  const doctorId = String(formData.get("doctor_id") ?? "") || null;
  const toothNumbers = String(formData.get("tooth_numbers") ?? "").trim();
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const cost = Number(formData.get("cost") ?? 0);

  if (!patientId) {
    return { error: "الرجاء اختيار المريض" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("treatments").insert({
    patient_id: patientId,
    procedure_id: procedureId,
    doctor_id: doctorId,
    tooth_numbers: toothNumbers || null,
    diagnosis: diagnosis || null,
    cost: cost || 0,
  });

  if (error) {
    return { error: "تعذر تسجيل المعالجة: " + error.message };
  }

  revalidatePath("/clinical/treatments");
  return null;
}
