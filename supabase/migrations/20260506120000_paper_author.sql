-- Publication author line (bibliographic); distinct from papers.author_id (uploader).
alter table public.papers
  add column if not exists paper_author text;
