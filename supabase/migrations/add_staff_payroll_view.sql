create view public.v_staff_payroll
with (security_invoker = true) as
select
  u.id as user_id,
  u.full_name,
  u.fixed_salary,
  u.commission_rate,
  coalesce(sum(ii.amount), 0::numeric) as total_billed,
  round(coalesce(sum(ii.amount) * u.commission_rate / 100::numeric, 0::numeric), 2) as commission_amount,
  coalesce(u.fixed_salary, 0) + round(coalesce(sum(ii.amount) * u.commission_rate / 100::numeric, 0::numeric), 2) as total_pay
from users u
left join invoices i on i.provider_id = u.id
left join invoice_items ii on ii.invoice_id = i.id
where u.practice_id = current_practice_id()
group by u.id, u.full_name, u.fixed_salary, u.commission_rate;
