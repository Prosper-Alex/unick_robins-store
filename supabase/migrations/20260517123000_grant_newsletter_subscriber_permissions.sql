grant usage on schema public to anon, authenticated, service_role;

grant insert on table public.newsletter_subscribers to anon, authenticated;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;
