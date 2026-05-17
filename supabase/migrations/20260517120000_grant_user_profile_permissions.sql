grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on table public.users to authenticated;
grant select, insert, update, delete on table public.users to service_role;

grant select on table public.admin_whitelist to service_role;
