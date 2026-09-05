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

export async function updateProcedure(_prevState: { error: string } | null, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const basePrice = Number(formData.get("base_price") ?? 0);

  if (!name) {
    return { error: "اسم الإجراء مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("procedures")
    .update({ name, category: category || null, base_price: basePrice || 0 })
    .eq("id", id);

  if (error) {
    return { error: "تعذر تحديث الإجراء: " + error.message };
  }

  revalidatePath("/clinical/procedures");
  return null;
}

export async function deleteProcedure(id: string) {
  const supabase = await createClient();
  await supabase.from("procedures").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/clinical/procedures");
}
