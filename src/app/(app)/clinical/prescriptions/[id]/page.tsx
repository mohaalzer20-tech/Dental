import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PrescriptionItemForm from "./PrescriptionItemForm";

export default async function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: prescription }, { data: items }] = await Promise.all([
    supabase
      .from("prescriptions")
      .select("id, diagnosis, notes, patients(id, name)")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase.from("prescription_items").select("id, medication_name, dosage, frequency, duration").eq("prescription_id", id),
  ]);

  if (!prescription) {
    return <p className="text-ink-muted">الوصفة غير موجودة</p>;
  }

  const patient = prescription.patients as unknown as { id: string; name: string } | null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-muted">
            {patient ? (
              <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                {patient.name}
              </Link>
            ) : (
              "—"
            )}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">وصفة طبية</h1>
          {prescription.diagnosis && <p className="text-sm text-ink-muted">التشخيص: {prescription.diagnosis}</p>}
        </div>
        <Link
          href={`/clinical/prescriptions/${id}/print`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt"
        >
          طباعة الوصفة
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">الأدوية</h2>
        <table className="w-full text-right text-sm">
          <thead className="text-ink-muted">
            <tr>
              <th className="pb-2 font-medium">الدواء</th>
              <th className="pb-2 font-medium">الجرعة</th>
              <th className="pb-2 font-medium">عدد المرات</th>
              <th className="pb-2 font-medium">المدة</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="py-2 text-ink">{it.medication_name}</td>
                <td className="py-2 text-ink-muted">{it.dosage ?? "—"}</td>
                <td className="py-2 text-ink-muted">{it.frequency ?? "—"}</td>
                <td className="py-2 text-ink-muted">{it.duration ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 border-t border-border pt-4">
          <PrescriptionItemForm prescriptionId={id} />
        </div>
      </div>
    </div>
  );
}
