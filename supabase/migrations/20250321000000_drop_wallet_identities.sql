-- drop wallet_identities — profiles.owner_address is now the source of truth for wallet sign-in
-- profiles are created at sign-in with owner_address; no separate identity table needed

drop policy if exists "users can insert own wallet identities" on public.wallet_identities;
drop policy if exists "users can read own wallet identities" on public.wallet_identities;
drop table if exists public.wallet_identities;
