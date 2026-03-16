-- email: portable identity for email/google users (for migration away from supabase)
alter table public.profiles
  add column if not exists email text;

-- backfill: copy email from auth.users for existing profiles
update public.profiles p
  set email = u.email
  from auth.users u
  where p.user_id = u.id and (p.email is null or p.email = '') and u.email is not null;
