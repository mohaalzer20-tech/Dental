alter table public.lab_orders add column treatment_plan_id uuid references public.treatment_plans(id);
