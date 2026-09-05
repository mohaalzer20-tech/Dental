// يحوّل رقم سوري محلي (0999999999) لصيغة دولية (963999999999) — تنسيق D7 المطلوب.
// يتجاهل الأرقام المُدخلة أصلاً بصيغة دولية.
export function normalizeSyrianPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("963")) return digits;
  if (digits.startsWith("0")) return "963" + digits.slice(1);
  return digits;
}

// إرسال SMS عبر D7 Networks (يغطي سيريتل وMTN سوريا).
// التوثيق: https://d7networks.com/docs/Messages/Send_Message/
export async function sendSms(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.SMS_API_TOKEN;
  const sender = process.env.SMS_SENDER_NAME || "Clinic";

  if (!token) {
    return { success: false, error: "SMS_API_TOKEN غير مضبوط بمتغيرات البيئة" };
  }

  try {
    const res = await fetch("https://api.d7networks.com/messages/v1/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            channel: "sms",
            recipients: [normalizeSyrianPhone(phone)],
            content: message,
            msg_type: "text",
            data_coding: "unicode",
          },
        ],
        message_globals: { originator: sender },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `D7 API error (${res.status}): ${body.slice(0, 300)}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير معروف بإرسال SMS" };
  }
}
