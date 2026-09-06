import { createServiceClient } from "@/lib/supabase/service";
import AcceptInviteForm from "./AcceptInviteForm";

const roleLabels: Record<string, string> = {
  assistant: "مساعد / ممرضة",
  reception: "استقبال / سكرتير",
};

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const service = createServiceClient();

  const { data: member } = await service
    .from("users")
    .select("full_name, role, status, invite_token_expires_at, practices(clinic_name, doctor_name)")
    .eq("invite_token", token)
    .maybeSingle();

  const practice = member?.practices as unknown as { clinic_name: string | null; doctor_name: string } | null;

  const valid =
    member &&
    member.status === "pending" &&
    member.invite_token_expires_at &&
    new Date(member.invite_token_expires_at) > new Date();

  if (!valid) {
    return <p className="text-center text-ink-muted">رابط الدعوة غير صالح أو منتهي الصلاحية</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-display text-lg font-bold text-ink">أهلاً {member.full_name}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          تمت دعوتك كـ{roleLabels[member.role] ?? member.role} بعيادة {practice?.clinic_name || practice?.doctor_name}
        </p>
        <p className="mt-1 text-sm text-ink-muted">حدد كلمة مرور لتفعيل حسابك</p>
      </div>
      <AcceptInviteForm token={token} />
    </div>
  );
}
