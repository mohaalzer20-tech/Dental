"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Line = { account_id: string; debit: number; credit: number; description: string | null };

export async function createJournalEntry(_prevState: { error: string } | null, formData: FormData) {
  const entryDate = String(formData.get("entry_date") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const linesRaw = String(formData.get("lines") ?? "[]");

  let lines: Line[] = [];
  try {
    lines = JSON.parse(linesRaw);
  } catch {
    return { error: "تعذر قراءة أسطر القيد" };
  }

  const validLines = lines.filter((l) => l.account_id && (l.debit > 0 || l.credit > 0));
  if (validLines.length < 2) {
    return { error: "القيد يجب أن يحتوي على سطرين على الأقل" };
  }

  const totalDebit = validLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = validLines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  if (Math.round((totalDebit - totalCredit) * 100) !== 0) {
    return { error: "القيد غير متوازن: مجموع المدين لا يساوي مجموع الدائن" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("post_journal_entry", {
    p_entry_date: entryDate || null,
    p_memo: memo || null,
    p_source_type: "manual",
    p_source_id: null,
    p_lines: validLines,
  });

  if (error) {
    return { error: "تعذر إنشاء القيد: " + error.message };
  }

  revalidatePath("/accounting/journal");
  redirect(`/accounting/journal/${data}`);
}
