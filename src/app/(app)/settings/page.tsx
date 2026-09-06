import { createClient } from "@/lib/supabase/server";
import AccountingSettingsForm from "./AccountingSettingsForm";
import ClinicInfoForm from "./ClinicInfoForm";
import BackupSection from "./BackupSection";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: practice }, { data: accounts }] = await Promise.all([
    supabase
      .from("practices")
      .select(
        "id, clinic_name, doctor_name, address, phone, email, tax_number, license_number, currency, default_cash_account_id, default_bank_account_id, default_revenue_account_id, hide_patient_identifiers_on_documents, google_maps_url",
      )
      .single(),
    supabase.from("chart_of_accounts").select("id, code, name, type").eq("is_active", true).order("code"),
  ]);

  const bookingPath = practice ? `/book/${practice.id}` : null;
  const assetAccounts = (accounts ?? []).filter((a) => a.type === "asset");
  const revenueAccounts = (accounts ?? []).filter((a) => a.type === "revenue");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">الإعدادات</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">إعدادات العيادة</h1>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">رابط الحجز العام</h2>
        <p className="mb-3 text-sm text-ink-muted">
          شارك هذا الرابط مع مرضاك ليتمكنوا من طلب حجز موعد بدون تسجيل دخول.
        </p>
        {bookingPath && (
          <code className="block rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-primary-strong break-all">
            {bookingPath}
          </code>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">بيانات العيادة</h2>
        <p className="mb-3 text-sm text-ink-muted">
          هذه البيانات تظهر بترويسة الفواتير والوصفات الطبية عند طباعتها. التعديل متاح للطبيب فقط.
        </p>
        <ClinicInfoForm
          clinicName={practice?.clinic_name ?? ""}
          doctorName={practice?.doctor_name ?? ""}
          address={practice?.address ?? ""}
          phone={practice?.phone ?? ""}
          taxNumber={practice?.tax_number ?? ""}
          licenseNumber={practice?.license_number ?? ""}
          hidePatientIdentifiers={practice?.hide_patient_identifiers_on_documents ?? false}
          googleMapsUrl={practice?.google_maps_url ?? ""}
        />
        <p className="mt-3 text-sm text-ink-muted">البريد: {practice?.email}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">النسخة الاحتياطية</h2>
        <BackupSection />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">إعدادات المحاسبة</h2>
        <AccountingSettingsForm
          currency={practice?.currency ?? "SYP"}
          cashAccountId={practice?.default_cash_account_id ?? null}
          bankAccountId={practice?.default_bank_account_id ?? null}
          revenueAccountId={practice?.default_revenue_account_id ?? null}
          assetAccounts={assetAccounts}
          revenueAccounts={revenueAccounts}
        />
      </div>
    </div>
  );
}
