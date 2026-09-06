import { createClient } from "@/lib/supabase/server";
import BookingForm from "./BookingForm";

export default async function BookPage({
  params,
}: {
  params: Promise<{ practiceId: string }>;
}) {
  const { practiceId } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_practice_public_info", { p_practice_id: practiceId });
  const doctorName = data?.[0]?.doctor_name as string | undefined;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-xl font-bold text-ink">
        {doctorName ? `احجز موعدك مع ${doctorName}` : "احجز موعدك"}
      </h1>
      <p className="mb-2 text-sm text-ink-muted">
        عبّي بياناتك وسيتم التواصل معك لتأكيد الموعد.
      </p>
      <BookingForm practiceId={practiceId} />
    </div>
  );
}
