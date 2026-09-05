import { createClient } from "@/lib/supabase/server";

const TABLES: { key: string; label: string }[] = [
  { key: "patients", label: "المرضى" },
  { key: "appointments", label: "المواعيد" },
  { key: "treatment_plans", label: "خطط العلاج" },
  { key: "treatment_plan_items", label: "بنود خطط العلاج" },
  { key: "treatments", label: "المعالجات" },
  { key: "procedures", label: "الإجراءات" },
  { key: "prescriptions", label: "الوصفات" },
  { key: "prescription_items", label: "أدوية الوصفات" },
  { key: "dental_chart_entries", label: "رسم الأسنان" },
  { key: "lab_orders", label: "طلبات المختبر" },
  { key: "lab_vendors", label: "مختبرات خارجية" },
  { key: "invoices", label: "الفواتير" },
  { key: "invoice_items", label: "بنود الفواتير" },
  { key: "payments", label: "الدفعات" },
  { key: "chart_of_accounts", label: "شجرة الحسابات" },
  { key: "journal_entries", label: "القيود اليومية" },
  { key: "journal_entry_lines", label: "أسطر القيود" },
  { key: "expenses", label: "المصروفات" },
  { key: "inventory_categories", label: "تصنيفات المخزون" },
  { key: "inventory_items", label: "أصناف المخزون" },
  { key: "inventory_batches", label: "دفعات المخزون" },
  { key: "stock_transactions", label: "حركات المخزون" },
  { key: "suppliers", label: "الموردون" },
  { key: "purchase_orders", label: "أوامر الشراء" },
  { key: "purchase_order_items", label: "بنود أوامر الشراء" },
  { key: "staff_shifts", label: "مناوبات الموظفين" },
  { key: "communication_templates", label: "قوالب الرسائل" },
  { key: "users", label: "الموظفون" },
  { key: "audit_log", label: "سجل التدقيق" },
];

const cell = (v: unknown): string | number => {
  if (v == null) return "";
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? "نعم" : "لا";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

export async function GET() {
  const supabase = await createClient();

  const results = await Promise.all(
    TABLES.map(async ({ key }) => {
      const { data, error } = await supabase.from(key).select("*");
      if (error) return { key, rows: [] as Record<string, unknown>[] };
      return { key, rows: (data ?? []) as Record<string, unknown>[] };
    }),
  );
  const rowsByKey = new Map(results.map((r) => [r.key, r.rows]));

  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "نظام إدارة العيادة";
  wb.created = new Date();

  const index = wb.addWorksheet("الفهرس", { views: [{ rightToLeft: true }] });
  index.columns = [{ width: 30 }, { width: 16 }];
  index.addRow([`نسخة احتياطية كاملة — ${new Date().toLocaleString("ar-SY")}`]);
  index.addRow([]);
  index.addRow(["الجدول", "عدد السجلات"]);
  for (const { key, label } of TABLES) {
    index.addRow([label, (rowsByKey.get(key) ?? []).length]);
  }

  for (const { key, label } of TABLES) {
    const rows = rowsByKey.get(key) ?? [];
    const sheet = wb.addWorksheet(label.slice(0, 31), { views: [{ rightToLeft: true }] });
    if (rows.length === 0) continue;
    const columns = Object.keys(rows[0]);
    sheet.columns = columns.map((c) => ({ header: c, key: c, width: 18 }));
    for (const row of rows) {
      sheet.addRow(columns.map((c) => cell(row[c])));
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `backup-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
