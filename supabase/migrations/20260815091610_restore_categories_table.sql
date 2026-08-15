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

alter table public.categories enable row level security;

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public"
on public.categories
for select
using (true);

notify pgrst, 'reload schema';
