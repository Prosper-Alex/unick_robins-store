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

  if target_order.status = 'cancelled' or target_order.payment_status = 'cancelled_by_customer' then
    raise exception 'Payment arrived after customer cancellation for order %', target_order.id;
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

  insert into public.order_events (order_id, type, audience, payload)
  values
    (
      target_order.id,
      'customer_receipt_pending',
      'customer',
      jsonb_build_object(
        'email', target_order.customer_email,
        'name', target_order.customer_name,
        'total', target_order.total,
        'currency', target_order.pricing_currency
      )
    ),
    (
      target_order.id,
      'admin_new_order',
      'admin',
      jsonb_build_object(
        'customer_name', target_order.customer_name,
        'customer_email', target_order.customer_email,
        'total', target_order.total,
        'currency', target_order.pricing_currency,
        'delivery_method', target_order.delivery_method
      )
    )
  on conflict (order_id, type) do nothing;

  return target_order.id;
end;
$$;

revoke all on function public.confirm_paid_order(text) from public;
grant execute on function public.confirm_paid_order(text) to service_role;
