"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addExpense(_prevState: { error: string } | null, formData: FormData) {
  const category = String(formData.get("category") ?? "").trim();
  const payee = String(formData.get("payee") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const paymentMethod = String(formData.get("payment_method") ?? "cash").trim();
  const expenseAccountId = String(formData.get("expense_account_id") ?? "").trim();
  const cashOrBankAccountId = String(formData.get("cash_or_bank_account_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!category || !amount || amount <= 0 || !expenseAccountId || !cashOrBankAccountId) {
    return { error: "الرجاء تعبئة الفئة ومبلغ أكبر من صفر وحساب المصروف وحساب الصرف" };
  }

  if (expenseAccountId === cashOrBankAccountId) {
    return { error: "حساب المصروف وحساب الصرف لازم يكونوا مختلفين" };
  }

  const supabase = await createClient();

  const { data: expense, error: insertError } = await supabase
    .from("expenses")
    .insert({
      category,
      payee: payee || null,
      amount,
      expense_date: expenseDate || undefined,
      payment_method: paymentMethod || "cash",
      expense_account_id: expenseAccountId,
      notes: notes || null,
    })
    .select("id, expense_no, expense_date, amount")
    .single();

  if (insertError) {
    return { error: "تعذر تسجيل المصروف: " + insertError.message };
  }

  const { data: entryId, error: postError } = await supabase.rpc("post_journal_entry", {
    p_entry_date: expense.expense_date,
    p_memo: "مصروف: " + (payee || category),
    p_source_type: "expense",
    p_source_id: expense.id,
    p_lines: [
      { account_id: expenseAccountId, debit: expense.amount, credit: 0, description: null },
      { account_id: cashOrBankAccountId, debit: 0, credit: expense.amount, description: null },
    ],
  });

  if (postError) {
    return { error: "تم تسجيل المصروف لكن تعذر ترحيله محاسبياً: " + postError.message };
  }

  const { error: linkError } = await supabase
    .from("expenses")
    .update({ journal_entry_id: entryId })
    .eq("id", expense.id);

  if (linkError) {
    return { error: "تم ترحيل المصروف محاسبياً لكن تعذر ربط القيد بالمصروف: " + linkError.message };
  }

  revalidatePath("/accounting/expenses");
  revalidatePath("/accounting/journal");
  return null;
}
