"use client";

import { useState } from "react";
import { buildWhatsappLink } from "@/lib/whatsappLink";

export type Recipient = { patientName: string; phone: string | null; defaultMessage: string };
export type Template = { id: string; name: string; body: string };

export function fillTemplate(body: string, patientName: string) {
  return body.replace(/\{\{\s*name\s*\}\}/gi, patientName);
}

export function messageOptions(recipient: Recipient, templates: Template[]) {
  return [
    { label: "الرسالة الافتراضية", body: recipient.defaultMessage },
    ...templates.map((t) => ({ label: t.name, body: fillTemplate(t.body, recipient.patientName) })),
  ];
}

const selectClass = "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink";
const textareaClass = "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink";

export function MessagePanel({
  recipient,
  templates,
  onClose,
}: {
  recipient: Recipient;
  templates: Template[];
  onClose?: () => void;
}) {
  const options = messageOptions(recipient, templates);
  const [optionIndex, setOptionIndex] = useState(0);
  const [text, setText] = useState(options[0].body);

  if (!recipient.phone) {
    return <p className="px-2 text-sm text-danger">ما في رقم هاتف مسجّل لهذا المريض</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <select
        value={optionIndex}
        onChange={(e) => {
          const idx = Number(e.target.value);
          setOptionIndex(idx);
          setText(options[idx].body);
        }}
        className={selectClass}
      >
        {options.map((o, i) => (
          <option key={i} value={i}>
            {o.label}
          </option>
        ))}
      </select>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={textareaClass} />
      <div className="flex gap-2">
        <a
          href={buildWhatsappLink(recipient.phone, text)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "#25D366" }}
        >
          فتح واتساب
        </a>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            إلغاء
          </button>
        )}
      </div>
    </div>
  );
}

export function MessageModal({
  recipient,
  templates,
  onClose,
}: {
  recipient: Recipient;
  templates: Template[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">رسالة واتساب — {recipient.patientName}</h2>
          <button type="button" onClick={onClose} className="text-sm text-ink-muted hover:text-ink">
            إغلاق
          </button>
        </div>
        <MessagePanel recipient={recipient} templates={templates} />
      </div>
    </div>
  );
}

export function BulkSendModal({
  items,
  templates,
  onClose,
}: {
  items: Recipient[];
  templates: Template[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  const options = messageOptions(item, templates);
  const [optionIndex, setOptionIndex] = useState(0);
  const [text, setText] = useState(options[0].body);

  function goTo(newIndex: number) {
    setIndex(newIndex);
    setOptionIndex(0);
    setText(messageOptions(items[newIndex], templates)[0].body);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">
            {index + 1} من {items.length} — {item.patientName}
          </h2>
          <button type="button" onClick={onClose} className="text-sm text-ink-muted hover:text-ink">
            إغلاق
          </button>
        </div>

        {!item.phone ? (
          <p className="text-sm text-danger">ما في رقم هاتف مسجّل لهذا المريض</p>
        ) : (
          <div className="flex flex-col gap-3">
            <select
              value={optionIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setOptionIndex(idx);
                setText(options[idx].body);
              }}
              className={selectClass}
            >
              {options.map((o, i) => (
                <option key={i} value={i}>
                  {o.label}
                </option>
              ))}
            </select>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={textareaClass} />
            <a
              href={buildWhatsappLink(item.phone, text)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              فتح واتساب
            </a>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted disabled:opacity-40"
          >
            السابق
          </button>
          <button
            type="button"
            disabled={index === items.length - 1}
            onClick={() => goTo(index + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
