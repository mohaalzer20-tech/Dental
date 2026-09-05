"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addItem(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "piece").trim();
  const minimumStock = Number(formData.get("minimum_stock") ?? 0);
  const purchasePrice = Number(formData.get("purchase_price") ?? 0);

  if (!name) {
    return { error: "اسم الصنف مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").insert({
    name,
    unit: unit || "piece",
    minimum_stock: minimumStock || 0,
    purchase_price: purchasePrice || 0,
  });

  if (error) {
    return { error: "تعذر إضافة الصنف: " + error.message };
  }

  revalidatePath("/inventory");
  return null;
}

export async function updateItem(_prevState: { error: string } | null, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "piece").trim();
  const minimumStock = Number(formData.get("minimum_stock") ?? 0);
  const purchasePrice = Number(formData.get("purchase_price") ?? 0);

  if (!name) {
    return { error: "اسم الصنف مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .update({ name, unit: unit || "piece", minimum_stock: minimumStock || 0, purchase_price: purchasePrice || 0 })
    .eq("id", id);

  if (error) {
    return { error: "تعذر تحديث الصنف: " + error.message };
  }

  revalidatePath("/inventory");
  return null;
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  await supabase.from("inventory_items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/inventory");
}
