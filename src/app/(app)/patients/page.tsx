import { createClient } from "@/lib/supabase/server";
import PatientForm from "./PatientForm";

export default async function PatientsPage() {
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, phone, dob, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">
          {patients?.length ?? 0} سجل
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">المرضى</h1>
      </div>

      <PatientForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">الهاتف</th>
              <th className="px-4 py-2.5 font-medium">تاريخ الميلاد</th>
            </tr>
          </thead>
          <tbody>
            {patients?.length ? (
              patients.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">{p.name}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{p.phone ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{p.dob ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                  ما في مرضى بعد — أضف أول مريض من النموذج فوق
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
