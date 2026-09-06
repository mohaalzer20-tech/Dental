"use client";

import { useState } from "react";
import { MessageModal, type Recipient, type Template } from "@/components/WhatsappSend";
import { withClinicSignature } from "@/lib/messageSignature";

export default function PatientWhatsappButton({
  patientName,
  phone,
  templates,
  clinicName,
  mapsUrl,
}: {
  patientName: string;
  phone: string | null;
  templates: Template[];
  clinicName: string;
  mapsUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const recipient: Recipient = {
    patientName,
    phone,
    defaultMessage: withClinicSignature(`أهلاً ${patientName}، كيف فيني ساعدك اليوم؟`, clinicName, mapsUrl),
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-lg border border-whatsapp px-3 py-1.5 text-sm font-medium text-whatsapp transition-colors"
      >
        واتساب
      </button>
      {open && <MessageModal recipient={recipient} templates={templates} onClose={() => setOpen(false)} />}
    </>
  );
}
