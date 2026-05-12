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

create unique index if not exists orders_payment_reference_key
on public.orders(payment_reference)
where payment_reference is not null;

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
