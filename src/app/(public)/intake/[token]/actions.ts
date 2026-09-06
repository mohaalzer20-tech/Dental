"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitIntake(_prevState: { error?: string; done?: boolean } | null, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const allergies = String(formData.get("allergies") ?? "").trim();
  const medicalHistory = String(formData.get("medical_history") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_patient_intake", {
    p_token: token,
    p_allergies: allergies,
    p_medical_history: medicalHistory,
  });

  if (error) {
    return { error: "تعذر إرسال النموذج: " + error.message };
  }

  return { done: true };
}
