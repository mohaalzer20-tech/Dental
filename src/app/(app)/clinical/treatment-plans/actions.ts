"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addTreatmentPlan(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!patientId || !title) {
    return { error: "الرجاء اختيار المريض وكتابة عنوان الخطة" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treatment_plans")
    .insert({ patient_id: patientId, title, notes: notes || null })
    .select("id")
    .single();

  if (error) {
    return { error: "تعذر إنشاء الخطة: " + error.message };
  }

  redirect(`/clinical/treatment-plans/${data.id}`);
}

export async function addPlanItem(_prevState: { error: string } | null, formData: FormData) {
  const planId = String(formData.get("treatment_plan_id") ?? "");
  const procedureId = String(formData.get("procedure_id") ?? "") || null;
  const toothNumbers = String(formData.get("tooth_numbers") ?? "").trim();
  const estimatedCost = Number(formData.get("estimated_cost") ?? 0);

  if (!procedureId && !toothNumbers) {
    return { error: "الرجاء اختيار الإجراء أو كتابة رقم السن" };
  }
  if (estimatedCost < 0) {
    return { error: "التكلفة المقدّرة لا يمكن أن تكون سالبة" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("treatment_plan_items").insert({
    treatment_plan_id: planId,
    procedure_id: procedureId,
    tooth_numbers: toothNumbers || null,
    estimated_cost: estimatedCost || 0,
  });

  if (error) {
    return { error: "تعذر إضافة البند: " + error.message };
  }

  revalidatePath(`/clinical/treatment-plans/${planId}`);
  return null;
}

export async function updatePlanStatus(planId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("treatment_plans").update({ status }).eq("id", planId);
  revalidatePath(`/clinical/treatment-plans/${planId}`);
}

export async function deleteTreatmentPlan(id: string) {
  const supabase = await createClient();
  await supabase.from("treatment_plans").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/clinical/treatment-plans");
}

export async function acceptTreatmentPlan(_prevState: { error: string } | null, formData: FormData) {
  const planId = String(formData.get("treatment_plan_id") ?? "");
  const acceptedByName = String(formData.get("accepted_by_name") ?? "").trim();

  if (!acceptedByName) {
    return { error: "الرجاء كتابة اسم الموافق" };
  }

  const supabase = await createClient();

  const { data: plan } = await supabase.from("treatment_plans").select("status").eq("id", planId).single();
  const shouldAdvanceStatus = !plan || plan.status === "draft" || plan.status === "proposed";

  const { error } = await supabase
    .from("treatment_plans")
    .update({
      accepted_by_name: acceptedByName,
      accepted_at: new Date().toISOString(),
      ...(shouldAdvanceStatus ? { status: "accepted" } : {}),
    })
    .eq("id", planId);

  if (error) {
    return { error: "تعذر تسجيل الموافقة: " + error.message };
  }

  revalidatePath(`/clinical/treatment-plans/${planId}`);
  return null;
}
