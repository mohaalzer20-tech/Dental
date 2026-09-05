import { createClient } from "@/lib/supabase/server";
import ClinicLetterhead from "@/components/ClinicLetterhead";
import PrintButton from "@/components/PrintButton";

export default async function PrescriptionPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: practice }, { data: prescription }, { data: items }] = await Promise.all([
    supabase.from("practices").select("clinic_name, doctor_name, address, phone").single(),
    supabase
      .from("prescriptions")
      .select("id, diagnosis, created_at, patients(name, phone, dob)")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase.from("prescription_items").select("medication_name, dosage, frequency, duration").eq("prescription_id", id),
  ]);

  if (!prescription) {
    return <p className="text-ink-muted">الوصفة غير موجودة</p>;
  }

  const patient = prescription.patients as unknown as { name: string; phone: string | null; dob: string | null } | null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 print:max-w-none">
      <ClinicLetterhead practice={practice} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">وصفة طبية</h1>
          <p className="text-sm text-ink-muted">
            التاريخ: {new Date(prescription.created_at).toLocaleDateString("ar-SY")}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-border p-4 text-sm">
        <p className="text-ink">المريض: {patient?.name ?? "—"}</p>
        {patient?.phone && <p className="text-ink-muted">الهاتف: {patient.phone}</p>}
        {patient?.dob && <p className="text-ink-muted">تاريخ الميلاد: {patient.dob}</p>}
        {prescription.diagnosis && <p className="mt-1 text-ink-muted">التشخيص: {prescription.diagnosis}</p>}
      </div>

      <table className="w-full text-right text-sm">
        <thead className="text-ink-muted">
          <tr>
            <th className="border-b border-border pb-2 font-medium">الدواء</th>
            <th className="border-b border-border pb-2 font-medium">الجرعة</th>
            <th className="border-b border-border pb-2 font-medium">عدد المرات</th>
            <th className="border-b border-border pb-2 font-medium">المدة</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((it, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-2 text-ink">{it.medication_name}</td>
              <td className="py-2 text-ink-muted">{it.dosage ?? "—"}</td>
              <td className="py-2 text-ink-muted">{it.frequency ?? "—"}</td>
              <td className="py-2 text-ink-muted">{it.duration ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
