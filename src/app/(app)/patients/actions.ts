"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addPatient(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dob = String(formData.get("dob") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    return { error: "اسم المريض مطلوب" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("patients").insert({
    name,
    phone: phone || null,
    dob: dob || null,
    notes: notes || null,
  });

  if (error) {
    return { error: "تعذر إضافة المريض: " + error.message };
  }

  revalidatePath("/patients");
  return null;
}

export async function updatePatient(_prevState: { error: string } | null, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dob = String(formData.get("dob") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    return { error: "اسم المريض مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("patients")
    .update({ name, phone: phone || null, dob: dob || null, notes: notes || null })
    .eq("id", id);

  if (error) {
    return { error: "تعذر تحديث بيانات المريض: " + error.message };
  }

  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  return null;
}

export async function deletePatient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("patients").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  if (error) {
    throw new Error("تعذر حذف المريض: " + error.message);
  }

  revalidatePath("/patients");
  redirect("/patients");
}

export async function togglePaymentReminders(id: string, enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("patients").update({ payment_reminders_enabled: enabled }).eq("id", id);
  revalidatePath(`/patients/${id}`);
  revalidatePath("/follow-ups");
}
