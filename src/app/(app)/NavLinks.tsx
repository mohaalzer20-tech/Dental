"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "",
    items: [{ href: "/", label: "الرئيسية", icon: HomeIcon }],
  },
  {
    label: "السريري",
    items: [
      { href: "/patients", label: "المرضى", icon: UsersIcon },
      { href: "/appointments", label: "المواعيد", icon: CalendarIcon },
      { href: "/clinical/treatment-plans", label: "خطط العلاج", icon: ClipboardIcon },
      { href: "/clinical/treatments", label: "المعالجات", icon: ToothIcon },
      { href: "/clinical/prescriptions", label: "الوصفات", icon: PillIcon },
      { href: "/clinical/dental-chart", label: "رسم الأسنان", icon: GridIcon },
      { href: "/clinical/procedures", label: "الإجراءات", icon: ListIcon },
      { href: "/lab", label: "المختبر", icon: FlaskIcon },
    ],
  },
  {
    label: "المالية والمحاسبة",
    items: [
      { href: "/invoices", label: "الفواتير", icon: ReceiptIcon },
      { href: "/accounting", label: "نظرة عامة", icon: LedgerIcon },
      { href: "/accounting/chart-of-accounts", label: "شجرة الحسابات", icon: LedgerIcon },
      { href: "/accounting/journal", label: "القيود اليومية", icon: JournalIcon },
      { href: "/accounting/expenses", label: "المصروفات", icon: ExpenseIcon },
      { href: "/accounting/reports", label: "التقارير المالية", icon: ReportIcon },
    ],
  },
  {
    label: "الإدارة والتشغيل",
    items: [
      { href: "/follow-ups", label: "متابعة دورية", icon: BellIcon },
      { href: "/inventory", label: "المخزون", icon: BoxIcon },
      { href: "/staff", label: "الموظفون", icon: UserGearIcon },
      { href: "/marketing", label: "التسويق", icon: MegaphoneIcon },
      { href: "/settings", label: "الإعدادات", icon: SettingsIcon },
    ],
  },
  {
    label: "الامتثال",
    items: [{ href: "/audit", label: "سجل التدقيق", icon: HistoryIcon }],
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {groups.map((group) => (
        <div key={group.label || "main"} className="flex flex-col gap-1">
          {group.label && (
            <p className="px-3 pb-1 text-[11px] font-medium text-ink-muted">{group.label}</p>
          )}
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-surface-alt text-primary-strong"
                    : "text-ink-muted hover:bg-surface-alt hover:text-ink")
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" strokeLinecap="round" />
      <path d="M8 3v3M16 3v3" strokeLinecap="round" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8 11h8M8 15h5" strokeLinecap="round" />
    </svg>
  );
}

function ToothIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M12 3c-3 0-5 2-5 5 0 3 1 4 1 8 0 2 1 3 2 3s1-3 2-6c0-1 1-1 1 0 1 3 1 6 2 6s2-1 2-3c0-4 1-5 1-8 0-3-2-5-5-5-1 0-1 .5-1 .5S13 3 12 3Z" />
    </svg>
  );
}

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 12)" />
      <path d="M10 8.5 14 15.5" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M8 6h12M8 12h12M8 18h12" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 15h9" strokeLinecap="round" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6" strokeLinecap="round" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" strokeLinejoin="round" />
      <path d="M3.5 8v8L12 20l8.5-4V8" strokeLinejoin="round" />
      <path d="M12 12v8" />
    </svg>
  );
}

function UserGearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="18" cy="15" r="2.2" />
      <path d="M18 11.5v1M18 17.5v1M14.5 15h1M20.5 15h1M15.5 12l.7.7M19.8 16.3l.7.7M15.5 18l.7-.7M19.8 13.7l.7-.7" strokeLinecap="round" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l9 4V5L6 9H4a1 1 0 0 0-1 1Z" strokeLinejoin="round" />
      <path d="M18 9a4 4 0 0 1 0 6" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
      <path d="M3 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18.4 5.6l-1.4 1.4M7 15.9l-1.4 1.4M18.4 18.4l-1.4-1.4M7 8.1 5.6 6.7" strokeLinecap="round" />
    </svg>
  );
}

function LedgerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M6 3h9l4 4v14H6z" strokeLinejoin="round" />
      <path d="M15 3v4h4" strokeLinejoin="round" />
      <path d="M9 12h7M9 16h7M9 8h3" strokeLinecap="round" />
    </svg>
  );
}

function JournalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h3M13 9h3M8 15h8" strokeLinecap="round" />
      <path d="M12 9v6" strokeLinecap="round" />
    </svg>
  );
}

function ExpenseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M14.5 9.5c0-1-1-1.7-2.5-1.7s-2.5.7-2.5 1.7 1 1.5 2.5 1.9 2.5 1 2.5 1.9-1 1.7-2.5 1.7-2.5-.7-2.5-1.7" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function ReportIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
