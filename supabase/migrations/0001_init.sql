create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.journal_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  page_date date not null,
  caption text,
  visibility text not null check (visibility in ('private','public','unlisted')) default 'private',
  image_path text not null,
  created_at timestamptz default now()
);

create index if not exists idx_journal_pages_user_date on public.journal_pages(user_id, page_date desc);

create table if not exists public.page_items (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.journal_pages(id) on delete cascade,
  x numeric not null check (x >= 0 and x <= 1),
  y numeric not null check (y >= 0 and y <= 1),
  label text not null,
  note text,
  category text,
  source_date date,
  source_location text,
  created_at timestamptz default now()
);

create index if not exists idx_page_items_page on public.page_items(page_id);

alter table public.profiles enable row level security;
alter table public.journal_pages enable row level security;
alter table public.page_items enable row level security;

create policy "Profiles are readable by all" on public.profiles for select using (true);
create policy "Users can insert their profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id);

create policy "Owners manage their pages" on public.journal_pages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public and unlisted readable" on public.journal_pages for select
  using (visibility in ('public','unlisted'));

create policy "Owners manage items" on public.page_items for all
  using (auth.uid() = (select user_id from public.journal_pages jp where jp.id = page_id))
  with check (auth.uid() = (select user_id from public.journal_pages jp where jp.id = page_id));

create policy "Read items on public pages" on public.page_items for select
  using (
    exists (
      select 1 from public.journal_pages jp
      where jp.id = page_id and jp.visibility in ('public','unlisted')
    )
  );

do $$
begin
  if not exists (select 1 from storage.buckets where id = 'journal-pages') then
    perform storage.create_bucket('journal-pages', public := true);
  end if;
end $$;

create policy "Public read journal pages objects" on storage.objects for select
  using (bucket_id = 'journal-pages');

create policy "Authenticated upload journal pages" on storage.objects for insert
  with check (bucket_id = 'journal-pages' and auth.role() = 'authenticated');

create policy "Owners update journal pages objects" on storage.objects for update
  using (bucket_id = 'journal-pages' and auth.uid() = owner)
  with check (bucket_id = 'journal-pages');

create policy "Owners delete journal pages objects" on storage.objects for delete
  using (bucket_id = 'journal-pages' and auth.uid() = owner);
