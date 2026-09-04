"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addSupplier(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const contactPerson = String(formData.get("contact_person") ?? "").trim();

  if (!name) {
    return { error: "اسم المورد مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    name,
    phone: phone || null,
    contact_person: contactPerson || null,
  });

  if (error) {
    return { error: "تعذر إضافة المورد: " + error.message };
  }

  revalidatePath("/inventory/suppliers");
  return null;
}
