function bridgeConfigured() {
  return !!(process.env.WHATSAPP_BRIDGE_URL && process.env.WHATSAPP_BRIDGE_SECRET);
}

function bridgeFetch(path: string, init?: RequestInit) {
  const url = `${process.env.WHATSAPP_BRIDGE_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_BRIDGE_SECRET}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export type WhatsappStatus = "not_configured" | "disconnected" | "connecting" | "qr" | "connected";

export async function getWhatsappStatus(practiceId: string): Promise<{ status: WhatsappStatus; qr: string | null }> {
  if (!bridgeConfigured()) return { status: "not_configured", qr: null };
  try {
    const res = await bridgeFetch(`/status/${practiceId}`);
    if (!res.ok) return { status: "disconnected", qr: null };
    return (await res.json()) as { status: WhatsappStatus; qr: string | null };
  } catch {
    return { status: "disconnected", qr: null };
  }
}

export async function connectWhatsapp(practiceId: string): Promise<void> {
  if (!bridgeConfigured()) throw new Error("خدمة الواتساب غير مُعدّة بعد");
  const res = await bridgeFetch(`/connect/${practiceId}`, { method: "POST" });
  if (!res.ok) throw new Error("تعذر بدء جلسة الواتساب");
}

export async function disconnectWhatsapp(practiceId: string): Promise<void> {
  if (!bridgeConfigured()) return;
  await bridgeFetch(`/disconnect/${practiceId}`, { method: "POST" }).catch(() => {});
}

export async function sendWhatsapp(
  practiceId: string,
  phone: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  if (!bridgeConfigured()) return { success: false, error: "خدمة الواتساب غير مُعدّة" };
  try {
    const res = await bridgeFetch("/send", {
      method: "POST",
      body: JSON.stringify({ practiceId, phone, message }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: (body as { error?: string }).error ?? `bridge error ${res.status}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "تعذر الوصول لخدمة الواتساب" };
  }
}
