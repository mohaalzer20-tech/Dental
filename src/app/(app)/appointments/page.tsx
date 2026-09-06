import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import AppointmentForm from "./AppointmentForm";
import AppointmentStatusSelect from "./AppointmentStatusSelect";
import RecallDateInput from "./RecallDateInput";
import { deleteAppointment } from "./actions";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string; view?: string }>;
}) {
  const { patient_id, view = "active" } = await searchParams;
  const supabase = await createClient();

  let appointmentsQuery = supabase
    .from("appointments")
    .select("id, start_time, end_time, status, notes, recall_date, patients(id, name)")
    .is("deleted_at", null)
    .order("start_time", { ascending: true });
  if (patient_id) appointmentsQuery = appointmentsQuery.eq("patient_id", patient_id);
  if (view === "cancelled") appointmentsQuery = appointmentsQuery.eq("status", "cancelled");
  else if (view !== "all") appointmentsQuery = appointmentsQuery.neq("status", "cancelled");

  const [{ data: appointments }, { data: patients }] = await Promise.all([
    appointmentsQuery,
    supabase.from("patients").select("id, name").is("deleted_at", null).order("name"),
  ]);

  const filteredPatientName = patient_id
    ? (patients ?? []).find((p) => p.id === patient_id)?.name
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">
          {appointments?.length ?? 0} موعد
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">المواعيد</h1>
        {filteredPatientName && (
          <p className="mt-1 text-sm text-ink-muted">
            مفلترة لـ {filteredPatientName} — <Link href="/appointments" className="underline underline-offset-2">إزالة الفلتر</Link>
          </p>
        )}
        <div className="mt-3 flex gap-2 text-sm">
          {[
            { key: "active", label: "المواعيد" },
            { key: "cancelled", label: "الملغاة" },
            { key: "all", label: "الكل" },
          ].map((tab) => {
            const params = new URLSearchParams();
            if (patient_id) params.set("patient_id", patient_id);
            if (tab.key !== "active") params.set("view", tab.key);
            const qs = params.toString();
            const active = view === tab.key;
            return (
              <Link
                key={tab.key}
                href={qs ? `/appointments?${qs}` : "/appointments"}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  active ? "bg-primary text-on-primary" : "border border-border text-ink-muted hover:bg-surface-alt"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
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
              <th className="px-4 py-2.5 font-medium">تاريخ المتابعة</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {appointments?.length ? (
              appointments.map((a) => {
                const patient = a.patients as unknown as { id?: string; name: string } | null;
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-ink">
                      {patient?.id ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {new Date(a.start_time).toLocaleString("ar-SY-u-nu-latn")}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {new Date(a.end_time).toLocaleString("ar-SY-u-nu-latn")}
                    </td>
                    <td className="px-4 py-2.5">
                      <AppointmentStatusSelect id={a.id} status={a.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <RecallDateInput id={a.id} recallDate={a.recall_date} />
                    </td>
                    <td className="px-4 py-2.5">
                      {a.status === "cancelled" && (
                        <DeleteButton
                          action={deleteAppointment.bind(null, a.id)}
                          label="حذف نهائي"
                          confirmMessage="هذا حذف نهائي ويخفي الموعد من ملف المريض بالكامل. للإلغاء العادي فقط، استخدم قائمة الحالة. متابعة؟"
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  {view === "cancelled" ? "ما في مواعيد ملغاة" : "ما في مواعيد بعد — أضف أول موعد من النموذج فوق"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
