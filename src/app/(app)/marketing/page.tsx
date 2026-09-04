import { createClient } from "@/lib/supabase/server";
import TemplateForm from "./TemplateForm";
import MessageForm from "./MessageForm";

const statusLabels: Record<string, string> = {
  queued: "بقائمة الانتظار",
  sent: "أُرسلت",
  failed: "فشلت",
};

const channelLabels: Record<string, string> = {
  sms: "SMS",
  whatsapp: "واتساب",
  email: "بريد إلكتروني",
};

export default async function MarketingPage() {
  const supabase = await createClient();

  const [{ data: templates }, { data: messages }, { data: patients }] = await Promise.all([
    supabase.from("communication_templates").select("id, name, channel, body").order("name"),
    supabase
      .from("message_log")
      .select("id, channel, body, status, created_at, patients(name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("patients").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">التسويق والتواصل</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">التسويق</h1>
      </div>

      <MessageForm patients={patients ?? []} />
      <TemplateForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">القوالب</h2>
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">القناة</th>
              <th className="px-4 py-2.5 font-medium">النص</th>
            </tr>
          </thead>
          <tbody>
            {templates?.length ? (
              templates.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">{t.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{channelLabels[t.channel] ?? t.channel}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{t.body}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink-muted">
                  ما في قوالب بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">سجل الرسائل</h2>
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">القناة</th>
              <th className="px-4 py-2.5 font-medium">النص</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {messages?.length ? (
              messages.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    {(m.patients as unknown as { name: string } | null)?.name ?? "الكل"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{channelLabels[m.channel] ?? m.channel}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{m.body}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{statusLabels[m.status] ?? m.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-muted">
                  ما في رسائل بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
