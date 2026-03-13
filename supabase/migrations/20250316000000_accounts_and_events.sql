-- accounts, wallet ownership, and payment events
-- builds on existing profiles; user_id nullable for migration

-- add user_id to profiles (nullable for existing rows)
alter table public.profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.profiles
  add column if not exists updated_at timestamptz default now();

-- trigger: bump updated_at on profile change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- wallet_identities: proven ownership via signing (one owner per address)
create table if not exists public.wallet_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chain text not null, -- 'ethereum' | 'base' | 'solana'
  address text not null,
  created_at timestamptz default now(),
  unique(chain, address)
);

create index idx_wallet_identities_user_id on public.wallet_identities(user_id);
create index idx_wallet_identities_chain_address on public.wallet_identities(chain, address);

-- payment_events: crypto txs + fiat intent
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  type text not null, -- 'crypto_incoming' | 'fiat_click'
  method text, -- 'ethereum' | 'base' | 'solana' | 'bitcoin' | 'venmo' | 'cashapp' | 'paypal' | 'zelle'
  chain text,
  from_address text,
  to_address text,
  tx_hash text,
  amount text,
  token_symbol text,
  token_address text,
  amount_typed text,
  created_at timestamptz default now()
);

-- dedup: one event per tx_hash (null tx_hash allowed for fiat_click)
create unique index idx_payment_events_tx_hash_unique
  on public.payment_events(tx_hash) where tx_hash is not null;

create index idx_payment_events_profile_id on public.payment_events(profile_id);
create index idx_payment_events_created_at on public.payment_events(created_at desc);
create index idx_payment_events_type on public.payment_events(type);

-- RLS for wallet_identities
alter table public.wallet_identities enable row level security;

create policy "users can read own wallet identities"
  on public.wallet_identities for select
  using (auth.uid() = user_id);

create policy "users can insert own wallet identities"
  on public.wallet_identities for insert
  with check (auth.uid() = user_id);

-- RLS for payment_events
alter table public.payment_events enable row level security;

create policy "anyone can insert payment events"
  on public.payment_events for insert
  with check (true);

create policy "users can read events for own profiles"
  on public.payment_events for select
  using (
    profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

-- RLS: profiles — owner can update/delete
create policy "users can update own profiles"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can insert own profiles"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "users can delete own profiles"
  on public.profiles for delete
  using (auth.uid() = user_id);
