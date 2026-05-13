alter table public.products add column if not exists base_currency text not null default 'NGN';
alter table public.products add column if not exists price_ngn numeric(10, 2);
alter table public.products add column if not exists price_usd numeric(10, 2);

alter table public.products
  drop constraint if exists products_base_currency_check;

alter table public.products
  add constraint products_base_currency_check
  check (base_currency in ('NGN', 'USD'));

update public.products
set
  base_currency = coalesce(base_currency, 'NGN'),
  price_ngn = coalesce(price_ngn, case when base_currency = 'NGN' then price else null end),
  price_usd = coalesce(price_usd, case when base_currency = 'USD' then price else null end);

alter table public.orders add column if not exists pricing_currency text;
alter table public.orders add column if not exists pricing_country text;

alter table public.orders
  drop constraint if exists orders_pricing_currency_check;

alter table public.orders
  add constraint orders_pricing_currency_check
  check (pricing_currency is null or pricing_currency in ('NGN', 'USD'));

notify pgrst, 'reload schema';
