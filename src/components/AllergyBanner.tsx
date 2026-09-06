export default function AllergyBanner({ allergies }: { allergies: string | null | undefined }) {
  if (!allergies?.trim()) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-danger bg-danger-bg p-4 text-sm text-danger">
      <span className="mt-0.5 font-bold">⚠</span>
      <div>
        <p className="font-semibold">تنبيه حساسية</p>
        <p className="mt-0.5">{allergies}</p>
      </div>
    </div>
  );
}
