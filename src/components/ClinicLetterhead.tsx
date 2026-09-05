type Practice = {
  clinic_name: string | null;
  doctor_name: string | null;
  address: string | null;
  phone: string | null;
};

export default function ClinicLetterhead({ practice }: { practice: Practice | null }) {
  return (
    <div className="border-b border-border pb-4">
      <h2 className="text-xl font-bold text-ink">{practice?.clinic_name || "العيادة"}</h2>
      {practice?.doctor_name && <p className="text-sm text-ink-muted">{practice.doctor_name}</p>}
      {practice?.address && <p className="text-sm text-ink-muted">{practice.address}</p>}
      {practice?.phone && <p className="text-sm text-ink-muted">هاتف: {practice.phone}</p>}
    </div>
  );
}
