"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addTransaction(_prevState: { error: string } | null, formData: FormData) {
  const itemId = String(formData.get("item_id") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!itemId || !type || !quantity) {
    return { error: "الرجاء تعبئة كل الحقول" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stock_transactions").insert({
    item_id: itemId,
    type,
    quantity,
    notes: notes || null,
  });

  if (error) {
    return { error: "تعذر تسجيل الحركة: " + error.message };
  }

  revalidatePath("/inventory/transactions");
  revalidatePath("/inventory");
  return null;
}
