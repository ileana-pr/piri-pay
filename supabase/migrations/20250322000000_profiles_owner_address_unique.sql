-- owner_address must be unique — one wallet = one profile (prevents duplicate users)
-- step 1: remove duplicates — keep oldest profile per owner_address, delete the rest
delete from public.profiles
where id in (
  select p.id from public.profiles p
  join (
    select lower(owner_address) as addr,
      (array_agg(id order by created_at asc nulls last))[1] as keep_id
    from public.profiles
    where owner_address is not null and owner_address != ''
    group by lower(owner_address)
    having count(*) > 1
  ) dups on lower(p.owner_address) = dups.addr and p.id != dups.keep_id
);
-- step 2: partial unique index — only when owner_address is set (email/google users have null)
create unique index if not exists idx_profiles_owner_address_unique
  on public.profiles (lower(owner_address))
  where owner_address is not null and owner_address != '';
