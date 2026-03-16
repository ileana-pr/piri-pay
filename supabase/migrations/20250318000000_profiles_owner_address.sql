-- owner_address: wallet that owns this account (for wallet sign-in lookup)
-- separate from payment methods (ethereum_address, etc.) — multiple accounts can share deposit addresses
alter table public.profiles
  add column if not exists owner_address text;

create index if not exists idx_profiles_owner_address on public.profiles(owner_address);

-- backfill: wallet-created profiles (no user_id) used ethereum_address as their wallet
update public.profiles
  set owner_address = ethereum_address
  where owner_address is null and user_id is null and ethereum_address is not null;
