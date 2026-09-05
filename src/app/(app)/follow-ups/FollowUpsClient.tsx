"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { markRecallCompleted } from "../appointments/actions";
import { buildWhatsappLink } from "@/lib/whatsappLink";

export type FollowUpItem = {
  id: string;
  patientId: string;
  patientName: string;
  phone: string | null;
  detail: string;
  href: string;
  defaultMessage: string;
  completeAction?: true;
};

type Template = { id: string; name: string; body: string };

function fillTemplate(body: string, patientName: string) {
  return body.replace(/\{\{\s*name\s*\}\}/gi, patientName);
}

function messageOptions(item: FollowUpItem, templates: Template[]) {
  return [
    { label: "الرسالة الافتراضية", body: item.defaultMessage },
    ...templates.map((t) => ({ label: t.name, body: fillTemplate(t.body, item.patientName) })),
  ];
}

const TABS = [
  { key: "appointments", label: "المواعيد القادمة" },
  { key: "recalls", label: "المتابعة الدورية" },
  { key: "invoices", label: "الدفعات المتأخرة" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function FollowUpsClient({
  appointments,
  recalls,
  invoices,
  templates,
}: {
  appointments: FollowUpItem[];
  recalls: FollowUpItem[];
  invoices: FollowUpItem[];
  templates: Template[];
}) {
  const [tab, setTab] = useState<TabKey>("appointments");
  const [selected, setSelected] = useState<Record<TabKey, Set<string>>>({
    appointments: new Set(),
    recalls: new Set(),
    invoices: new Set(),
  });
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const dataByTab: Record<TabKey, FollowUpItem[]> = { appointments, recalls, invoices };
  const items = dataByTab[tab];
  const selectedIds = selected[tab];

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev[tab]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [tab]: next };
    });
  }

  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">متابعة دورية</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">المتابعة الدورية</h1>
        <p className="mt-1 text-sm text-ink-muted">
          قائمة عمل يومية — الرسائل تُفتح جاهزة بواتساب وإنت يلي بتضغط إرسال، ما تُرسل تلقائياً.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "border-b-2 border-primary text-primary-strong" : "text-ink-muted hover:text-ink"
            }`}
          >
            {t.label} ({dataByTab[t.key].length})
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-primary bg-surface-alt px-4 py-3">
          <p className="text-sm text-ink">تم تحديد {selectedIds.size} مريض</p>
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong"
          >
            إرسال للمحددين
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-5">
        {items.length ? (
          <table className="w-full text-right text-sm">
            <thead className="text-ink-muted">
              <tr>
                <th className="w-8 pb-2"></th>
                <th className="pb-2 font-medium">المريض</th>
                <th className="pb-2 font-medium">التفاصيل</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Fragment key={item.id}>
                  <tr className="border-t border-border">
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelected(item.id)}
                      />
                    </td>
                    <td className="py-2 text-ink">
                      <Link href={item.href} className="underline underline-offset-2">
                        {item.patientName}
                      </Link>
                    </td>
                    <td className="py-2 text-ink-muted">{item.detail}</td>
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setOpenRowId(openRowId === item.id ? null : item.id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm text-primary-strong transition-colors hover:border-primary"
                        >
                          واتساب
                        </button>
                        {item.completeAction && <RecallCompleteButton id={item.id} />}
                      </div>
                    </td>
                  </tr>
                  {openRowId === item.id && (
                    <tr className="border-t border-border bg-surface-alt">
                      <td colSpan={4} className="py-3">
                        <MessagePanel item={item} templates={templates} onClose={() => setOpenRowId(null)} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-ink-muted">ما في شي يحتاج متابعة حالياً بهالتبويب</p>
        )}
      </div>

      {bulkOpen && (
        <BulkSendModal items={selectedItems} templates={templates} onClose={() => setBulkOpen(false)} />
      )}
    </div>
  );
}

function MessagePanel({
  item,
  templates,
  onClose,
}: {
  item: FollowUpItem;
  templates: Template[];
  onClose: () => void;
}) {
  const options = messageOptions(item, templates);
  const [optionIndex, setOptionIndex] = useState(0);
  const [text, setText] = useState(options[0].body);

  if (!item.phone) {
    return <p className="px-2 text-sm text-danger">ما في رقم هاتف مسجّل لهذا المريض</p>;
  }

  return (
    <div className="flex flex-col gap-3 px-2">
      <select
        value={optionIndex}
        onChange={(e) => {
          const idx = Number(e.target.value);
          setOptionIndex(idx);
          setText(options[idx].body);
        }}
        className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink"
      >
        {options.map((o, i) => (
          <option key={i} value={i}>
            {o.label}
          </option>
        ))}
      </select>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink"
      />
      <div className="flex gap-2">
        <a
          href={buildWhatsappLink(item.phone, text)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong"
        >
          فتح واتساب
        </a>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

function BulkSendModal({
  items,
  templates,
  onClose,
}: {
  items: FollowUpItem[];
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
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {options.map((o, i) => (
                <option key={i} value={i}>
                  {o.label}
                </option>
              ))}
            </select>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
            <a
              href={buildWhatsappLink(item.phone, text)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong"
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

function RecallCompleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markRecallCompleted(id))}
      className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-primary hover:text-primary-strong disabled:opacity-50"
    >
      {pending ? "..." : "تم التواصل"}
    </button>
  );
}
