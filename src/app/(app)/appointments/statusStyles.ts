export const appointmentStatuses = [
  { value: "pending", label: "بانتظار التأكيد" },
  { value: "scheduled", label: "مجدول" },
  { value: "confirmed", label: "مؤكد" },
  { value: "completed", label: "منتهي" },
  { value: "cancelled", label: "ملغى" },
  { value: "no_show", label: "لم يحضر" },
] as const;

export const appointmentStatusLabels: Record<string, string> = Object.fromEntries(
  appointmentStatuses.map((s) => [s.value, s.label]),
);

// pending = accent (يحتاج انتباه), confirmed = primary (طبيعي), cancelled/no_show = danger (نفس تصميم CSS الأصلي)
const statusColorClasses: Record<string, string> = {
  pending: "border-accent/40 bg-accent/10 text-accent",
  scheduled: "border-border bg-surface-alt text-ink-muted",
  confirmed: "border-primary/40 bg-primary/10 text-primary-strong",
  completed: "border-border bg-surface-alt text-ink-muted",
  cancelled: "border-danger/30 bg-danger-bg text-danger",
  no_show: "border-danger/30 bg-danger-bg text-danger",
};

export function appointmentStatusBadgeClass(status: string): string {
  return statusColorClasses[status] ?? "border-border bg-surface-alt text-ink-muted";
}
