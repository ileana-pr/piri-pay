-- payee personalization: public tip page header (name + image url)
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists avatar_url text;
