"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addProcedure(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const basePrice = Number(formData.get("base_price") ?? 0);

  if (!name) {
    return { error: "اسم الإجراء مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("procedures").insert({
    name,
    category: category || null,
    base_price: basePrice || 0,
  });

  if (error) {
    return { error: "تعذر إضافة الإجراء: " + error.message };
  }

  revalidatePath("/clinical/procedures");
  return null;
}
