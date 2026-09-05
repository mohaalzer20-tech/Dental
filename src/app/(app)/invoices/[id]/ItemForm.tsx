"use client";

import { useRef, useState, useTransition } from "react";
import { addInvoiceItem } from "../actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Treatment = { id: string; label: string; cost: number };

export default function ItemForm({ invoiceId, treatments }: { invoiceId: string; treatments: Treatment[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [treatmentId, setTreatmentId] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addInvoiceItem(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        formRef.current?.reset();
        setTreatmentId("");
        setDescription("");
        setUnitPrice("");
      }
    });
  }

  function handleTreatmentChange(id: string) {
    setTreatmentId(id);
    const treatment = treatments.find((t) => t.id === id);
    if (treatment) {
      setDescription(treatment.label);
      setUnitPrice(String(treatment.cost));
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <input type="hidden" name="treatment_id" value={treatmentId} />
      {treatments.length > 0 && (
        <select
          value={treatmentId}
          onChange={(e) => handleTreatmentChange(e.target.value)}
          className={inputClass}
        >
          <option value="">إضافة بند من معالجة سابقة (اختياري)</option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          name="description"
          type="text"
          placeholder="الوصف"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`sm:col-span-2 ${inputClass}`}
        />
        <input name="quantity" type="number" min="1" defaultValue="1" placeholder="الكمية" className={inputClass} />
        <input
          name="unit_price"
          type="number"
          step="0.01"
          placeholder="سعر الوحدة"
          required
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الإضافة..." : "إضافة بند"}
      </button>
    </form>
  );
}
