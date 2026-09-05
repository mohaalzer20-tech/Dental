"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addAccount(_prevState: { error: string } | null, formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();

  if (!code || !name || !type) {
    return { error: "الرجاء تعبئة كل الحقول" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("chart_of_accounts").insert({ code, name, type });

  if (error) {
    return { error: "تعذر إضافة الحساب: " + error.message };
  }

  revalidatePath("/accounting/chart-of-accounts");
  return null;
}
