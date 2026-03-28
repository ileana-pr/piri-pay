-- public bucket for payee avatars; writes go through api (service role) only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  524288,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do nothing;

-- anyone can read (tip page + img tags need a stable url)
drop policy if exists "profile avatars public read" on storage.objects;
create policy "profile avatars public read"
  on storage.objects for select
  to public
  using (bucket_id = 'profile-avatars');
