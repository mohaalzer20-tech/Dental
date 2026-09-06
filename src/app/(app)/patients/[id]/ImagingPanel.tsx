"use client";

import { useActionState, useRef, useEffect } from "react";
import { uploadPatientImage, deletePatientImage } from "./imagingActions";

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary";

export type PatientImage = {
  id: string;
  category: string;
  before_after: string | null;
  tooth_number: number | null;
  taken_at: string;
  url: string | null;
};

export default function ImagingPanel({ patientId, images }: { patientId: string; images: PatientImage[] }) {
  const [state, formAction, pending] = useActionState(uploadPatientImage, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  const beforeImages = images.filter((i) => i.before_after === "before");
  const afterImages = images.filter((i) => i.before_after === "after");
  const otherImages = images.filter((i) => !i.before_after);

  return (
    <div className="flex flex-col gap-5">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
      >
        <h2 className="text-sm font-semibold text-ink">إضافة صورة / أشعة</h2>
        <input type="hidden" name="patient_id" value={patientId} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select name="category" defaultValue="photo" className={inputClass}>
            <option value="photo">صورة</option>
            <option value="xray">أشعة</option>
          </select>
          <select name="before_after" defaultValue="" className={inputClass}>
            <option value="">بدون تصنيف قبل/بعد</option>
            <option value="before">قبل</option>
            <option value="after">بعد</option>
          </select>
          <input name="tooth_number" type="number" placeholder="رقم السن (اختياري)" className={inputClass} />
          <input name="file" type="file" accept="image/*" required className={inputClass} />
        </div>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {pending ? "جاري الرفع..." : "رفع"}
        </button>
      </form>

      {(beforeImages.length > 0 || afterImages.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageGroup title="قبل" images={beforeImages} patientId={patientId} />
          <ImageGroup title="بعد" images={afterImages} patientId={patientId} />
        </div>
      )}

      <ImageGroup title="كل الصور" images={otherImages.length ? otherImages : images} patientId={patientId} grid />
    </div>
  );
}

function ImageGroup({
  title,
  images,
  patientId,
  grid,
}: {
  title: string;
  images: PatientImage[];
  patientId: string;
  grid?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {images.length ? (
        <div className={grid ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "flex flex-col gap-3"}>
          {images.map((img) => (
            <div key={img.id} className="flex flex-col gap-1.5">
              {img.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt="" className="aspect-square w-full rounded-lg border border-border object-cover" />
              )}
              <p className="text-[11px] text-ink-muted">
                {img.category === "xray" ? "أشعة" : "صورة"}
                {img.tooth_number ? ` — سن ${img.tooth_number}` : ""}
              </p>
              <button
                type="button"
                onClick={() => deletePatientImage(img.id, patientId)}
                className="self-start text-[11px] text-danger underline underline-offset-2"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">لا شيء بعد</p>
      )}
    </div>
  );
}
