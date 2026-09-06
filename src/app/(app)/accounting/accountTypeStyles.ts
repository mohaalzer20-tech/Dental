import type { StatusTone } from "@/components/StatusPill";

export const accountTypeLabels: Record<string, string> = {
  asset: "أصول",
  liability: "خصوم",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

export const accountTypeTone: Record<string, StatusTone> = {
  asset: "cyan",
  liability: "pink",
  equity: "violet",
  revenue: "green",
  expense: "accent",
};

export const accountTypeOrder = ["asset", "liability", "equity", "revenue", "expense"];
