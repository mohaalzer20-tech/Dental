"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadPatientImage(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "");
  const category = String(formData.get("category") ?? "photo");
  const beforeAfter = String(formData.get("before_after") ?? "") || null;
  const toothNumberRaw = String(formData.get("tooth_number") ?? "");
  const toothNumber = toothNumberRaw ? Number(toothNumberRaw) : null;
  const file = formData.get("file") as File | null;

  if (!patientId || !file || file.size === 0) {
    return { error: "الرجاء اختيار المريض والملف" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: me } = await supabase.from("users").select("practice_id").eq("id", user.id).single();
  if (!me) return { error: "غير مصرح" };

  const ext = file.name.split(".").pop() || "bin";
  const path = `${me.practice_id}/${patientId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("patient-media").upload(path, file);
  if (uploadError) {
    return { error: "تعذر رفع الملف: " + uploadError.message };
  }

  const { error } = await supabase.from("patient_images").insert({
    patient_id: patientId,
    category,
    before_after: beforeAfter,
    tooth_number: toothNumber,
    storage_path: path,
    uploaded_by: user.id,
  });

  if (error) {
    return { error: "تعذر حفظ السجل: " + error.message };
  }

  revalidatePath(`/patients/${patientId}`);
  return null;
}

export async function deletePatientImage(id: string, patientId: string) {
  const supabase = await createClient();
  await supabase.from("patient_images").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/patients/${patientId}`);
}
