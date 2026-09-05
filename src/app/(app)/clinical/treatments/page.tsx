import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import TreatmentForm from "./TreatmentForm";
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
    .select("id, tooth_numbers, diagnosis, cost, performed_at, patients(id, name), procedures(name), users(full_name)")
    .is("deleted_at", null)
    .order("performed_at", { ascending: false });
  if (patient_id) treatmentsQuery = treatmentsQuery.eq("patient_id", patient_id);

  const [{ data: treatments }, { data: patients }, { data: procedures }, { data: doctors }] = await Promise.all([
    treatmentsQuery,
    supabase.from("patients").select("id, name").order("name"),
    supabase.from("procedures").select("id, name").order("name"),
    supabase.from("users").select("id, full_name").order("full_name"),
  ]);

  const filteredPatientName = patient_id ? (patients ?? []).find((p) => p.id === patient_id)?.name : null;

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

      <TreatmentForm patients={patients ?? []} procedures={procedures ?? []} doctors={doctors ?? []} />

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
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {treatments?.length ? (
              treatments.map((t) => {
                const patient = t.patients as unknown as { id?: string; name: string } | null;
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
                    <td className="px-4 py-2.5">
                      <DeleteButton action={deleteTreatment.bind(null, t.id)} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
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
