"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function register(_prevState: { error: string } | null, formData: FormData) {
  const doctorName = String(formData.get("doctor_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!doctorName || !email || !password) {
    return { error: "الرجاء تعبئة كل الحقول" };
  }
  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: "تعذر إنشاء الحساب: " + signUpError.message };
  }

  if (!signUpData.session) {
    return {
      error:
        "تم إنشاء الحساب، لكن يلزم تأكيد البريد الإلكتروني قبل تسجيل الدخول. تحقق من صندوق الوارد.",
    };
  }

  const { error: rpcError } = await supabase.rpc("register_practice", {
    p_doctor_name: doctorName,
    p_email: email,
  });

  if (rpcError) {
    return { error: "تعذر إنشاء العيادة: " + rpcError.message };
  }

  redirect("/");
}
