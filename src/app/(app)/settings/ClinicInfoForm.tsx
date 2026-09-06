"use client";

import { useActionState } from "react";
import { updateClinicInfo } from "./actions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export default function ClinicInfoForm({
  clinicName,
  doctorName,
  address,
  phone,
  taxNumber,
  licenseNumber,
  hidePatientIdentifiers,
  googleMapsUrl,
}: {
  clinicName: string;
  doctorName: string;
  address: string;
  phone: string;
  taxNumber: string;
  licenseNumber: string;
  hidePatientIdentifiers: boolean;
  googleMapsUrl: string;
}) {
  const [state, formAction, pending] = useActionState(updateClinicInfo, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          اسم العيادة
          <input name="clinic_name" type="text" defaultValue={clinicName} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          اسم الطبيب
          <input name="doctor_name" type="text" defaultValue={doctorName} required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          عنوان العيادة
          <input name="address" type="text" defaultValue={address} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          رقم الهاتف
          <input name="phone" type="text" defaultValue={phone} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          الرقم الضريبي للعيادة
          <input name="tax_number" type="text" defaultValue={taxNumber} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          رقم إجازة مزاولة المهنة (النقابة)
          <input name="license_number" type="text" defaultValue={licenseNumber} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted sm:col-span-2">
          رابط موقع العيادة على خرائط جوجل (يُرفق تلقائياً برسائل واتساب)
          <input
            name="google_maps_url"
            type="url"
            placeholder="https://maps.app.goo.gl/..."
            defaultValue={googleMapsUrl}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          name="hide_patient_identifiers_on_documents"
          type="checkbox"
          defaultChecked={hidePatientIdentifiers}
          className="h-4 w-4 rounded border-border"
        />
        إخفاء رقم الهوية وتاريخ الميلاد عن الفواتير والوصفات الطبية عند الطباعة
      </label>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
      >
        {pending ? "جاري الحفظ..." : "حفظ بيانات العيادة"}
      </button>
    </form>
  );
}
