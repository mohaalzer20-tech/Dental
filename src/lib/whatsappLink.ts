import { normalizeSyrianPhone } from "./sms";

// رابط رسمي 100% (مو API) — يفتح محادثة واتساب حقيقية بنص جاهز، والمستخدم هو يلي يضغط إرسال.
export function buildWhatsappLink(phone: string, text: string): string {
  return `https://wa.me/${normalizeSyrianPhone(phone)}?text=${encodeURIComponent(text)}`;
}
