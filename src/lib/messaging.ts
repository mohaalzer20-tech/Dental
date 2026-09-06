import { sendSms } from "./sms";

export type MessageChannel = "sms" | "whatsapp";

// SMS (D7 Networks) is the only wired channel today. A real WhatsApp Business API integration
// (Meta Cloud API — needs a verified WhatsApp Business account + WHATSAPP_ACCESS_TOKEN +
// WHATSAPP_PHONE_NUMBER_ID env vars once the user obtains them) would plug in right here as an
// alternative branch — message_log.channel already accepts "whatsapp" with no schema change.
export async function sendReminder(
  phone: string,
  message: string,
): Promise<{ success: boolean; channel: MessageChannel; error?: string }> {
  const sms = await sendSms(phone, message);
  return { success: sms.success, channel: "sms", error: sms.error };
}
