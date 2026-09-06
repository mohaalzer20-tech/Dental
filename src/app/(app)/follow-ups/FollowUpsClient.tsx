"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { markRecallCompleted } from "../appointments/actions";
import { MessagePanel, BulkSendModal, type Template } from "@/components/WhatsappSend";

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
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#25D366" }}
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
                          className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
                          style={{ borderColor: "#25D366", color: "#25D366" }}
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
                        <MessagePanel recipient={item} templates={templates} onClose={() => setOpenRowId(null)} />
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
