import { createClient } from "@/lib/supabase/server";
import AppointmentForm from "./AppointmentForm";

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: "مجدول", className: "border-primary text-primary-strong" },
  confirmed: { label: "مؤكد", className: "border-accent text-accent" },
  completed: { label: "منتهي", className: "border-ink-muted text-ink-muted" },
  cancelled: { label: "ملغى", className: "border-danger text-danger" },
  no_show: { label: "لم يحضر", className: "border-danger text-danger" },
};

export default async function AppointmentsPage() {
  const supabase = await createClient();

  const [{ data: appointments }, { data: patients }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, start_time, end_time, status, notes, patients(name)")
      .order("start_time", { ascending: true }),
    supabase.from("patients").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">
          {appointments?.length ?? 0} موعد
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">المواعيد</h1>
      </div>

      <AppointmentForm patients={patients ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">من</th>
              <th className="px-4 py-2.5 font-medium">إلى</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {appointments?.length ? (
              appointments.map((a) => {
                const status = statusConfig[a.status] ?? {
                  label: a.status,
                  className: "border-ink-muted text-ink-muted",
                };
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-ink">
                      {(a.patients as unknown as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {new Date(a.start_time).toLocaleString("ar-SY")}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {new Date(a.end_time).toLocaleString("ar-SY")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  ما في مواعيد بعد — أضف أول موعد من النموذج فوق
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
