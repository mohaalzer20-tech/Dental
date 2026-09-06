"use client";

import { useState, useTransition } from "react";
import { createIntakeLink } from "../actions";
import { buildWhatsappLink } from "@/lib/whatsappLink";
import { withClinicSignature } from "@/lib/messageSignature";

export default function IntakeLinkButton({
  patientId,
  phone,
  clinicName,
  mapsUrl,
}: {
  patientId: string;
  phone: string | null;
  clinicName: string;
  mapsUrl?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullLink = link ? origin + link : "";
  const waHref =
    fullLink && phone
      ? buildWhatsappLink(
          phone,
          withClinicSignature(`الرجاء تعبئة نموذج الفحص المبدئي قبل زيارتك: ${fullLink}`, clinicName, mapsUrl),
        )
      : "";

  function generate() {
    startTransition(async () => {
      const result = await createIntakeLink(patientId);
      if (result.error) setError(result.error);
      else {
        setError(null);
        setLink(`/intake/${result.token}`);
      }
    });
  }

  if (!link) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={generate}
        className="self-start rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-alt disabled:opacity-50"
      >
        {pending ? "..." : "رابط نموذج الفحص المبدئي"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-alt p-3 text-sm">
      <code className="break-all font-mono text-primary-strong">{fullLink}</code>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(fullLink)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface"
        >
          نسخ الرابط
        </button>
        {phone && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface"
          >
            إرسال عبر واتساب
          </a>
        )}
      </div>
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
