create table public.patient_images (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id),
  patient_id uuid not null references public.patients(id),
  treatment_id uuid references public.treatments(id),
  tooth_number integer,
  category text not null check (category in ('xray','photo')),
  before_after text check (before_after in ('before','after')),
  taken_at timestamptz not null default now(),
  storage_path text not null,
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.patient_images enable row level security;

create policy patient_images_all_clinical on public.patient_images
  for all
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','assistant']));

create trigger trg_10_patient_images_stamp_practice_id before insert on public.patient_images
  for each row execute function stamp_practice_id();

create trigger trg_20_patient_images_validate_patient before insert or update on public.patient_images
  for each row execute function validate_same_practice_patient();

create trigger audit_patient_images after insert or delete or update on public.patient_images
  for each row execute function log_audit();

-- Private storage bucket for x-rays/photos. Path convention: {practice_id}/{patient_id}/{filename}
insert into storage.buckets (id, name, public) values ('patient-media', 'patient-media', false);

create policy patient_media_select on storage.objects
  for select
  using (
    bucket_id = 'patient-media'
    and (storage.foldername(name))[1] = current_practice_id()::text
    and "current_role"() = any (array['doctor','assistant'])
  );

create policy patient_media_insert on storage.objects
  for insert
  with check (
    bucket_id = 'patient-media'
    and (storage.foldername(name))[1] = current_practice_id()::text
    and "current_role"() = any (array['doctor','assistant'])
  );

create policy patient_media_delete on storage.objects
  for delete
  using (
    bucket_id = 'patient-media'
    and (storage.foldername(name))[1] = current_practice_id()::text
    and "current_role"() = any (array['doctor','assistant'])
  );
