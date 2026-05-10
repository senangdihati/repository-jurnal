-- ScholarLite: profiles, papers, storage bucket "pdfs", and RLS.
-- Apply in Supabase: SQL Editor → New query → paste → Run.
-- Or use CLI: supabase db push (when linked to your project).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  university text
);

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  abstract text,
  file_url text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists papers_author_id_idx on public.papers (author_id);
create index if not exists papers_created_at_idx on public.papers (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: profiles
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- Anyone can read profiles (needed to show author on public catalog / detail).
drop policy if exists "Profiles are selectable by everyone" on public.profiles;
create policy "Profiles are selectable by everyone"
  on public.profiles
  for select
  to public
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Row Level Security: papers
-- ---------------------------------------------------------------------------

alter table public.papers enable row level security;

-- Public catalog: all rows readable (including anon) for Beranda / detail.
drop policy if exists "Papers are selectable by everyone" on public.papers;
create policy "Papers are selectable by everyone"
  on public.papers
  for select
  to public
  using (true);

drop policy if exists "Users can insert own papers" on public.papers;
create policy "Users can insert own papers"
  on public.papers
  for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Users can update own papers" on public.papers;
create policy "Users can update own papers"
  on public.papers
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Users can delete own papers" on public.papers;
create policy "Users can delete own papers"
  on public.papers
  for delete
  to authenticated
  using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- Auth: auto-create profile row (papers.author_id → profiles.id)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, university)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'university', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage: bucket "pdfs" (public URLs for iframe / links)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pdfs',
  'pdfs',
  true,
  52428800, -- 50 MB; adjust in Dashboard if needed
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS policies (objects live in storage.objects)
drop policy if exists "Public read pdfs" on storage.objects;
create policy "Public read pdfs"
  on storage.objects
  for select
  to public
  using (bucket_id = 'pdfs');

-- Path convention from the app: {user_id}/{paper_id}.pdf
drop policy if exists "Users can upload pdfs to own folder" on storage.objects;
create policy "Users can upload pdfs to own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pdfs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can update own pdfs" on storage.objects;
create policy "Users can update own pdfs"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'pdfs'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'pdfs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can delete own pdfs" on storage.objects;
create policy "Users can delete own pdfs"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pdfs'
    and split_part(name, '/', 1) = auth.uid()::text
  );
