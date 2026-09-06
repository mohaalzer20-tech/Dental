create table public.invoice_installments (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id),
  invoice_id uuid not null references public.invoices(id),
  due_date date not null,
  amount numeric not null check (amount > 0),
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.invoice_installments enable row level security;

create policy invoice_installments_all_finance on public.invoice_installments
  for all
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

create trigger trg_10_invoice_installments_stamp_practice_id before insert on public.invoice_installments
  for each row execute function stamp_practice_id();

create trigger audit_invoice_installments after insert or delete or update on public.invoice_installments
  for each row execute function log_audit();

create table public.cash_reconciliations (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id),
  work_date date not null default current_date,
  expected_amount numeric not null default 0,
  actual_amount numeric,
  variance numeric generated always as (coalesce(actual_amount, 0) - expected_amount) stored,
  notes text,
  reconciled_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  unique (practice_id, work_date)
);

alter table public.cash_reconciliations enable row level security;

create policy cash_reconciliations_all_finance on public.cash_reconciliations
  for all
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

create trigger trg_10_cash_reconciliations_stamp_practice_id before insert on public.cash_reconciliations
  for each row execute function stamp_practice_id();

create trigger audit_cash_reconciliations after insert or delete or update on public.cash_reconciliations
  for each row execute function log_audit();
