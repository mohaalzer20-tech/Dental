import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import LabOrderForm from "./LabOrderForm";
import VendorForm from "./VendorForm";
import VendorRow from "./VendorRow";
import StatusSelect from "./StatusSelect";
import { deleteLabOrder } from "./actions";

export default async function LabPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  const supabase = await createClient();

  let ordersQuery = supabase
    .from("lab_orders")
    .select("id, description, status, cost, sent_date, patients(id, name), lab_vendors(name), treatments(diagnosis, procedures(name))")
    .is("deleted_at", null)
    .order("sent_date", { ascending: false });
  if (patient_id) ordersQuery = ordersQuery.eq("patient_id", patient_id);

  const [{ data: orders }, { data: patients }, { data: vendors }, { data: treatmentRows }] = await Promise.all([
    ordersQuery,
    supabase.from("patients").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("lab_vendors").select("id, name, phone").is("deleted_at", null).order("name"),
    supabase
      .from("treatments")
      .select("id, patient_id, diagnosis, performed_at, procedures(name)")
      .is("deleted_at", null)
      .order("performed_at", { ascending: false }),
  ]);

  const filteredPatientName = patient_id ? (patients ?? []).find((p) => p.id === patient_id)?.name : null;

  const treatments = (treatmentRows ?? []).map((t) => {
    const procedure = t.procedures as unknown as { name: string } | null;
    return {
      id: t.id,
      patient_id: t.patient_id,
      label: `${procedure?.name ?? t.diagnosis ?? "معالجة"} — ${new Date(t.performed_at).toLocaleDateString("ar-SY")}`,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{orders?.length ?? 0} أمر</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">المختبر</h1>
        {filteredPatientName && (
          <p className="mt-1 text-sm text-ink-muted">
            مفلترة لـ {filteredPatientName} —{" "}
            <Link href="/lab" className="underline underline-offset-2">
              إزالة الفلتر
            </Link>
          </p>
        )}
      </div>

      <LabOrderForm patients={patients ?? []} vendors={vendors ?? []} treatments={treatments} />
      <VendorForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">المخبر</th>
              <th className="px-4 py-2.5 font-medium">الوصف</th>
              <th className="px-4 py-2.5 font-medium">التكلفة</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders?.length ? (
              orders.map((o) => {
                const patient = o.patients as unknown as { id?: string; name: string } | null;
                return (
                  <tr key={o.id} className="border-t border-border">
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
                      {(o.lab_vendors as unknown as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      {o.description ?? "—"}
                      {(() => {
                        const treatment = o.treatments as unknown as { procedures: { name: string } | null } | null;
                        return treatment?.procedures ? (
                          <span className="mr-2 rounded-full border border-border px-2 py-0.5 text-xs text-ink-muted">
                            {treatment.procedures.name}
                          </span>
                        ) : null;
                      })()}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">{o.cost}</td>
                    <td className="px-4 py-2.5">
                      <StatusSelect orderId={o.id} status={o.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <DeleteButton action={deleteLabOrder.bind(null, o.id)} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  ما في أوامر مخبر بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">المخابر</h2>
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">الهاتف</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {vendors?.length ? (
              vendors.map((v) => <VendorRow key={v.id} vendor={v} />)
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink-muted">
                  ما في مخابر بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
