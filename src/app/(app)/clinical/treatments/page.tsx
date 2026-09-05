import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import TreatmentForm from "./TreatmentForm";
import { conditionLabels } from "../conditionLabels";
import { deleteTreatment } from "./actions";

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  const supabase = await createClient();

  let treatmentsQuery = supabase
    .from("treatments")
    .select(
      "id, tooth_numbers, diagnosis, cost, performed_at, patients(id, name), procedures(name), users(full_name), appointment_id, treatment_plan_items(treatment_plans(id, title)), chart_entry_id",
    )
    .is("deleted_at", null)
    .order("performed_at", { ascending: false });
  if (patient_id) treatmentsQuery = treatmentsQuery.eq("patient_id", patient_id);

  const [
    { data: treatments },
    { data: patients },
    { data: procedures },
    { data: doctors },
    { data: appointments },
    { data: planItemRows },
    { data: chartEntryRows },
  ] = await Promise.all([
    treatmentsQuery,
    supabase.from("patients").select("id, name").order("name"),
    supabase.from("procedures").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("users").select("id, full_name").order("full_name"),
    supabase
      .from("appointments")
      .select("id, patient_id, start_time")
      .is("deleted_at", null)
      .order("start_time", { ascending: false }),
    supabase
      .from("treatment_plan_items")
      .select("id, procedures(name), treatment_plans(patient_id, title)")
      .in("status", ["pending", "scheduled", "in_progress"]),
    supabase
      .from("dental_chart_entries")
      .select("id, patient_id, tooth_number, condition")
      .is("deleted_at", null)
      .is("resolved_date", null),
  ]);

  const filteredPatientName = patient_id ? (patients ?? []).find((p) => p.id === patient_id)?.name : null;

  const planItems = (planItemRows ?? [])
    .map((row) => {
      const plan = row.treatment_plans as unknown as { patient_id: string; title: string } | null;
      const procedure = row.procedures as unknown as { name: string } | null;
      if (!plan) return null;
      return { id: row.id, patient_id: plan.patient_id, plan_title: plan.title, procedure_name: procedure?.name ?? null };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const chartEntries = (chartEntryRows ?? []).map((row) => ({
    id: row.id,
    patient_id: row.patient_id,
    tooth_number: row.tooth_number,
    condition_label: conditionLabels[row.condition] ?? row.condition,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{treatments?.length ?? 0} معالجة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">سجل المعالجات</h1>
        {filteredPatientName && (
          <p className="mt-1 text-sm text-ink-muted">
            مفلترة لـ {filteredPatientName} —{" "}
            <Link href="/clinical/treatments" className="underline underline-offset-2">
              إزالة الفلتر
            </Link>
          </p>
        )}
      </div>

      <TreatmentForm
        patients={patients ?? []}
        procedures={procedures ?? []}
        doctors={doctors ?? []}
        appointments={appointments ?? []}
        planItems={planItems}
        chartEntries={chartEntries}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">الإجراء</th>
              <th className="px-4 py-2.5 font-medium">الطبيب</th>
              <th className="px-4 py-2.5 font-medium">الأسنان</th>
              <th className="px-4 py-2.5 font-medium">التكلفة</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
              <th className="px-4 py-2.5 font-medium">الروابط</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {treatments?.length ? (
              treatments.map((t) => {
                const patient = t.patients as unknown as { id?: string; name: string } | null;
                const plan = t.treatment_plan_items as unknown as {
                  treatment_plans: { id: string; title: string } | null;
                } | null;
                return (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-ink">
                      {patient?.id ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      {(t.procedures as unknown as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      {(t.users as unknown as { full_name: string } | null)?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{t.tooth_numbers ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{t.cost}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {new Date(t.performed_at).toLocaleDateString("ar-SY")}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-muted">
                      <div className="flex flex-wrap gap-1">
                        {t.appointment_id && (
                          <span className="rounded-full border border-border px-2 py-0.5">من موعد</span>
                        )}
                        {plan?.treatment_plans && (
                          <Link
                            href={`/clinical/treatment-plans/${plan.treatment_plans.id}`}
                            className="rounded-full border border-border px-2 py-0.5 underline underline-offset-2"
                          >
                            {plan.treatment_plans.title}
                          </Link>
                        )}
                        {t.chart_entry_id && (
                          <span className="rounded-full border border-border px-2 py-0.5">حل حالة سن</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <DeleteButton action={deleteTreatment.bind(null, t.id)} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink-muted">
                  ما في معالجات مسجّلة بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
