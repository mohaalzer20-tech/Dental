import { createClient } from "@/lib/supabase/server";
import PatientForm from "./PatientForm";
import PatientsTable from "./PatientsTable";

export default async function PatientsPage() {
  const supabase = await createClient();

  const [{ data: patients }, { data: templates }, { data: practice }] = await Promise.all([
    supabase
      .from("patients")
      .select("id, name, phone, dob, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("communication_templates").select("id, name, body").is("deleted_at", null).order("name"),
    supabase.from("practices").select("clinic_name, google_maps_url").single(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">
          {patients?.length ?? 0} سجل
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">المرضى</h1>
      </div>

      <PatientForm />

      <PatientsTable
        patients={patients ?? []}
        templates={templates ?? []}
        clinicName={practice?.clinic_name ?? "العيادة"}
        mapsUrl={practice?.google_maps_url ?? null}
      />
    </div>
  );
}
