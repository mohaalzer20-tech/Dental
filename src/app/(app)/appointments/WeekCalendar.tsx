"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { rescheduleAppointment } from "./actions";
import { appointmentStatusBadgeClass, appointmentStatusLabels } from "./statusStyles";

const DAY_LABELS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
const PX_PER_MINUTE = 1.2;
const HEIGHT = TOTAL_MINUTES * PX_PER_MINUTE;

export type CalendarAppointment = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  patientName: string;
  typeColor: string | null;
};

export default function WeekCalendar({
  weekStartIso,
  appointments,
}: {
  weekStartIso: string;
  appointments: CalendarAppointment[];
}) {
  const [, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekStart = new Date(weekStartIso);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function minutesFromRangeStart(iso: string) {
    const d = new Date(iso);
    return (d.getHours() - START_HOUR) * 60 + d.getMinutes();
  }

  function handleDrop(e: React.DragEvent, day: Date) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/appointment-id");
    const durationMinutes = Number(e.dataTransfer.getData("text/duration-minutes"));
    if (!id || !durationMinutes) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const rawMinutes = Math.round(offsetY / PX_PER_MINUTE / 15) * 15;
    const clampedMinutes = Math.max(0, Math.min(TOTAL_MINUTES - 15, rawMinutes));

    const newStart = new Date(day);
    newStart.setHours(START_HOUR, 0, 0, 0);
    newStart.setMinutes(newStart.getMinutes() + clampedMinutes);
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

    startTransition(async () => {
      const result = await rescheduleAppointment(id, newStart.toISOString(), newEnd.toISOString());
      setError(result.error ?? null);
    });
  }

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link
          href={`/appointments?week=${prevWeek.toISOString().slice(0, 10)}`}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-alt"
        >
          الأسبوع السابق
        </Link>
        <p className="text-sm text-ink-muted">
          {days[0].toLocaleDateString("ar-SY-u-nu-latn")} — {days[6].toLocaleDateString("ar-SY-u-nu-latn")}
        </p>
        <Link
          href={`/appointments?week=${nextWeek.toISOString().slice(0, 10)}`}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-alt"
        >
          الأسبوع التالي
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <div className="grid min-w-[900px] grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-b border-border" />
          {days.map((d, i) => (
            <div key={i} className="border-b border-r border-border px-2 py-2 text-center text-xs text-ink-muted">
              {DAY_LABELS[d.getDay()]}
              <div className="font-mono text-ink">{d.toLocaleDateString("ar-SY-u-nu-latn", { day: "numeric", month: "numeric" })}</div>
            </div>
          ))}

          <div className="relative" style={{ height: HEIGHT }}>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, h) => (
              <div
                key={h}
                className="absolute right-0 left-0 border-t border-border px-1 text-[10px] text-ink-muted"
                style={{ top: h * 60 * PX_PER_MINUTE }}
              >
                {START_HOUR + h}:00
              </div>
            ))}
          </div>

          {days.map((day, i) => {
            const dayKey = day.toISOString().slice(0, 10);
            const dayAppointments = appointments.filter((a) => a.start_time.slice(0, 10) === dayKey);
            return (
              <div
                key={i}
                className="relative border-r border-border"
                style={{ height: HEIGHT }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, day)}
              >
                {Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, s) => (
                  <div
                    key={s}
                    className="absolute right-0 left-0 border-t border-border/40"
                    style={{ top: s * 30 * PX_PER_MINUTE }}
                  />
                ))}
                {dayAppointments.map((a) => {
                  const top = minutesFromRangeStart(a.start_time) * PX_PER_MINUTE;
                  const durationMinutes =
                    (new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 60000;
                  const height = Math.max(18, durationMinutes * PX_PER_MINUTE);
                  return (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(a.id);
                        e.dataTransfer.setData("text/appointment-id", a.id);
                        e.dataTransfer.setData("text/duration-minutes", String(durationMinutes));
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={`absolute inset-x-1 cursor-move overflow-hidden rounded-md border px-1.5 py-1 text-[11px] leading-tight ${appointmentStatusBadgeClass(
                        a.status,
                      )} ${dragId === a.id ? "opacity-50" : ""}`}
                      style={{
                        top,
                        height,
                        borderInlineStartWidth: a.typeColor ? "3px" : undefined,
                        borderInlineStartColor: a.typeColor ?? undefined,
                      }}
                      title={`${a.patientName} — ${appointmentStatusLabels[a.status] ?? a.status}`}
                    >
                      <p className="truncate font-medium">{a.patientName}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
