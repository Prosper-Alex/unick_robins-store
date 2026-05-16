create or replace function public.is_user_email_confirmed(target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = auth, public
as $$
  select exists (
    select 1
    from auth.users
    where id = target_user_id
    and email_confirmed_at is not null
  );
$$;

revoke all on function public.is_user_email_confirmed(uuid) from public;
grant execute on function public.is_user_email_confirmed(uuid) to authenticated;
grant execute on function public.is_user_email_confirmed(uuid) to service_role;

create or replace function public.is_email_confirmed(target_email text)
returns boolean
language sql
security definer
set search_path = auth, public
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(target_email)
    and email_confirmed_at is not null
  );
$$;

revoke all on function public.is_email_confirmed(text) from public;
grant execute on function public.is_email_confirmed(text) to service_role;
