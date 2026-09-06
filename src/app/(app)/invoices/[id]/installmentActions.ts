"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addInstallment(_prevState: { error: string } | null, formData: FormData) {
  const invoiceId = String(formData.get("invoice_id") ?? "");
  const dueDate = String(formData.get("due_date") ?? "");
  const amount = Number(formData.get("amount") ?? 0);

  if (!invoiceId || !dueDate || amount <= 0) {
    return { error: "الرجاء إدخال تاريخ الاستحقاق والمبلغ" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("invoice_installments").insert({
    invoice_id: invoiceId,
    due_date: dueDate,
    amount,
  });

  if (error) {
    return { error: "تعذر إضافة القسط: " + error.message };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  return null;
}

export async function toggleInstallmentPaid(id: string, invoiceId: string, paid: boolean) {
  const supabase = await createClient();
  await supabase.from("invoice_installments").update({ paid }).eq("id", id);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteInstallment(id: string, invoiceId: string) {
  const supabase = await createClient();
  await supabase.from("invoice_installments").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/invoices/${invoiceId}`);
}
