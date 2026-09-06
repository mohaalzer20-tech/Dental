"use client";

import { useMemo, useRef } from "react";

type Patient = { id: string; name: string };

// Native <input list> + <datalist> search-as-you-type picker — scales to hundreds of
// patients without a combobox library. A hidden input carries the resolved patient_id;
// the visible input is uncontrolled (defaultValue only) so a native form.reset() clears it.
export default function PatientSelect({
  patients,
  name = "patient_id",
  defaultPatientId = "",
  onChange,
  required,
  disabled,
  className,
  placeholder = "ابحث عن المريض بالاسم",
}: {
  patients: Patient[];
  name?: string;
  defaultPatientId?: string;
  onChange?: (patientId: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const byName = useMemo(() => new Map(patients.map((p) => [p.name, p.id])), [patients]);
  const byId = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const listId = `patients-list-${name}`;
  const defaultText = byId.get(defaultPatientId)?.name ?? "";

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    const matchedId = byName.get(e.currentTarget.value) ?? "";
    if (hiddenRef.current) hiddenRef.current.value = matchedId;
    onChange?.(matchedId);
  }

  return (
    <>
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultPatientId} />
      <input
        list={listId}
        defaultValue={defaultText}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={className}
        onInput={handleInput}
        autoComplete="off"
      />
      <datalist id={listId}>
        {patients.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>
    </>
  );
}
