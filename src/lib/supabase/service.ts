import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// عميل بصلاحية service_role — يتجاوز RLS بالكامل. يُستخدم فقط بسياقات موثوقة
// بدون جلسة مستخدم (مهام مجدولة/cron)، وكل استعلام فيه لازم يفلتر يدوياً حسب practice_id.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY غير مضبوط بمتغيرات البيئة");
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
