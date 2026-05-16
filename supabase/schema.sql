create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug)
values
  ('Hair Oil', 'hair-oil'),
  ('Hair Serum', 'hair-serum'),
  ('Hair Sprays', 'hair-sprays'),
  ('Hair Net', 'hair-net'),
  ('Hair Bands', 'hair-bands'),
  ('Caps', 'caps'),
  ('Hoodies', 'hoodies'),
  ('Hair Wax', 'hair-wax'),
  ('Edge Care', 'edge-care'),
  ('Leave-In Care', 'leave-in-care'),
  ('Curl Cream', 'curl-cream'),
  ('Hair Mist', 'hair-mist')
on conflict (slug) do update set name = excluded.name;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  short_description text,
  price numeric(10, 2) not null,
  base_currency text not null default 'NGN' check (base_currency in ('NGN', 'USD')),
  price_ngn numeric(10, 2),
  price_usd numeric(10, 2),
  image text not null,
  gallery text[] default '{}',
  category text not null,
  stock integer not null default 0,
  hydration_level integer default 4 check (hydration_level between 1 and 5),
  transfer_ready boolean not null default true,
  complimentary_shipping boolean not null default false,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  ingredients text[] default '{}',
  benefits text[] default '{}',
  usage_instructions text[] default '{}',
  hair_compatibility text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  status text not null default 'draft',
  payment_status text not null default 'unpaid',
  payment_provider text,
  payment_reference text unique,
  paid_at timestamptz,
  customer_email text,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  delivery_method text,
  shipping_fee numeric(10, 2) not null default 0,
  pricing_currency text check (pricing_currency is null or pricing_currency in ('NGN', 'USD')),
  pricing_country text,
  tracking_number text,
  total numeric(10, 2) not null default 0,
  items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists shipping_address jsonb;
alter table public.orders add column if not exists delivery_method text;
alter table public.orders add column if not exists shipping_fee numeric(10, 2) not null default 0;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists pricing_currency text;
alter table public.orders add column if not exists pricing_country text;
alter table public.orders drop constraint if exists orders_pricing_currency_check;
alter table public.orders add constraint orders_pricing_currency_check check (pricing_currency is null or pricing_currency in ('NGN', 'USD'));

create unique index if not exists orders_payment_reference_key on public.orders(payment_reference) where payment_reference is not null;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  title text,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  verified_purchase boolean not null default false,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

alter table public.reviews add column if not exists title text;
alter table public.reviews add column if not exists verified_purchase boolean not null default false;
alter table public.reviews add column if not exists status text not null default 'published';
drop index if exists public.reviews_product_user_key;
create unique index reviews_product_user_key on public.reviews(product_id, user_id);

alter table public.products alter column rating set default 0;
alter table public.products alter column review_count set default 0;
alter table public.products add column if not exists base_currency text not null default 'NGN';
alter table public.products add column if not exists price_ngn numeric(10, 2);
alter table public.products add column if not exists price_usd numeric(10, 2);
alter table public.products drop constraint if exists products_base_currency_check;
alter table public.products add constraint products_base_currency_check check (base_currency in ('NGN', 'USD'));

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.newsletter_subscribers (
  email text primary key,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Products are public" on public.products;
drop policy if exists "Categories are public" on public.categories;
drop policy if exists "Reviews are public" on public.reviews;
drop policy if exists "Users can create reviews" on public.reviews;
drop policy if exists "Users can update own reviews" on public.reviews;
drop policy if exists "Users can delete own reviews" on public.reviews;
drop policy if exists "Users read own profile" on public.users;
drop policy if exists "Users insert own customer profile" on public.users;
drop policy if exists "Admins can read users" on public.users;
drop policy if exists "Admins can update users" on public.users;
drop policy if exists "Wishlist own rows" on public.wishlist;
drop policy if exists "Orders own rows" on public.orders;
drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Admins can read newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Admins can update newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Product images are public" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Products are public" on public.products for select using (true);
create policy "Categories are public" on public.categories for select using (true);
create policy "Reviews are public" on public.reviews for select using (status = 'published');
create policy "Users can create reviews" on public.reviews for insert
with check (auth.uid() = user_id and status = 'published' and verified_purchase = false);
create policy "Users can update own reviews" on public.reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id and status = 'published' and verified_purchase = false);
create policy "Users can delete own reviews" on public.reviews for delete
using (auth.uid() = user_id);

