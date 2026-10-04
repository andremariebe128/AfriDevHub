-- AfriDevHub v4 : couvertures et notes des projets (étoiles)
alter table public.projects add column if not exists cover_url text;
create table if not exists public.project_ratings (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  primary key (project_id, user_id)
);
alter table public.project_ratings enable row level security;
create policy "notes lisibles par tous" on public.project_ratings for select using (true);
create policy "noter en son nom" on public.project_ratings for insert to authenticated with check (user_id = auth.uid());
create policy "modifier sa note" on public.project_ratings for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
