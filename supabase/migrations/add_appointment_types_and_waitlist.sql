create table public.appointment_types (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id),
  name text not null,
  default_duration_minutes integer not null default 30,
  color text not null default '#22d3ee',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.appointment_types enable row level security;

create policy appointment_types_select on public.appointment_types
  for select
  using (practice_id = current_practice_id());

create policy appointment_types_write_clinical on public.appointment_types
  for all
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']));

create trigger trg_10_appointment_types_stamp_practice_id before insert on public.appointment_types
  for each row execute function stamp_practice_id();

create trigger audit_appointment_types after insert or delete or update on public.appointment_types
  for each row execute function log_audit();

alter table public.appointments add column appointment_type_id uuid references public.appointment_types(id);

create table public.appointment_waitlist (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id),
  patient_id uuid not null references public.patients(id),
  desired_from timestamptz,
  desired_to timestamptz,
  notes text,
  notified boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.appointment_waitlist enable row level security;

create policy appointment_waitlist_select on public.appointment_waitlist
  for select using (practice_id = current_practice_id());
create policy appointment_waitlist_insert on public.appointment_waitlist
  for insert with check (practice_id = current_practice_id());
create policy appointment_waitlist_update on public.appointment_waitlist
  for update using (practice_id = current_practice_id()) with check (practice_id = current_practice_id());
create policy appointment_waitlist_delete on public.appointment_waitlist
  for delete using (practice_id = current_practice_id());

create trigger trg_10_appointment_waitlist_stamp_practice_id before insert on public.appointment_waitlist
  for each row execute function stamp_practice_id();

create trigger trg_20_appointment_waitlist_validate_patient before insert or update on public.appointment_waitlist
  for each row execute function validate_same_practice_patient();

create trigger audit_appointment_waitlist after insert or delete or update on public.appointment_waitlist
  for each row execute function log_audit();
