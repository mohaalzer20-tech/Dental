create table public.patient_intake_tokens (
  token text primary key default encode(gen_random_bytes(16), 'hex'),
  practice_id uuid not null references public.practices(id),
  patient_id uuid not null references public.patients(id),
  created_at timestamptz not null default now(),
  submitted_at timestamptz
);

alter table public.patient_intake_tokens enable row level security;

create policy patient_intake_tokens_all_clinical on public.patient_intake_tokens
  for all
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']));

create trigger trg_10_patient_intake_tokens_stamp_practice_id before insert on public.patient_intake_tokens
  for each row execute function stamp_practice_id();

create trigger trg_20_patient_intake_tokens_validate_patient before insert or update on public.patient_intake_tokens
  for each row execute function validate_same_practice_patient();

-- Anonymous submission RPC — mirrors the request_appointment/track_appointment pattern.
create or replace function public.submit_patient_intake(
  p_token text,
  p_allergies text,
  p_medical_history text
)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_patient_id uuid;
begin
  select patient_id into v_patient_id
  from public.patient_intake_tokens
  where token = p_token and submitted_at is null;

  if v_patient_id is null then
    raise exception 'رابط غير صالح أو مُستخدم مسبقاً';
  end if;

  update public.patients
  set allergies = nullif(p_allergies, ''), medical_history = nullif(p_medical_history, '')
  where id = v_patient_id;

  update public.patient_intake_tokens set submitted_at = now() where token = p_token;

  return true;
end;
$function$;

create or replace function public.get_intake_patient_name(p_token text)
returns text
language sql
security definer
set search_path to 'public'
as $function$
  select p.name
  from public.patient_intake_tokens t
  join public.patients p on p.id = t.patient_id
  where t.token = p_token and t.submitted_at is null;
$function$;

revoke execute on function public.submit_patient_intake(text, text, text) from public;
grant execute on function public.submit_patient_intake(text, text, text) to anon, authenticated;
revoke execute on function public.get_intake_patient_name(text) from public;
grant execute on function public.get_intake_patient_name(text) to anon, authenticated;
