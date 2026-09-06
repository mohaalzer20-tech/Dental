"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addSupplier(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const contactPerson = String(formData.get("contact_person") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const paymentTerms = String(formData.get("payment_terms") ?? "").trim();

  if (!name) {
    return { error: "اسم المورد مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    name,
    phone: phone || null,
    contact_person: contactPerson || null,
    email: email || null,
    address: address || null,
    payment_terms: paymentTerms || null,
  });

  if (error) {
    return { error: "تعذر إضافة المورد: " + error.message };
  }

  revalidatePath("/inventory/suppliers");
  return null;
}

export async function updateSupplier(_prevState: { error: string } | null, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const contactPerson = String(formData.get("contact_person") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const paymentTerms = String(formData.get("payment_terms") ?? "").trim();

  if (!name) {
    return { error: "اسم المورد مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      name,
      phone: phone || null,
      contact_person: contactPerson || null,
      email: email || null,
      address: address || null,
      payment_terms: paymentTerms || null,
    })
    .eq("id", id);

  if (error) {
    return { error: "تعذر تحديث المورد: " + error.message };
  }

  revalidatePath(`/inventory/suppliers/${id}`);
  revalidatePath("/inventory/suppliers");
  return null;
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  await supabase.from("suppliers").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/inventory/suppliers");
  redirect("/inventory/suppliers");
}
