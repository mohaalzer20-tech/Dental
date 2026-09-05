"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addTreatment(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const procedureId = String(formData.get("procedure_id") ?? "") || null;
  const doctorId = String(formData.get("doctor_id") ?? "") || null;
  const appointmentId = String(formData.get("appointment_id") ?? "") || null;
  const treatmentPlanItemId = String(formData.get("treatment_plan_item_id") ?? "") || null;
  const chartEntryId = String(formData.get("chart_entry_id") ?? "") || null;
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
    appointment_id: appointmentId,
    treatment_plan_item_id: treatmentPlanItemId,
    chart_entry_id: chartEntryId,
    tooth_numbers: toothNumbers || null,
    diagnosis: diagnosis || null,
    cost: cost || 0,
  });

  if (error) {
    return { error: "تعذر تسجيل المعالجة: " + error.message };
  }

  if (treatmentPlanItemId) {
    await supabase.from("treatment_plan_items").update({ status: "completed" }).eq("id", treatmentPlanItemId);
  }
  if (chartEntryId) {
    await supabase
      .from("dental_chart_entries")
      .update({ resolved_date: new Date().toISOString().slice(0, 10) })
      .eq("id", chartEntryId);
  }

  revalidatePath("/clinical/treatments");
  revalidatePath("/clinical/treatment-plans");
  revalidatePath("/clinical/dental-chart");
  return null;
}

export async function deleteTreatment(id: string) {
  const supabase = await createClient();
  await supabase.from("treatments").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/clinical/treatments");
}
