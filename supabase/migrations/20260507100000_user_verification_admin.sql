-- User verification (admin approves registrations) + admin role.
-- After apply: promote at least one user, e.g.
--   update public.profiles set role = 'admin', verification_status = 'approved' where email = 'you@example.com';

alter table public.profiles
  add column if not exists email text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists verification_status text not null default 'pending',
  add column if not exists role text not null default 'user';

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and (p.email is null or p.email = '');

-- Existing accounts stay usable; new signups after this migration remain pending until approved
update public.profiles
set verification_status = 'approved'
where verification_status = 'pending';

alter table public.profiles drop constraint if exists profiles_verification_status_check;
alter table public.profiles
  add constraint profiles_verification_status_check
  check (verification_status in ('pending', 'approved', 'rejected'));

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, university, email)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'university', '')), ''),
    nullif(trim(coalesce(new.email, '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Non-admins cannot change their own role or verification_status.
create or replace function public.profiles_guard_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  select p.role = 'admin' and p.verification_status = 'approved'
  into is_admin
  from public.profiles p
  where p.id = auth.uid();

  if coalesce(is_admin, false) then
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status
     or new.role is distinct from old.role then
    new.verification_status := old.verification_status;
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_verification_trigger on public.profiles;
create trigger profiles_guard_verification_trigger
  before update on public.profiles
  for each row
  execute function public.profiles_guard_verification();

drop policy if exists "Admins can manage all profiles" on public.profiles;
create policy "Admins can manage all profiles"
  on public.profiles
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles a
      where a.id = auth.uid()
        and a.role = 'admin'
        and a.verification_status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.profiles a
      where a.id = auth.uid()
        and a.role = 'admin'
        and a.verification_status = 'approved'
    )
  );
