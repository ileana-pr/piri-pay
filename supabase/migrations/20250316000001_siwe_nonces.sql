-- siwe nonces for replay protection (short-lived, cleaned by expiry)
create table if not exists public.siwe_nonces (
  nonce text primary key,
  address text not null,
  chain_id int not null,
  expires_at timestamptz not null
);

-- allow anonymous insert (client gets nonce) and service role delete
alter table public.siwe_nonces enable row level security;

create policy "allow insert for nonces"
  on public.siwe_nonces for insert
  with check (true);

create policy "no public read"
  on public.siwe_nonces for select
  using (false);

create policy "no public update or delete"
  on public.siwe_nonces for all
  using (false);
