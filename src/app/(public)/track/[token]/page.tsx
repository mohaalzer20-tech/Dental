import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  pending: "بانتظار تأكيد العيادة",
  scheduled: "مجدول",
  confirmed: "مؤكد",
  completed: "منتهي",
  cancelled: "ملغى",
  no_show: "لم يحضر",
};

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("track_appointment", { p_token: token });
  const result = data?.[0] as
    | { doctor_name: string; patient_name: string; start_time: string; status: string }
    | undefined;

  if (!result) {
    return <p className="text-center text-ink-muted">رابط غير صالح</p>;
  }

  return (
    <div className="flex flex-col gap-3 text-center">
      <h1 className="font-display text-xl font-bold text-ink">حالة موعدك</h1>
      <p className="text-sm text-ink-muted">
        {result.patient_name} — {result.doctor_name}
      </p>
      <p className="font-mono text-ink">
        {new Date(result.start_time).toLocaleString("ar-SY-u-nu-latn")}
      </p>
      <span className="mx-auto rounded-full border border-primary px-4 py-1 text-sm font-medium text-primary-strong">
        {statusLabels[result.status] ?? result.status}
      </span>
    </div>
  );
}
