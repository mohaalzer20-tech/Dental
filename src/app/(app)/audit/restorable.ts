const RESTORABLE_ENTITIES = new Set([
  "patients",
  "appointments",
  "treatment_plans",
  "treatments",
  "prescriptions",
  "procedures",
  "dental_chart_entries",
  "lab_orders",
  "lab_vendors",
  "inventory_items",
  "suppliers",
  "purchase_orders",
  "staff_shifts",
  "communication_templates",
  "invoices",
]);

export function isRestorable(entityType: string) {
  return RESTORABLE_ENTITIES.has(entityType);
}

type AuditRow = {
  action: string;
  entity_type: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
};

// حذف "ناعم" (soft delete) هو تحديث عادي بنظر قاعدة البيانات (UPDATE يضبط deleted_at) —
// المُشغّل log_audit يسجّله كـ action='update'، فلازم نميّزه عن أي تعديل عادي بمقارنة الحقل نفسه.
export function isSoftDelete(entry: AuditRow) {
  return (
    entry.action === "update" &&
    isRestorable(entry.entity_type) &&
    entry.old_data?.deleted_at == null &&
    entry.new_data?.deleted_at != null
  );
}
