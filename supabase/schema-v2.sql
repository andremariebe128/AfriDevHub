-- AfriDevHub v2 : espaces, opportunités, mentors (une seule table, filtrée par `section`)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('space','opportunity','mentor')),
  kind text not null,
  title text not null check (char_length(title) between 3 and 140),
  meta text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists listings_section_idx on public.listings (section, created_at desc);
alter table public.listings enable row level security;
create policy "listings lisibles par tous" on public.listings for select using (true);
create policy "listings créées par un membre" on public.listings for insert to authenticated
  with check (author_id = auth.uid() and section in ('opportunity','mentor'));
create policy "listings modifiables par leur auteur" on public.listings for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "listings supprimables par leur auteur" on public.listings for delete to authenticated
  using (author_id = auth.uid());
