alter table public.practices add column trial_ends_at timestamptz;
update public.practices set trial_ends_at = created_at + interval '14 days' where trial_ends_at is null;
alter table public.practices alter column trial_ends_at set default (now() + interval '14 days');
