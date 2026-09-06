import { sendSms } from "./sms";

export async function sendReminder(
  phone: string,
  message: string,
): Promise<{ success: boolean; channel: "sms"; error?: string }> {
  const sms = await sendSms(phone, message);
  return { success: sms.success, channel: "sms", error: sms.error };
}
