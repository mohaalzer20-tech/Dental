-- Fixed salary (independent of existing commission_rate — both configurable per staff member).
alter table public.users add column fixed_salary numeric;

-- Basic attendance/clock-in log, separate from the recurring weekly staff_shifts template.
create table public.staff_attendance (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id),
  user_id uuid not null references public.users(id),
  work_date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.staff_attendance enable row level security;

create policy staff_attendance_all_doctor on public.staff_attendance
  for all
  using (practice_id = current_practice_id() and "current_role"() = 'doctor')
  with check (practice_id = current_practice_id() and "current_role"() = 'doctor');

-- Staff can manage their own clock-in/out regardless of role.
create policy staff_attendance_self on public.staff_attendance
  for all
  using (practice_id = current_practice_id() and user_id = auth.uid())
  with check (practice_id = current_practice_id() and user_id = auth.uid());

create trigger trg_10_staff_attendance_stamp_practice_id before insert on public.staff_attendance
  for each row execute function stamp_practice_id();

create trigger audit_staff_attendance after insert or delete or update on public.staff_attendance
  for each row execute function log_audit();
