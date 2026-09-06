import { createClient } from "@/lib/supabase/server";
import ClinicLetterhead from "@/components/ClinicLetterhead";
import PrintButton from "@/components/PrintButton";
import SignatureBlock from "@/components/SignatureBlock";

export default async function TreatmentPlanConsentPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: practice }, { data: plan }, { data: items }] = await Promise.all([
    supabase.from("practices").select("clinic_name, doctor_name, address, phone, license_number").single(),
    supabase
      .from("treatment_plans")
      .select("id, title, accepted_at, accepted_by_name, patients(name, phone, dob)")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase.from("treatment_plan_items").select("tooth_numbers, procedures(name)").eq("treatment_plan_id", id),
  ]);

  if (!plan) {
    return <p className="text-ink-muted">الخطة غير موجودة</p>;
  }

  const patient = plan.patients as unknown as { name: string; phone: string | null; dob: string | null } | null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 print:max-w-none">
      <ClinicLetterhead practice={practice} licenseNumber={practice?.license_number} />

      <div className="flex items-start justify-between">
        <h1 className="font-display text-lg font-bold text-ink">نموذج موافقة على إجراء علاجي</h1>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-border p-4 text-sm">
        <p className="text-ink">المريض: {patient?.name ?? "—"}</p>
        {patient?.phone && <p className="text-ink-muted">الهاتف: {patient.phone}</p>}
        {patient?.dob && <p className="text-ink-muted">تاريخ الميلاد: {patient.dob}</p>}
        <p className="mt-1 text-ink-muted">خطة العلاج: {plan.title}</p>
      </div>

      {items && items.length > 0 && (
        <table className="w-full text-right text-sm">
          <thead className="text-ink-muted">
            <tr>
              <th className="border-b border-border pb-2 font-medium">الإجراء</th>
              <th className="border-b border-border pb-2 font-medium">الأسنان</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-2 text-ink">{(it.procedures as unknown as { name: string } | null)?.name ?? "—"}</td>
                <td className="py-2 font-mono text-ink-muted">{it.tooth_numbers?.join("، ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="rounded-xl border border-border bg-surface-alt p-4 text-sm leading-relaxed text-ink">
        <p>
          أقر أنا الموقّع أدناه بأنني اطّلعت على تشخيص حالتي وطبيعة الإجراء العلاجي الموصوف أعلاه، وتم إعلامي
          بأهدافه والمخاطر والمضاعفات المحتملة له والبدائل المتاحة، وقد أُتيحت لي الفرصة لطرح الأسئلة والحصول على
          إجابات وافية بشأنها. وبناءً عليه، أوافق طوعاً وبكامل إرادتي على إجراء العلاج المذكور من قبل الطبيب المعالج.
        </p>
        {plan.accepted_at && (
          <p className="mt-3 text-ink-muted">
            الموافقة مسجّلة باسم: <span className="font-medium text-ink">{plan.accepted_by_name}</span> بتاريخ{" "}
            {new Date(plan.accepted_at).toLocaleString("ar-SY-u-nu-latn")}
          </p>
        )}
      </div>

      <SignatureBlock labels={["المريض / ولي الأمر", "الشاهد", "الطبيب المعالج"]} withName />
    </div>
  );
}
