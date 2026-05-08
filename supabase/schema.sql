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

create policy "Products are public" on public.products for select using (true);
create policy "Categories are public" on public.categories for select using (true);
create policy "Reviews are public" on public.reviews for select using (true);

create policy "Users read own profile" on public.users for select using (auth.uid() = id);
create policy "Users insert own customer profile" on public.users for insert with check (auth.uid() = id and role = 'customer');
create policy "Wishlist own rows" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Orders own rows" on public.orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
