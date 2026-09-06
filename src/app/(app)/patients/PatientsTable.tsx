"use client";

import { useState } from "react";
import Link from "next/link";
import { BulkSendModal, type Recipient, type Template } from "@/components/WhatsappSend";

type Patient = { id: string; name: string; phone: string | null; dob: string | null };

export default function PatientsTable({ patients, templates }: { patients: Patient[]; templates: Template[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedPatients: Recipient[] = patients
    .filter((p) => selected.has(p.id))
    .map((p) => ({ patientName: p.name, phone: p.phone, defaultMessage: `أهلاً ${p.name}،` }));

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-primary bg-surface-alt px-4 py-3">
          <p className="text-sm text-ink">تم تحديد {selected.size} مريض</p>
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="rounded-lg bg-whatsapp px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            إرسال للمحددين عبر واتساب
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="w-8 px-4 py-2.5"></th>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">الهاتف</th>
              <th className="px-4 py-2.5 font-medium">تاريخ الميلاد</th>
            </tr>
          </thead>
          <tbody>
            {patients.length ? (
              patients.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                  </td>
                  <td className="px-4 py-2.5 text-ink">
                    <Link href={`/patients/${p.id}`} className="underline underline-offset-2">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{p.phone ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{p.dob ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  ما في مرضى بعد — أضف أول مريض من النموذج فوق
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {bulkOpen && <BulkSendModal items={selectedPatients} templates={templates} onClose={() => setBulkOpen(false)} />}
    </div>
  );
}