create or replace function public.refresh_product_review_stats(target_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 1)
      from public.reviews
      where product_id = target_product_id
      and status = 'published'
    ), 0),
    review_count = (
      select count(*)
      from public.reviews
      where product_id = target_product_id
      and status = 'published'
    )
  where id = target_product_id;
end;
$$;

create or replace function public.handle_review_stats_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_product_review_stats(old.product_id);
    return old;
  end if;

  perform public.refresh_product_review_stats(new.product_id);

  if tg_op = 'UPDATE' and old.product_id <> new.product_id then
    perform public.refresh_product_review_stats(old.product_id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_review_stats_changed on public.reviews;

create trigger on_review_stats_changed
after insert or update or delete on public.reviews
for each row execute function public.handle_review_stats_change();

create policy "Users read own profile" on public.users for select using (auth.uid() = id);
create policy "Users insert own customer profile" on public.users for insert with check (auth.uid() = id and role = 'customer');
create policy "Wishlist own rows" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Orders own rows" on public.orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers for insert with check (status = 'subscribed');

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create policy "Admins can read users" on public.users for select
using (public.is_admin());

create policy "Admins can update users" on public.users for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can read newsletter subscribers" on public.newsletter_subscribers for select
using (public.is_admin());

create policy "Admins can update newsletter subscribers" on public.newsletter_subscribers for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can read orders" on public.orders for select
using (public.is_admin());

create policy "Admins can update orders" on public.orders for update
using (public.is_admin())
with check (public.is_admin());

create or replace function public.confirm_paid_order(target_reference text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  order_item jsonb;
  item_id uuid;
  item_quantity integer;
begin
  select *
  into target_order
  from public.orders
  where payment_reference = target_reference
  for update;

  if not found then
    raise exception 'Order not found for payment reference %', target_reference;
  end if;

  if target_order.payment_status = 'paid' then
    return target_order.id;
  end if;

  for order_item in select * from jsonb_array_elements(target_order.items)
  loop
    item_id := (order_item->>'id')::uuid;
    item_quantity := greatest(coalesce((order_item->>'quantity')::integer, 1), 1);

    update public.products
    set stock = stock - item_quantity
    where id = item_id
      and stock >= item_quantity;

    if not found then
      raise exception 'Insufficient stock for product %', item_id;
    end if;
  end loop;

  update public.orders
  set
    status = 'paid',
    payment_status = 'paid',
    paid_at = coalesce(paid_at, now())
  where id = target_order.id;

  return target_order.id;
end;
$$;

revoke all on function public.confirm_paid_order(text) from public;
grant execute on function public.confirm_paid_order(text) to service_role;

create policy "Admins can insert products" on public.products for insert
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Admins can update products" on public.products for update
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Admins can delete products" on public.products for delete
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Product images are public" on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admins can upload product images" on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Admins can update product images" on storage.objects for update
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Admins can delete product images" on storage.objects for delete
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create table if not exists public.admin_whitelist (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Note: Insert your desired admin emails into the public.admin_whitelist table.
-- e.g., insert into public.admin_whitelist (email) values ('admin@unickrobins.com');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_whitelisted boolean;
  assigned_role text;
begin
  -- Check if the new user's email exists in our whitelist table
  select exists(
    select 1 from public.admin_whitelist where lower(email) = lower(new.email)
  ) into is_whitelisted;

  if is_whitelisted then
    assigned_role := 'admin';
  else
    assigned_role := 'customer';
  end if;

  insert into public.users (id, email, role)
  values (new.id, new.email, assigned_role)
  on conflict (id) do update
  set email = excluded.email,
      role = case when is_whitelisted then 'admin' else public.users.role end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "Admins can view audit logs" on public.audit_logs;
drop policy if exists "Admins can insert audit logs" on public.audit_logs;

create policy "Admins can view audit logs" on public.audit_logs for select
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Admins can insert audit logs" on public.audit_logs for insert
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);
