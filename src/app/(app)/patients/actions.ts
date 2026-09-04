"use server";

import { revalidatePath } from "next/cache";
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
