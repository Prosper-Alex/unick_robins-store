alter table public.reviews add column if not exists title text;
alter table public.reviews add column if not exists verified_purchase boolean not null default false;
alter table public.reviews add column if not exists status text not null default 'published';

alter table public.reviews
  drop constraint if exists reviews_status_check;

alter table public.reviews
  add constraint reviews_status_check
  check (status in ('published', 'hidden'));

drop index if exists public.reviews_product_user_key;

with ranked_reviews as (
  select
    id,
    row_number() over (
      partition by product_id, user_id
      order by created_at desc, id desc
    ) as review_rank
  from public.reviews
  where user_id is not null
)
delete from public.reviews
using ranked_reviews
where public.reviews.id = ranked_reviews.id
and ranked_reviews.review_rank > 1;

create unique index if not exists reviews_product_user_key
on public.reviews(product_id, user_id);

drop policy if exists "Reviews are public" on public.reviews;
drop policy if exists "Users can create reviews" on public.reviews;
drop policy if exists "Users can update own reviews" on public.reviews;
drop policy if exists "Users can delete own reviews" on public.reviews;

create policy "Reviews are public"
on public.reviews
for select
using (status = 'published');

create policy "Users can create reviews"
on public.reviews
for insert
with check (auth.uid() = user_id and status = 'published' and verified_purchase = false);

create policy "Users can update own reviews"
on public.reviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id and status = 'published' and verified_purchase = false);

create policy "Users can delete own reviews"
on public.reviews
for delete
using (auth.uid() = user_id);

notify pgrst, 'reload schema';
