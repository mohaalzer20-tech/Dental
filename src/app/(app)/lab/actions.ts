"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addLabVendor(_prevState: { error: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) {
    return { error: "اسم المخبر مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lab_vendors").insert({ name, phone: phone || null });

  if (error) {
    return { error: "تعذر إضافة المخبر: " + error.message };
  }

  revalidatePath("/lab");
  return null;
}

export async function addLabOrder(_prevState: { error: string } | null, formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const labVendorId = String(formData.get("lab_vendor_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim();
  const cost = Number(formData.get("cost") ?? 0);

  if (!patientId) {
    return { error: "الرجاء اختيار المريض" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lab_orders").insert({
    patient_id: patientId,
    lab_vendor_id: labVendorId,
    description: description || null,
    cost: cost || 0,
  });

  if (error) {
    return { error: "تعذر إنشاء أمر المخبر: " + error.message };
  }

  revalidatePath("/lab");
  return null;
}

export async function updateLabOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "received") patch.received_date = new Date().toISOString().slice(0, 10);
  await supabase.from("lab_orders").update(patch).eq("id", orderId);
  revalidatePath("/lab");
}

export async function deleteLabOrder(id: string) {
  const supabase = await createClient();
  await supabase.from("lab_orders").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/lab");
}

export async function updateLabVendor(_prevState: { error: string } | null, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) {
    return { error: "اسم المخبر مطلوب" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lab_vendors").update({ name, phone: phone || null }).eq("id", id);

  if (error) {
    return { error: "تعذر تحديث المخبر: " + error.message };
  }

  revalidatePath("/lab");
  return null;
}

export async function deleteLabVendor(id: string) {
  const supabase = await createClient();
  await supabase.from("lab_vendors").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/lab");
}
