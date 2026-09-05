"use client";

import { useEffect, useRef, useState } from "react";
import { connectWhatsappAction, disconnectWhatsappAction, getWhatsappStatusAction } from "./actions";
import type { WhatsappStatus } from "@/lib/whatsapp";

const statusLabels: Record<WhatsappStatus, string> = {
  not_configured: "خدمة الواتساب غير مُعدّة بعد",
  disconnected: "غير متصل",
  connecting: "جاري الاتصال...",
  qr: "امسح رمز QR بواتساب العيادة",
  connected: "متصل",
};

export default function WhatsappConnect({ practiceId }: { practiceId: string }) {
  const [status, setStatus] = useState<WhatsappStatus>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getWhatsappStatusAction(practiceId).then((s) => {
      setStatus(s.status);
      setQr(s.qr);
    });
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [practiceId]);

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const s = await getWhatsappStatusAction(practiceId);
      setStatus(s.status);
      setQr(s.qr);
      if (s.status === "connected" && pollRef.current) {
        clearInterval(pollRef.current);
      }
    }, 3000);
  }

  async function handleConnect() {
    setError(null);
    try {
      await connectWhatsappAction(practiceId);
      startPolling();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر بدء الاتصال");
    }
  }

  async function handleDisconnect() {
    if (pollRef.current) clearInterval(pollRef.current);
    await disconnectWhatsappAction(practiceId);
    setStatus("disconnected");
    setQr(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-muted">{statusLabels[status]}</p>

      {status === "qr" && qr && (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL من مصدر داخلي، لا حاجة لتحسين next/image
        <img src={qr} alt="رمز QR لربط واتساب" className="h-48 w-48 rounded-lg border border-border" />
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        {status === "connected" ? (
          <button
            type="button"
            onClick={handleDisconnect}
            className="self-start rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-danger hover:text-danger"
          >
            قطع الاتصال
          </button>
        ) : (
          status !== "not_configured" && (
            <button
              type="button"
              onClick={handleConnect}
              className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong"
            >
              ربط واتساب
            </button>
          )
        )}
      </div>

      <p className="text-xs text-ink-muted">
        هذا اتصال غير رسمي عبر رقم واتساب العيادة (مو WhatsApp Business API الرسمي) — يحمل خطر حظر
        حقيقي على الرقم. لو انقطع الاتصال أو انحظر الرقم، تستمر المتابعة تلقائياً عبر SMS.
      </p>
    </div>
  );
}
