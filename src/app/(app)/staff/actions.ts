"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCommissionRate(_prevState: { error: string } | null, formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const rate = Number(formData.get("commission_rate") ?? 0);

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ commission_rate: rate }).eq("id", userId);

  if (error) {
    return { error: "تعذر التحديث: " + error.message };
  }

  revalidatePath("/staff");
  return null;
}

export async function updateStaffStatus(userId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("users").update({ status }).eq("id", userId);
  revalidatePath("/staff");
  revalidatePath(`/staff/${userId}`);
}

export async function deleteShift(id: string) {
  const supabase = await createClient();
  await supabase.from("staff_shifts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/staff");
}

export async function addShift(_prevState: { error: string } | null, formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const dayOfWeek = Number(formData.get("day_of_week") ?? 0);
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");

  if (!userId || !startTime || !endTime) {
    return { error: "الرجاء تعبئة كل الحقول" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("staff_shifts").insert({
    user_id: userId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });

  if (error) {
    return { error: "تعذر إضافة الدوام: " + error.message };
  }

  revalidatePath("/staff");
  return null;
}
