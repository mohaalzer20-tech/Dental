import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(app)/actions";

export default async function SubscriptionExpiredPage() {
  const supabase = await createClient();
  const { data: practice } = await supabase.from("practices").select("subscription_status").single();

  const message =
    practice?.subscription_status === "past_due"
      ? "في تأخير بدفعة الاشتراك."
      : practice?.subscription_status === "canceled"
        ? "تم إلغاء الاشتراك."
        : "انتهت فترتك التجريبية.";

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="font-display text-xl font-bold text-ink">الاشتراك غير فعّال</h1>
      <p className="text-sm text-ink-muted">{message}</p>
      <p className="text-sm text-ink-muted">
        للتفعيل أو التجديد، تواصل مع الشركة المزوّدة للنظام. بعد التفعيل رح تقدر توصل لكل بيانات عيادتك متل ما هي.
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="mt-2 rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-alt"
        >
          تسجيل خروج
        </button>
      </form>
    </div>
  );
}
