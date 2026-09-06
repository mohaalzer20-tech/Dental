alter table public.treatment_plans drop constraint treatment_plans_status_check;
alter table public.treatment_plans add constraint treatment_plans_status_check
  check (status = any (array['draft','proposed','accepted','declined','in_progress','completed','cancelled']));
