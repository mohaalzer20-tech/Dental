-- Cross-tenant RLS isolation proof.
-- Impersonates a real doctor from Tenant A (via request.jwt.claims + SET LOCAL ROLE authenticated,
-- the standard way to exercise RLS policies exactly as PostgREST/Supabase would) and, for every
-- tenant-owned table, counts (a) how many rows are visible at all, and (b) how many of those
-- visible rows actually belong to Tenant B. (b) must be 0 on every table for isolation to hold.
-- Read-only — no data is inserted, updated, or deleted. Safe to re-run anytime.
--
-- Usage: pass real tenant_a_user / tenant_b_practice values from your own project, e.g.:
--   select id as tenant_a_user, practice_id from users where role='doctor' limit 1;
--   select id as tenant_b_practice from practices where id <> '<tenant_a_practice>' limit 1;

select set_config(
  'request.jwt.claims',
  json_build_object('sub', '__TENANT_A_USER__', 'role', 'authenticated')::text,
  true
);
set local role authenticated;

select 'appointment_types' as tbl, count(*) as visible, count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') as leaked_from_tenant_b from public.appointment_types
union all select 'appointment_waitlist', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.appointment_waitlist
union all select 'appointments', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.appointments
union all select 'audit_log', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.audit_log
union all select 'cash_reconciliations', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.cash_reconciliations
union all select 'chart_of_accounts', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.chart_of_accounts
union all select 'communication_templates', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.communication_templates
union all select 'dental_chart_entries', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.dental_chart_entries
union all select 'expenses', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.expenses
union all select 'inventory_batches', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.inventory_batches
union all select 'inventory_categories', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.inventory_categories
union all select 'inventory_items', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.inventory_items
union all select 'invoice_installments', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.invoice_installments
union all select 'invoice_items', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.invoice_items
union all select 'invoices', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.invoices
union all select 'journal_entries', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.journal_entries
union all select 'journal_entry_lines', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.journal_entry_lines
union all select 'lab_orders', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.lab_orders
union all select 'lab_vendors', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.lab_vendors
union all select 'loyalty_transactions', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.loyalty_transactions
union all select 'message_log', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.message_log
union all select 'patient_images', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.patient_images
union all select 'patients', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.patients
union all select 'payments', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.payments
union all select 'perio_charts', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.perio_charts
union all select 'prescription_items', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.prescription_items
union all select 'prescriptions', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.prescriptions
union all select 'procedures', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.procedures
union all select 'purchase_order_items', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.purchase_order_items
union all select 'purchase_orders', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.purchase_orders
union all select 'staff_attendance', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.staff_attendance
union all select 'staff_shifts', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.staff_shifts
union all select 'stock_transactions', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.stock_transactions
union all select 'suppliers', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.suppliers
union all select 'treatment_plan_items', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.treatment_plan_items
union all select 'treatment_plans', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.treatment_plans
union all select 'treatments', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.treatments
union all select 'users', count(*), count(*) filter (where practice_id = '__TENANT_B_PRACTICE__') from public.users
order by tbl;
