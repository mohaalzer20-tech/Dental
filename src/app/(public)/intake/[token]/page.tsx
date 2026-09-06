import { createClient } from "@/lib/supabase/server";
import IntakeForm from "./IntakeForm";

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: patientName } = await supabase.rpc("get_intake_patient_name", { p_token: token });

  if (!patientName) {
    return <p className="text-center text-ink-muted">رابط غير صالح أو تم استخدامه مسبقاً</p>;
  }

  return <IntakeForm token={token} patientName={patientName} />;
}
