insert into public.categories (name, slug)
values
  ('Hair Sprays', 'hair-sprays'),
  ('Hair Oil', 'hair-oil'),
  ('Hair Serum', 'hair-serum'),
  ('Hair Mist', 'hair-mist'),
  ('Leave-In Care', 'leave-in-care'),
  ('Caps', 'caps'),
  ('Hair Net', 'hair-net'),
  ('Hair Bands', 'hair-bands'),
  ('Hoodies', 'hoodies'),
  ('Hair Wax', 'hair-wax'),
  ('Edge Care', 'edge-care'),
  ('Curl Cream', 'curl-cream')
on conflict (slug) do update set name = excluded.name;

notify pgrst, 'reload schema';
