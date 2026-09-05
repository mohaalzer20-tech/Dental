import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: practice }, { count: patientsCount }, { count: appointmentsCount }] =
    await Promise.all([
      supabase.from("practices").select("doctor_name, subscription_status").single(),
      supabase.from("patients").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("appointments").select("*", { count: "exact", head: true }).is("deleted_at", null),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">لوحة التحكم</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          أهلاً {practice?.doctor_name ?? ""}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard href="/patients" label="عدد المرضى" value={patientsCount ?? 0} />
        <StatCard href="/appointments" label="عدد المواعيد" value={appointmentsCount ?? 0} />
      </div>
    </div>
  );
}

function StatCard({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary"
    >
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 font-mono text-3xl font-medium text-primary-strong">{value}</p>
    </Link>
  );
}
