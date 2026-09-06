import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusPill from "@/components/StatusPill";
import WaitlistForm from "./WaitlistForm";
import WaitlistRow from "./WaitlistRow";

export default async function WaitlistPage() {
  const supabase = await createClient();

  const [{ data: entries }, { data: patients }] = await Promise.all([
    supabase
      .from("appointment_waitlist")
      .select("id, desired_from, desired_to, notes, notified, patients(id, name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("patients").select("id, name").is("deleted_at", null).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{entries?.length ?? 0} بالانتظار</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">قائمة الانتظار</h1>
        <Link href="/appointments" className="text-sm text-primary-strong underline underline-offset-2">
          الرجوع للمواعيد
        </Link>
      </div>

      <WaitlistForm patients={patients ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">الوقت المرغوب</th>
              <th className="px-4 py-2.5 font-medium">ملاحظات</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
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
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {e.desired_from ? new Date(e.desired_from).toLocaleString("ar-SY-u-nu-latn") : "—"}
                      {e.desired_to ? ` — ${new Date(e.desired_to).toLocaleString("ar-SY-u-nu-latn")}` : ""}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{e.notes ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <StatusPill tone={e.notified ? "primary" : "accent"}>
                        {e.notified ? "تم التبليغ" : "بالانتظار"}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-2.5">
                      <WaitlistRow id={e.id} notified={e.notified} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  قائمة الانتظار فارغة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
