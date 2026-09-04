"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addInvoice(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const providerId = String(formData.get("provider_id") ?? "").trim();
  const discount = Number(formData.get("discount_amount") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!patientId) {
    return { error: "الرجاء اختيار المريض" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      patient_id: patientId,
      provider_id: providerId || null,
      discount_amount: discount || 0,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "تعذر إنشاء الفاتورة: " + error.message };
  }

  redirect(`/invoices/${data.id}`);
}

export async function addInvoiceItem(_prevState: { error: string } | null, formData: FormData) {
  const invoiceId = String(formData.get("invoice_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const unitPrice = Number(formData.get("unit_price") ?? 0);

  if (!description || !unitPrice) {
    return { error: "الرجاء تعبئة الوصف والسعر" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("invoice_items").insert({
    invoice_id: invoiceId,
    description,
    quantity: quantity || 1,
    unit_price: unitPrice,
    amount: (quantity || 1) * unitPrice,
  });

  if (error) {
    return { error: "تعذر إضافة البند: " + error.message };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  return null;
}

export async function addPayment(_prevState: { error: string } | null, formData: FormData) {
  const invoiceId = String(formData.get("invoice_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "cash");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!amount) {
    return { error: "الرجاء إدخال المبلغ" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount,
    method,
    notes: notes || null,
  });

  if (error) {
    return { error: "تعذر تسجيل الدفعة: " + error.message };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  return null;
}

export async function updateDiscount(invoiceId: string, discount: number) {
  const supabase = await createClient();
  await supabase.from("invoices").update({ discount_amount: discount }).eq("id", invoiceId);
  await supabase.rpc("recompute_invoice", { p_invoice_id: invoiceId });
  revalidatePath(`/invoices/${invoiceId}`);
}
