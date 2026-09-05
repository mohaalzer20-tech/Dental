"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isRestorable } from "./restorable";

export async function restoreEntity(entityType: string, entityId: string) {
  if (!isRestorable(entityType)) {
    throw new Error("هذا النوع من السجلات غير قابل للاسترجاع");
  }

  const supabase = await createClient();
  const { error } = await supabase.from(entityType).update({ deleted_at: null }).eq("id", entityId);

  if (error) {
    throw new Error("تعذر استرجاع السجل: " + error.message);
  }

  revalidatePath("/audit");
}
