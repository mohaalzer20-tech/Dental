import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import StatusPill from "@/components/StatusPill";
import PerioForm from "./PerioForm";
import { deletePerioEntry } from "./actions";

export default async function PerioPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  const supabase = await createClient();

  let entriesQuery = supabase
    .from("perio_charts")
    .select("id, tooth_number, pocket_depth, bleeding, recorded_date, notes, patients(id, name)")
    .is("deleted_at", null)
    .order("recorded_date", { ascending: false });
  if (patient_id) entriesQuery = entriesQuery.eq("patient_id", patient_id);

  const [{ data: entries }, { data: patients }] = await Promise.all([
    entriesQuery,
    supabase.from("patients").select("id, name").is("deleted_at", null).order("name"),
  ]);

  const filteredPatientName = patient_id ? (patients ?? []).find((p) => p.id === patient_id)?.name : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{entries?.length ?? 0} قياس</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">الفحص اللثوي</h1>
        {filteredPatientName && (
          <p className="mt-1 text-sm text-ink-muted">
            مفلترة لـ {filteredPatientName} —{" "}
            <Link href="/clinical/perio" className="underline underline-offset-2">
              إزالة الفلتر
            </Link>
          </p>
        )}
      </div>

      <PerioForm patients={patients ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">السن</th>
              <th className="px-4 py-2.5 font-medium">عمق الجيب</th>
              <th className="px-4 py-2.5 font-medium">نزيف</th>
              <th className="px-4 py-2.5 font-medium">ملاحظات</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entries?.length ? (
              entries.map((e) => {
                const patient = e.patients as unknown as { id?: string; name: string } | null;
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
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {e.pocket_depth != null ? `${e.pocket_depth} مم` : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {e.bleeding ? <StatusPill tone="danger">نزيف</StatusPill> : <StatusPill tone="muted">لا</StatusPill>}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{e.notes ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{e.recorded_date}</td>
                    <td className="px-4 py-2.5">
                      <DeleteButton action={deletePerioEntry.bind(null, e.id)} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                  ما في قياسات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
