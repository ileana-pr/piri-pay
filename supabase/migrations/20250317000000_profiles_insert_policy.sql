-- allow inserts into profiles (API creates profiles via serverless function)
-- service role bypasses RLS, but this policy covers anon/other contexts if needed
create policy "profiles allow insert"
  on public.profiles for insert
  with check (true);

create policy "profiles allow update"
  on public.profiles for update
  using (true)
  with check (true);
