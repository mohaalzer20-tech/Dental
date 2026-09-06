"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const INVITE_TTL_HOURS = 48;

export async function inviteStaff(
  _prevState: { error: string; inviteUrl?: string } | null,
  formData: FormData,
) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");

  if (!fullName || !email || !["assistant", "reception", "accountant"].includes(role)) {
    return { error: "الرجاء تعبئة الاسم والإيميل واختيار الدور" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: me } = await supabase.from("users").select("role, practice_id").eq("id", user.id).single();
  if (!me || me.role !== "doctor") {
    return { error: "دعوة الموظفين متاحة للطبيب فقط" };
  }

  const service = createServiceClient();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  // موظف سبق دُعي بنفس الإيميل ولسع ما فعّل حسابه — نولّد له رابط جديد بدل خطأ "إيميل مكرر"
  const { data: existing } = await service
    .from("users")
    .select("id, status, practice_id")
    .eq("email", email)
    .maybeSingle();

  let userId: string;

  if (existing) {
    if (existing.practice_id !== me.practice_id || existing.status !== "pending") {
      return { error: "هذا الإيميل مستخدم مسبقاً" };
    }
    userId = existing.id;
    await service
      .from("users")
      .update({ full_name: fullName, role, invite_token: token, invite_token_expires_at: expiresAt })
      .eq("id", userId);
  } else {
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email,
      password: randomUUID(),
      email_confirm: true,
    });
    if (createError || !created.user) {
      return { error: "تعذر إنشاء حساب الموظف: " + (createError?.message ?? "") };
    }
    userId = created.user.id;

    const { error: insertError } = await service.from("users").insert({
      id: userId,
      practice_id: me.practice_id,
      role,
      full_name: fullName,
      email,
      status: "pending",
      invite_token: token,
      invite_token_expires_at: expiresAt,
    });
    if (insertError) {
      return { error: "تعذر تسجيل الموظف: " + insertError.message };
    }
  }

  revalidatePath("/staff");
  return { error: "", inviteUrl: `/staff/accept-invite/${token}` };
}

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

export async function updateFixedSalary(_prevState: { error: string } | null, formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const raw = String(formData.get("fixed_salary") ?? "").trim();
  const salary = raw ? Number(raw) : null;

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ fixed_salary: salary }).eq("id", userId);

  if (error) {
    return { error: "تعذر التحديث: " + error.message };
  }

  revalidatePath("/staff");
  return null;
}

export async function clockIn(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("staff_attendance")
    .select("id")
    .eq("user_id", userId)
    .eq("work_date", today)
    .is("deleted_at", null)
    .maybeSingle();
  if (existing) return;
  await supabase.from("staff_attendance").insert({ user_id: userId, work_date: today, check_in: new Date().toISOString() });
  revalidatePath("/staff/attendance");
}

export async function clockOut(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("staff_attendance")
    .update({ check_out: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("work_date", today)
    .is("check_out", null);
  revalidatePath("/staff/attendance");
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
