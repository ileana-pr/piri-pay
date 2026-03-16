-- allow service/backend to select nonces (RLS was blocking; service_role should bypass but adding explicit policy)
drop policy if exists "no public read" on public.siwe_nonces;
create policy "allow select for nonces"
  on public.siwe_nonces for select
  using (true);
