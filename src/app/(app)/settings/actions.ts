"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
