create table if not exists public.delivery_rates (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  country_name text not null,
  state_name text,
  standard_fee numeric(10, 2) not null default 0 check (standard_fee >= 0),
  express_fee numeric(10, 2) not null default 0 check (express_fee >= 0),
  currency text not null default 'NGN' check (currency in ('NGN', 'USD')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists delivery_rates_location_key
on public.delivery_rates (
  lower(country_code),
  lower(coalesce(state_name, ''))
);

alter table public.delivery_rates enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.delivery_rates to anon;
grant select, insert, update, delete on table public.delivery_rates to authenticated;
grant select, insert, update, delete on table public.delivery_rates to service_role;

drop policy if exists "Active delivery rates are public" on public.delivery_rates;
drop policy if exists "Admins can manage delivery rates" on public.delivery_rates;

create policy "Active delivery rates are public"
on public.delivery_rates
for select
using (is_active = true);

create policy "Admins can manage delivery rates"
on public.delivery_rates
for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.set_delivery_rates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_delivery_rates_updated_at on public.delivery_rates;

create trigger set_delivery_rates_updated_at
before update on public.delivery_rates
for each row execute function public.set_delivery_rates_updated_at();

notify pgrst, 'reload schema';
