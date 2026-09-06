import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/DeleteButton";
import AppointmentForm from "./AppointmentForm";
import AppointmentStatusSelect from "./AppointmentStatusSelect";
import RecallDateInput from "./RecallDateInput";
import WeekCalendar, { type CalendarAppointment } from "./WeekCalendar";
import AppointmentTypeManager from "./AppointmentTypeManager";
import { deleteAppointment } from "./actions";

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function periodRange(period: string, anchor: Date): { start: Date; end: Date } | null {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (period === "day") {
    end.setDate(end.getDate() + 1);
  } else if (period === "week") {
    start.setDate(start.getDate() - start.getDay());
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 7);
  } else if (period === "month") {
    start.setDate(1);
    end.setTime(start.getTime());
    end.setMonth(end.getMonth() + 1);
  } else if (period === "year") {
    start.setMonth(0, 1);
    end.setTime(start.getTime());
    end.setFullYear(end.getFullYear() + 1);
  } else {
    return null;
  }
  return { start, end };
}

const periodLabels: Record<string, string> = { day: "يومي", week: "أسبوعي", month: "شهري", year: "سنوي" };

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    patient_id?: string;
    view?: string;
    layout?: string;
    week?: string;
    period?: string;
    date?: string;
  }>;
}) {
  const { patient_id, view = "all", layout = "calendar", week, period = "", date } = await searchParams;
  const anchorDate = date ? new Date(date) : new Date();
  const supabase = await createClient();

  const [{ data: patients }, { data: types }] = await Promise.all([
    supabase.from("patients").select("id, name").is("deleted_at", null).order("name"),
    supabase
      .from("appointment_types")
      .select("id, name, color, default_duration_minutes")
      .is("deleted_at", null)
      .order("name"),
  ]);

  if (layout === "calendar") {
    const weekStart = startOfWeek(week ? new Date(week) : new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data: weekAppointments } = await supabase
      .from("appointments")
      .select("id, start_time, end_time, status, patients(name), appointment_types(color)")
      .is("deleted_at", null)
      .gte("start_time", weekStart.toISOString())
      .lt("start_time", weekEnd.toISOString())
      .order("start_time", { ascending: true });

    const calendarAppointments: CalendarAppointment[] = (weekAppointments ?? []).map((a) => ({
      id: a.id,
      start_time: a.start_time,
      end_time: a.end_time,
      status: a.status,
      patientName: (a.patients as unknown as { name: string } | null)?.name ?? "—",
      typeColor: (a.appointment_types as unknown as { color: string } | null)?.color ?? null,
    }));

    return (
      <div className="flex flex-col gap-6">
        <PageHeader layout={layout} />
        <AppointmentForm patients={patients ?? []} types={types ?? []} />
        <AppointmentTypeManager types={types ?? []} />
        <WeekCalendar weekStartIso={weekStart.toISOString()} appointments={calendarAppointments} />
      </div>
    );
  }

  let appointmentsQuery = supabase
    .from("appointments")
    .select("id, start_time, end_time, status, notes, recall_date, patients(id, name)")
    .is("deleted_at", null)
    .order("start_time", { ascending: true });
  if (patient_id) appointmentsQuery = appointmentsQuery.eq("patient_id", patient_id);
  if (view === "cancelled") appointmentsQuery = appointmentsQuery.eq("status", "cancelled");
  else if (view !== "all") appointmentsQuery = appointmentsQuery.neq("status", "cancelled");
  const range = periodRange(period, anchorDate);
  if (range) {
    appointmentsQuery = appointmentsQuery
      .gte("start_time", range.start.toISOString())
      .lt("start_time", range.end.toISOString());
  }

  const { data: appointments } = await appointmentsQuery;

  const filteredPatientName = patient_id
    ? (patients ?? []).find((p) => p.id === patient_id)?.name
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader layout={layout} />
      {filteredPatientName && (
        <p className="-mt-4 text-sm text-ink-muted">
          مفلترة لـ {filteredPatientName} — <Link href="/appointments?layout=list" className="underline underline-offset-2">إزالة الفلتر</Link>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {[
          { key: "all", label: "الكل" },
          { key: "active", label: "المواعيد" },
          { key: "cancelled", label: "الملغاة" },
        ].map((tab) => {
          const params = new URLSearchParams({ layout: "list" });
          if (patient_id) params.set("patient_id", patient_id);
          if (period) params.set("period", period);
          if (date) params.set("date", date);
          if (tab.key !== "all") params.set("view", tab.key);
          const active = view === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/appointments?${params.toString()}`}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                active ? "bg-primary text-on-primary" : "border border-border text-ink-muted hover:bg-surface-alt"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}

        <span className="mx-1 h-5 w-px bg-border" />

        {["day", "week", "month", "year"].map((p) => {
          const params = new URLSearchParams({ layout: "list", period: p });
          if (patient_id) params.set("patient_id", patient_id);
          if (view !== "all") params.set("view", view);
          if (date) params.set("date", date);
          const active = period === p;
          return (
            <Link
              key={p}
              href={`/appointments?${params.toString()}`}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                active ? "bg-primary text-on-primary" : "border border-border text-ink-muted hover:bg-surface-alt"
              }`}
            >
              {periodLabels[p]}
            </Link>
          );
        })}
        {period && (
          <Link
            href={`/appointments?layout=list${patient_id ? `&patient_id=${patient_id}` : ""}${view !== "all" ? `&view=${view}` : ""}`}
            className="text-xs text-ink-muted underline underline-offset-2"
          >
            إلغاء فلترة التاريخ
          </Link>
        )}

        <form method="get" className="flex items-center gap-2">
          <input type="hidden" name="layout" value="list" />
          {patient_id && <input type="hidden" name="patient_id" value={patient_id} />}
          {view !== "all" && <input type="hidden" name="view" value={view} />}
          <input type="hidden" name="period" value={period || "day"} />
          <input
            type="date"
            name="date"
            defaultValue={date ?? new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-ink outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-ink-muted transition-colors hover:bg-surface-alt"
          >
            اذهب لتاريخ
          </button>
        </form>
      </div>

      <AppointmentForm patients={patients ?? []} types={types ?? []} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-alt text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">المريض</th>
              <th className="px-4 py-2.5 font-medium">من</th>
              <th className="px-4 py-2.5 font-medium">إلى</th>
              <th className="px-4 py-2.5 font-medium">الحالة</th>
              <th className="px-4 py-2.5 font-medium">تاريخ المتابعة</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {appointments?.length ? (
              appointments.map((a) => {
                const patient = a.patients as unknown as { id?: string; name: string } | null;
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-ink">
                      {patient?.id ? (
                        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
                          {patient.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {new Date(a.start_time).toLocaleString("ar-SY-u-nu-latn")}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink-muted">
                      {new Date(a.end_time).toLocaleString("ar-SY-u-nu-latn")}
                    </td>
                    <td className="px-4 py-2.5">
                      <AppointmentStatusSelect id={a.id} status={a.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <RecallDateInput id={a.id} recallDate={a.recall_date} />
                    </td>
                    <td className="px-4 py-2.5">
                      {a.status === "cancelled" && (
                        <DeleteButton
                          action={deleteAppointment.bind(null, a.id)}
                          label="حذف نهائي"
                          confirmMessage="هذا حذف نهائي ويخفي الموعد من ملف المريض بالكامل. للإلغاء العادي فقط، استخدم قائمة الحالة. متابعة؟"
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  {view === "cancelled" ? "ما في مواعيد ملغاة" : "ما في مواعيد بعد — أضف أول موعد من النموذج فوق"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageHeader({ layout }: { layout: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">المواعيد</h1>
      <div className="mt-3 flex gap-2 text-sm">
        <Link
          href="/appointments?layout=calendar"
          className={`rounded-lg px-3 py-1.5 transition-colors ${
            layout === "calendar" ? "bg-primary text-on-primary" : "border border-border text-ink-muted hover:bg-surface-alt"
          }`}
        >
          الأسبوع
        </Link>
        <Link
          href="/appointments?layout=list"
          className={`rounded-lg px-3 py-1.5 transition-colors ${
            layout === "list" ? "bg-primary text-on-primary" : "border border-border text-ink-muted hover:bg-surface-alt"
          }`}
        >
          القائمة
        </Link>
        <Link
          href="/appointments/waitlist"
          className="rounded-lg border border-border px-3 py-1.5 text-ink-muted transition-colors hover:bg-surface-alt"
        >
          قائمة الانتظار
        </Link>
      </div>
    </div>
  );
}
