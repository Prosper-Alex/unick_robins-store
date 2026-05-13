create table if not exists public.newsletter_subscribers (
  email text primary key,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Admins can read newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Admins can update newsletter subscribers" on public.newsletter_subscribers;

create policy "Anyone can subscribe to newsletter"
on public.newsletter_subscribers
for insert
with check (status = 'subscribed');

create policy "Admins can read newsletter subscribers"
on public.newsletter_subscribers
for select
using (public.is_admin());

create policy "Admins can update newsletter subscribers"
on public.newsletter_subscribers
for update
using (public.is_admin())
with check (public.is_admin());
