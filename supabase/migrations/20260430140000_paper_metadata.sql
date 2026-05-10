-- Optional metadata for ScholarHub UI (keywords, DOI, status, analytics).
-- Safe to run after 20260430120000_scholar_lite.sql

alter table public.papers
  add column if not exists paper_author text,
  add column if not exists keywords text,
  add column if not exists doi text,
  add column if not exists status text not null default 'published',
  add column if not exists view_count integer not null default 0,
  add column if not exists download_count integer not null default 0;

alter table public.papers drop constraint if exists papers_status_check;
alter table public.papers
  add constraint papers_status_check check (status in ('published', 'draft'));
