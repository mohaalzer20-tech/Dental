import { sendSms } from "./sms";
import { getWhatsappStatus, sendWhatsapp } from "./whatsapp";

export async function sendReminder(
  practiceId: string,
  phone: string,
  message: string,
): Promise<{ success: boolean; channel: "whatsapp" | "sms"; error?: string }> {
  const whatsapp = await getWhatsappStatus(practiceId);
  if (whatsapp.status === "connected") {
    const result = await sendWhatsapp(practiceId, phone, message);
    if (result.success) return { success: true, channel: "whatsapp" };
    // فشل الواتساب (رقم انفصل، حظر، إلخ) — ارجع لـ SMS بدل ما تتوقف المتابعة كلياً
  }

  const sms = await sendSms(phone, message);
  return { success: sms.success, channel: "sms", error: sms.error };
}
