"use client";

import { useRef, useState, useTransition } from "react";
import { addTreatment } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

type Patient = { id: string; name: string };
type Procedure = { id: string; name: string };
type Doctor = { id: string; full_name: string };
type Appointment = { id: string; patient_id: string; start_time: string };
type PlanItem = { id: string; patient_id: string; plan_title: string; procedure_name: string | null };
type ChartEntry = { id: string; patient_id: string; tooth_number: number; condition_label: string };

export default function TreatmentForm({
  patients,
  procedures,
  doctors,
  appointments,
  planItems,
  chartEntries,
}: {
  patients: Patient[];
  procedures: Procedure[];
  doctors: Doctor[];
  appointments: Appointment[];
  planItems: PlanItem[];
  chartEntries: ChartEntry[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [patientId, setPatientId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addTreatment(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        formRef.current?.reset();
        setPatientId("");
      }
    });
  }

  const patientAppointments = appointments.filter((a) => a.patient_id === patientId);
  const patientPlanItems = planItems.filter((p) => p.patient_id === patientId);
  const patientChartEntries = chartEntries.filter((c) => c.patient_id === patientId);

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">تسجيل معالجة</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        <select name="procedure_id" defaultValue="" className={inputClass}>
          <option value="">الإجراء (اختياري)</option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="doctor_id" defaultValue="" className={inputClass}>
          <option value="">الطبيب المعالج (اختياري)</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name}
            </option>
          ))}
        </select>
        <select name="appointment_id" defaultValue="" disabled={!patientId} className={inputClass}>
          <option value="">بدون موعد محدد</option>
          {patientAppointments.map((a) => (
            <option key={a.id} value={a.id}>
              {new Date(a.start_time).toLocaleString("ar-SY-u-nu-latn")}
            </option>
          ))}
        </select>
        <select name="treatment_plan_item_id" defaultValue="" disabled={!patientId} className={inputClass}>
          <option value="">بدون بند خطة علاج</option>
          {patientPlanItems.map((p) => (
            <option key={p.id} value={p.id}>
              {p.plan_title} — {p.procedure_name ?? "بند"}
            </option>
          ))}
        </select>
        <select name="chart_entry_id" defaultValue="" disabled={!patientId} className={inputClass}>
          <option value="">بدون سن من رسم الأسنان</option>
          {patientChartEntries.map((c) => (
            <option key={c.id} value={c.id}>
              سن {c.tooth_number} — {c.condition_label}
            </option>
          ))}
        </select>
        <input name="tooth_numbers" type="text" placeholder="أرقام الأسنان" className={inputClass} />
        <input name="diagnosis" type="text" placeholder="التشخيص" className={inputClass} />
        <input name="cost" type="number" step="0.01" placeholder="التكلفة" className={inputClass} />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري التسجيل..." : "تسجيل"}
      </button>
    </form>
  );
}
