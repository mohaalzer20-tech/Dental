create table public.perio_charts (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id),
  patient_id uuid not null references public.patients(id),
  tooth_number integer not null check (tooth_number between 11 and 85),
  pocket_depth numeric,
  bleeding boolean not null default false,
  recorded_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.perio_charts enable row level security;

create policy perio_charts_all_clinical on public.perio_charts
  for all
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']));

create trigger trg_10_perio_charts_stamp_practice_id before insert on public.perio_charts
  for each row execute function stamp_practice_id();

create trigger trg_20_perio_charts_validate_patient before insert or update on public.perio_charts
  for each row execute function validate_same_practice_patient();

create trigger audit_perio_charts after insert or delete or update on public.perio_charts
  for each row execute function log_audit();
