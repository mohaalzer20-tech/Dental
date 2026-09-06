alter table public.treatment_plan_items
  alter column tooth_numbers type text[]
  using case when tooth_numbers is null or tooth_numbers = '' then null
             else string_to_array(regexp_replace(tooth_numbers, '\s', '', 'g'), ',')
        end;
