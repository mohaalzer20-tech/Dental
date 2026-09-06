"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";

export async function acceptStaffInvite(_prevState: { error: string } | null, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "كلمة المرور لازم تكون 8 محارف على الأقل" };
  }

  const service = createServiceClient();

  const { data: member } = await service
    .from("users")
    .select("id, status, invite_token_expires_at")
    .eq("invite_token", token)
    .maybeSingle();

  if (
    !member ||
    member.status !== "pending" ||
    !member.invite_token_expires_at ||
    new Date(member.invite_token_expires_at) < new Date()
  ) {
    return { error: "رابط الدعوة غير صالح أو منتهي الصلاحية" };
  }

  const { error: authError } = await service.auth.admin.updateUserById(member.id, { password });
  if (authError) {
    return { error: "تعذر تعيين كلمة المرور: " + authError.message };
  }

  await service
    .from("users")
    .update({ status: "active", invite_token: null, invite_token_expires_at: null })
    .eq("id", member.id);

  redirect("/login");
}
