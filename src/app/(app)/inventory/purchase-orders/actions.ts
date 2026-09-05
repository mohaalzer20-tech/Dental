"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addPurchaseOrder(_prevState: { error: string } | null, formData: FormData) {
  const supplierId = String(formData.get("supplier_id") ?? "").trim();

  if (!supplierId) {
    return { error: "الرجاء اختيار المورد" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .insert({ supplier_id: supplierId })
    .select("id")
    .single();

  if (error) {
    return { error: "تعذر إنشاء أمر الشراء: " + error.message };
  }

  redirect(`/inventory/purchase-orders/${data.id}`);
}

export async function addPurchaseOrderItem(_prevState: { error: string } | null, formData: FormData) {
  const poId = String(formData.get("purchase_order_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const unitPrice = Number(formData.get("unit_price") ?? 0);

  if (!itemId || !quantity || !unitPrice) {
    return { error: "الرجاء تعبئة كل الحقول" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("purchase_order_items").insert({
    purchase_order_id: poId,
    item_id: itemId,
    quantity,
    unit_price: unitPrice,
    amount: quantity * unitPrice,
  });

  if (error) {
    return { error: "تعذر إضافة البند: " + error.message };
  }

  const { data: items } = await supabase.from("purchase_order_items").select("amount").eq("purchase_order_id", poId);
  const total = (items ?? []).reduce((sum, it) => sum + Number(it.amount), 0);
  await supabase.from("purchase_orders").update({ subtotal: total, total_amount: total }).eq("id", poId);

  revalidatePath(`/inventory/purchase-orders/${poId}`);
  return null;
}

export async function deletePurchaseOrder(id: string) {
  const supabase = await createClient();
  await supabase.from("purchase_orders").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/inventory/purchase-orders");
}
