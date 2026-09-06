-- Add an 'accountant' staff role with doctor-level access to financial tables only
-- (no clinical, no staff-management access).

alter table public.users drop constraint users_role_check;
alter table public.users add constraint users_role_check
  check (role = any (array['doctor','assistant','reception','accountant']));

alter policy chart_of_accounts_all_doctor on public.chart_of_accounts
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

alter policy expenses_all_doctor on public.expenses
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

alter policy invoices_all_doctor on public.invoices
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

alter policy invoice_items_all_doctor on public.invoice_items
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

alter policy journal_entries_all_doctor on public.journal_entries
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

alter policy journal_entry_lines_all_doctor on public.journal_entry_lines
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

alter policy payments_all_doctor on public.payments
  using (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']))
  with check (practice_id = current_practice_id() and "current_role"() = any (array['doctor','accountant']));

-- The double-entry posting/reversal RPCs also gate internally on role — extend them too,
-- otherwise RLS alone wouldn't let an accountant call these SECURITY DEFINER functions.
create or replace function public.post_journal_entry(p_entry_date date, p_memo text, p_source_type text, p_source_id uuid, p_lines jsonb)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_practice_id uuid;
  v_entry_id uuid;
  v_total_debit numeric := 0;
  v_total_credit numeric := 0;
  v_line jsonb;
  v_line_count int;
begin
  v_practice_id := public.current_practice_id();
  if v_practice_id is null then
    raise exception 'غير مصرح';
  end if;
  if public."current_role"() <> all (array['doctor','accountant']) then
    raise exception 'صلاحيات غير كافية';
  end if;

  select jsonb_array_length(p_lines) into v_line_count;
  if v_line_count is null or v_line_count < 2 then
    raise exception 'القيد يجب أن يحتوي على سطرين على الأقل';
  end if;

  for v_line in select * from jsonb_array_elements(p_lines) loop
    if coalesce((v_line->>'debit')::numeric,0) > 0 and coalesce((v_line->>'credit')::numeric,0) > 0 then
      raise exception 'كل سطر يجب أن يكون مديناً أو دائناً وليس الاثنين معاً';
    end if;
    v_total_debit := v_total_debit + coalesce((v_line->>'debit')::numeric,0);
    v_total_credit := v_total_credit + coalesce((v_line->>'credit')::numeric,0);
  end loop;

  if v_total_debit <> v_total_credit or v_total_debit = 0 then
    raise exception 'القيد غير متوازن: مجموع المدين (%) لا يساوي مجموع الدائن (%)', v_total_debit, v_total_credit;
  end if;

  insert into public.journal_entries (practice_id, entry_date, memo, source_type, source_id, created_by)
  values (v_practice_id, coalesce(p_entry_date, current_date), p_memo, coalesce(p_source_type,'manual'), p_source_id, auth.uid())
  returning id into v_entry_id;

  insert into public.journal_entry_lines (practice_id, journal_entry_id, account_id, debit, credit, description)
  select v_practice_id, v_entry_id, (l->>'account_id')::uuid, coalesce((l->>'debit')::numeric,0), coalesce((l->>'credit')::numeric,0), l->>'description'
  from jsonb_array_elements(p_lines) l;

  return v_entry_id;
end;
$function$;

create or replace function public.reverse_journal_entry(p_entry_id uuid)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_practice_id uuid;
  v_new_entry_id uuid;
  v_original_no text;
  v_line_count int;
begin
  v_practice_id := public.current_practice_id();
  if v_practice_id is null then
    raise exception 'غير مصرح';
  end if;
  if public."current_role"() <> all (array['doctor','accountant']) then
    raise exception 'صلاحيات غير كافية';
  end if;

  select entry_no into v_original_no
  from public.journal_entries
  where id = p_entry_id and practice_id = v_practice_id;

  if v_original_no is null then
    raise exception 'القيد غير موجود';
  end if;

  if exists (
    select 1 from public.journal_entries
    where source_type = 'reversal' and source_id = p_entry_id and practice_id = v_practice_id
  ) then
    raise exception 'هذا القيد معكوس مسبقاً';
  end if;

  select count(*) into v_line_count from public.journal_entry_lines where journal_entry_id = p_entry_id;
  if v_line_count = 0 then
    raise exception 'ما في أسطر لهذا القيد';
  end if;

  insert into public.journal_entries (practice_id, entry_date, memo, source_type, source_id, created_by)
  values (v_practice_id, current_date, 'عكس قيد ' || v_original_no, 'reversal', p_entry_id, auth.uid())
  returning id into v_new_entry_id;

  insert into public.journal_entry_lines (practice_id, journal_entry_id, account_id, debit, credit, description)
  select v_practice_id, v_new_entry_id, account_id, credit, debit, description
  from public.journal_entry_lines
  where journal_entry_id = p_entry_id;

  return v_new_entry_id;
end;
$function$;
