"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addTemplate(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const channel = String(formData.get("channel") ?? "sms");
  const body = String(formData.get("body") ?? "").trim();

  if (!name || !body) {
    return { error: "الرجاء تعبئة الاسم والنص" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("communication_templates").insert({ name, channel, body });

  if (error) {
    return { error: "تعذر إضافة القالب: " + error.message };
  }

  revalidatePath("/marketing");
  return null;
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  await supabase.from("communication_templates").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/marketing");
}

export async function queueMessage(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "") || null;
  const channel = String(formData.get("channel") ?? "sms");
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { error: "نص الرسالة مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("message_log").insert({
    patient_id: patientId,
    channel,
    body,
    status: "queued",
  });

  if (error) {
    return { error: "تعذر إضافة الرسالة: " + error.message };
  }

  revalidatePath("/marketing");
  return null;
}
