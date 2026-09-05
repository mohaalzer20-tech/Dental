"use client";

import { useRef, useState, useTransition } from "react";
import { addLabOrder } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = { id: string; name: string };
type Vendor = { id: string; name: string };
type Treatment = { id: string; patient_id: string; label: string };

export default function LabOrderForm({
  patients,
  vendors,
  treatments,
}: {
  patients: Patient[];
  vendors: Vendor[];
  treatments: Treatment[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [patientId, setPatientId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addLabOrder(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        formRef.current?.reset();
        setPatientId("");
      }
    });
  }

  const patientTreatments = treatments.filter((t) => t.patient_id === patientId);

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">إرسال أمر للمخبر</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <select
          name="patient_id"
          required
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            المريض
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="lab_vendor_id" defaultValue="" className={inputClass}>
          <option value="">المخبر</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <select name="treatment_id" defaultValue="" disabled={!patientId} className={inputClass}>
          <option value="">بدون معالجة محددة</option>
          {patientTreatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <input name="description" type="text" placeholder="الوصف (تاج، جسر...)" className={inputClass} />
        <input name="cost" type="number" step="0.01" placeholder="التكلفة" className={inputClass} />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإرسال..." : "إرسال"}
      </button>
    </form>
  );
}
