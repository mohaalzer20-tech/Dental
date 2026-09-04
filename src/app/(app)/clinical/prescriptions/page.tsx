import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PrescriptionForm from "./PrescriptionForm";

export default async function PrescriptionsPage() {
  const supabase = await createClient();

  const [{ data: prescriptions }, { data: patients }] = await Promise.all([
    supabase
      .from("prescriptions")
      .select("id, diagnosis, created_at, patients(name)")
      .order("created_at", { ascending: false }),
    supabase.from("patients").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{prescriptions?.length ?? 0} وصفة</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">الوصفات</h1>
      </div>

      <PrescriptionForm patients={patients ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">التشخيص</th>
              <th className="px-4 py-2.5 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions?.length ? (
              prescriptions.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    <Link href={`/clinical/prescriptions/${p.id}`} className="underline underline-offset-2">
                      {(p.patients as unknown as { name: string } | null)?.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{p.diagnosis ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">
                    {new Date(p.created_at).toLocaleDateString("ar-SY")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                  ما في وصفات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
