"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveReconciliation(_prevState: { error: string } | null, formData: FormData) {
  const workDate = String(formData.get("work_date") ?? "");
  const expectedAmount = Number(formData.get("expected_amount") ?? 0);
  const actualAmount = Number(formData.get("actual_amount") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!workDate) {
    return { error: "تاريخ غير صالح" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("cash_reconciliations").upsert(
    {
      work_date: workDate,
      expected_amount: expectedAmount,
      actual_amount: actualAmount,
      notes: notes || null,
      reconciled_by: user?.id ?? null,
    },
    { onConflict: "practice_id,work_date" },
  );

  if (error) {
    return { error: "تعذر الحفظ: " + error.message };
  }

  revalidatePath("/accounting/cash-reconciliation");
  return null;
}
