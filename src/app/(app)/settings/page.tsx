import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: practice } = await supabase.from("practices").select("id, doctor_name, email").single();

  const bookingPath = practice ? `/book/${practice.id}` : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">الإعدادات</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">إعدادات العيادة</h1>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">رابط الحجز العام</h2>
        <p className="mb-3 text-sm text-ink-muted">
          شارك هذا الرابط مع مرضاك ليتمكنوا من طلب حجز موعد بدون تسجيل دخول.
        </p>
        {bookingPath && (
          <code className="block rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-primary-strong break-all">
            {bookingPath}
          </code>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">بيانات العيادة</h2>
        <p className="text-sm text-ink-muted">الطبيب: {practice?.doctor_name}</p>
        <p className="text-sm text-ink-muted">البريد: {practice?.email}</p>
      </div>
    </div>
  );
}
