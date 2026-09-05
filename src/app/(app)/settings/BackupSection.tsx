"use client";

import { useSyncExternalStore } from "react";

const LAST_BACKUP_KEY = "last_backup_at";
const MONTH_MS = 30 * 86400000;
const BACKUP_EVENT = "backup-recorded";

function getSnapshot() {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return null;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(BACKUP_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(BACKUP_EVENT, callback);
  };
}

export default function BackupSection() {
  const lastAt = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const now = new Date().getTime();
  const daysSince = lastAt ? Math.floor((now - new Date(lastAt).getTime()) / 86400000) : null;
  const overdue = !lastAt || now - new Date(lastAt).getTime() > MONTH_MS;

  return (
    <div className="flex flex-col gap-3">
      <p className={`text-sm ${overdue ? "text-danger" : "text-primary-strong"}`}>
        {lastAt
          ? `آخر نسخة من هذا الجهاز: ${new Date(lastAt).toLocaleDateString("ar-SY")}${daysSince !== null ? ` (قبل ${daysSince} يوم)` : ""}`
          : "لم تُنشأ نسخة احتياطية من هذا الجهاز بعد"}
        {overdue && " — يُنصح بتنزيل نسخة جديدة"}
      </p>
      <a
        href="/api/backup"
        onClick={() => {
          try {
            localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
            window.dispatchEvent(new Event(BACKUP_EVENT));
          } catch {
            /* تجاهل */
          }
        }}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-strong"
      >
        تنزيل نسخة احتياطية (Excel)
      </a>
      <p className="text-xs text-ink-muted">
        تنزّل كل بيانات العيادة (مرضى، مواعيد، فواتير، محاسبة، مخزون...) بملف إكسل واحد، ورقة لكل جدول. احفظ
        الملف خارج هذا الجهاز (بريد إلكتروني أو قرص خارجي) — النسخة على نفس الجهاز لا تحميك لو تعطّل.
      </p>
    </div>
  );
}
