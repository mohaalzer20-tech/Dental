"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type GlobalSearchResult = {
  patients: { id: string; name: string; phone: string | null }[];
  invoices: { id: string; invoice_no: string }[];
};

export async function searchGlobal(query: string): Promise<GlobalSearchResult> {
  const term = query.trim();
  if (term.length < 2) {
    return { patients: [], invoices: [] };
  }

  const supabase = await createClient();
  const [{ data: byName }, { data: byPhone }, { data: invoices }] = await Promise.all([
    supabase.from("patients").select("id, name, phone").is("deleted_at", null).ilike("name", `%${term}%`).limit(5),
    supabase.from("patients").select("id, name, phone").is("deleted_at", null).ilike("phone", `%${term}%`).limit(5),
    supabase.from("invoices").select("id, invoice_no").is("deleted_at", null).ilike("invoice_no", `%${term}%`).limit(5),
  ]);

  const seen = new Set<string>();
  const patients = [...(byName ?? []), ...(byPhone ?? [])].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return { patients: patients.slice(0, 5), invoices: invoices ?? [] };
}
