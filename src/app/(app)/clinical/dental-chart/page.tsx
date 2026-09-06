import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import AllergyBanner from "@/components/AllergyBanner";
import StatusPill from "@/components/StatusPill";
import ChartForm from "./ChartForm";
import ChartPanel from "./ChartPanel";
import type { ToothStatus } from "./OdontogramChart";
import { deleteChartEntry, resolveChartEntry } from "./actions";
import ResolveButton from "./ResolveButton";
import { conditionLabels } from "../conditionLabels";

export default async function DentalChartPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  const supabase = await createClient();

  let entriesQuery = supabase
    .from("dental_chart_entries")
    .select("id, tooth_number, condition, notes, diagnosed_date, resolved_date, patients(id, name)")
    .is("deleted_at", null)
    .order("diagnosed_date", { ascending: false });
  if (patient_id) entriesQuery = entriesQuery.eq("patient_id", patient_id);

  const [{ data: entries }, { data: patients }, patientDetail] = await Promise.all([
    entriesQuery,
    supabase.from("patients").select("id, name").is("deleted_at", null).order("name"),
    patient_id
      ? supabase.from("patients").select("allergies").eq("id", patient_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const filteredPatientName = patient_id ? (patients ?? []).find((p) => p.id === patient_id)?.name : null;

  const toothStatuses: Record<number, ToothStatus> = {};
  if (patient_id) {
    const [{ data: planItems }, { data: treatments }] = await Promise.all([
      supabase
        .from("treatment_plan_items")
        .select("tooth_numbers, status, treatment_plans!inner(patient_id)")
        .eq("treatment_plans.patient_id", patient_id),
      supabase.from("treatments").select("tooth_numbers").eq("patient_id", patient_id).is("deleted_at", null),
    ]);

    for (const e of entries ?? []) {
      if (toothStatuses[e.tooth_number] !== "completed") {
        toothStatuses[e.tooth_number] = e.resolved_date ? "completed" : "proposed";
      }
    }
    for (const item of planItems ?? []) {
      const tone: ToothStatus = item.status === "completed" ? "completed" : "proposed";
      for (const raw of item.tooth_numbers ?? []) {
        const n = Number(raw);
        if (!n || toothStatuses[n] === "completed") continue;
        toothStatuses[n] = tone;
      }
    }
    for (const t of treatments ?? []) {
      for (const raw of (t.tooth_numbers ?? "").split(",")) {
        const n = Number(raw.trim());
        if (n) toothStatuses[n] = "completed";
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{entries?.length ?? 0} سجل</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">رسم الأسنان (Odontogram)</h1>
        {filteredPatientName && (
          <p className="mt-1 text-sm text-ink-muted">
            مفلترة لـ {filteredPatientName} —{" "}
            <Link href="/clinical/dental-chart" className="underline underline-offset-2">
              إزالة الفلتر
            </Link>
          </p>
        )}
      </div>

      {patientDetail?.data && <AllergyBanner allergies={patientDetail.data.allergies} />}

      {patient_id ? (
        <ChartPanel patients={patients ?? []} patientId={patient_id} statuses={toothStatuses} />
      ) : (
        <>
          <p className="text-sm text-ink-muted">
            اختر مريضاً من صفحة ملفه لعرض رسم الأسنان التفاعلي، أو سجّل حالة مباشرة أدناه.
          </p>
          <ChartForm patients={patients ?? []} />
        </>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">السن</th>
              <th className="px-4 py-2.5 font-medium">حالة السن</th>
              <th className="px-4 py-2.5 font-medium">ملاحظات</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
              <th className="px-4 py-2.5 font-medium">حالة العلاج</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entries?.length ? (
              entries.map((e) => {
                const patient = e.patients as unknown as { id?: string; name: string } | null;
                const resolved = !!e.resolved_date;
                return (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-ink">
                      {patient?.id ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink">{e.tooth_number}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{conditionLabels[e.condition] ?? e.condition}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{e.notes ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{e.diagnosed_date}</td>
                    <td className="px-4 py-2.5">
                      <StatusPill tone={resolved ? "primary" : "accent"}>
                        {resolved ? `تم العلاج (${e.resolved_date})` : "نشط"}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-2">
                        {!resolved && <ResolveButton action={resolveChartEntry.bind(null, e.id)} />}
                        <DeleteButton action={deleteChartEntry.bind(null, e.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                  ما في سجلات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
