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

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  short_description text,
  price numeric(10, 2) not null,
  image text not null,
  gallery text[] default '{}',
  category text not null,
  stock integer not null default 0,
  hydration_level integer default 4 check (hydration_level between 1 and 5),
  transfer_ready boolean not null default true,
  complimentary_shipping boolean not null default false,
  rating numeric(2, 1) not null default 4.8,
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
  total numeric(10, 2) not null default 0,
  items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;

drop policy if exists "Products are public" on public.products;
drop policy if exists "Categories are public" on public.categories;
drop policy if exists "Reviews are public" on public.reviews;
drop policy if exists "Users read own profile" on public.users;
drop policy if exists "Users insert own customer profile" on public.users;
drop policy if exists "Wishlist own rows" on public.wishlist;
drop policy if exists "Orders own rows" on public.orders;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
drop policy if exists "Product images are public" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Products are public" on public.products for select using (true);
create policy "Categories are public" on public.categories for select using (true);
create policy "Reviews are public" on public.reviews for select using (true);

create policy "Users read own profile" on public.users for select using (auth.uid() = id);
create policy "Users insert own customer profile" on public.users for insert with check (auth.uid() = id and role = 'customer');
create policy "Wishlist own rows" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Orders own rows" on public.orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
    select 1 from public.admin_whitelist where email = new.email
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
