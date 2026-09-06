import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SupplierForm from "./SupplierForm";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, contact_person, phone")
    .is("deleted_at", null)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wide text-ink-muted">{suppliers?.length ?? 0} مورد</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">الموردون</h1>
      </div>

      <SupplierForm />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">الاسم</th>
              <th className="px-4 py-2.5 font-medium">المسؤول</th>
              <th className="px-4 py-2.5 font-medium">الهاتف</th>
            </tr>
          </thead>
          <tbody>
            {suppliers?.length ? (
              suppliers.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-ink">
                    <Link href={`/inventory/suppliers/${s.id}`} className="underline underline-offset-2">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{s.contact_person ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-ink-muted">{s.phone ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                  ما في موردين بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
