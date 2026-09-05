"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateClinicInfo(_prevState: { error: string } | null, formData: FormData) {
  const clinicName = String(formData.get("clinic_name") ?? "").trim();
  const doctorName = String(formData.get("doctor_name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const taxNumber = String(formData.get("tax_number") ?? "").trim();
  const licenseNumber = String(formData.get("license_number") ?? "").trim();

  if (!doctorName) {
    return { error: "الرجاء كتابة اسم الطبيب" };
  }

  const supabase = await createClient();
  const { data: practice } = await supabase.from("practices").select("id").single();

  if (!practice) {
    return { error: "تعذر العثور على العيادة" };
  }

  const { error } = await supabase
    .from("practices")
    .update({
      clinic_name: clinicName || null,
      doctor_name: doctorName,
      address: address || null,
      phone: phone || null,
      tax_number: taxNumber || null,
      license_number: licenseNumber || null,
    })
    .eq("id", practice.id);

  if (error) {
    return { error: "تعذر حفظ البيانات: " + error.message };
  }

  revalidatePath("/settings");
  return null;
}

export async function updateAccountingSettings(_prevState: { error: string } | null, formData: FormData) {
  const currency = String(formData.get("currency") ?? "").trim();
  const cashAccountId = String(formData.get("default_cash_account_id") ?? "").trim();
  const bankAccountId = String(formData.get("default_bank_account_id") ?? "").trim();
  const revenueAccountId = String(formData.get("default_revenue_account_id") ?? "").trim();

  const supabase = await createClient();
  const { data: practice } = await supabase.from("practices").select("id").single();

  if (!practice) {
    return { error: "تعذر العثور على العيادة" };
  }

  const { error } = await supabase
    .from("practices")
    .update({
      currency: currency || "SYP",
      default_cash_account_id: cashAccountId || null,
      default_bank_account_id: bankAccountId || null,
      default_revenue_account_id: revenueAccountId || null,
    })
    .eq("id", practice.id);

  if (error) {
    return { error: "تعذر حفظ الإعدادات: " + error.message };
  }

  revalidatePath("/settings");
  return null;
}
