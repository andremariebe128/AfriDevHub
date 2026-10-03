-- =====================================================
-- AfriDevHub - Schéma Supabase (MVP)
-- À exécuter dans Supabase > SQL Editor
-- =====================================================
create extension if not exists pgcrypto;

-- ---------- Tables ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text,
  country text,
  bio text,
  stack text[] not null default '{}',
  github_url text,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 10 and 150),
  body text not null check (char_length(body) >= 20),
  tags text[] not null default '{}',
  accepted_answer_id uuid,
  created_at timestamptz not null default now()
);
create index questions_tags_idx on public.questions using gin (tags);
create index questions_created_idx on public.questions (created_at desc);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) >= 5),
  score int not null default 0,
  created_at timestamptz not null default now()
);
create index answers_question_idx on public.answers (question_id);

alter table public.questions
  add constraint questions_accepted_answer_fk
  foreign key (accepted_answer_id) references public.answers(id) on delete set null;

create table public.answer_votes (
  answer_id uuid not null references public.answers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (answer_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text,
  url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index projects_created_idx on public.projects (created_at desc);

-- ---------- Triggers ----------
-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  uname text;
begin
  uname := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''),
                    'dev_' || substr(new.id::text, 1, 8));
  begin
    insert into public.profiles (id, username) values (new.id, uname);
  exception when unique_violation then
    insert into public.profiles (id, username)
    values (new.id, uname || '_' || substr(new.id::text, 1, 4));
  end;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recalcul du score d'une réponse à chaque vote
create or replace function public.refresh_answer_score()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target uuid;
begin
  if tg_op = 'DELETE' then target := old.answer_id; else target := new.answer_id; end if;
  update public.answers
     set score = coalesce((select sum(value) from public.answer_votes where answer_id = target), 0)
   where id = target;
  return null;
end $$;

create trigger answer_votes_score
  after insert or update or delete on public.answer_votes
  for each row execute function public.refresh_answer_score();

-- La réponse acceptée doit appartenir à la question
create or replace function public.check_accepted_answer()
returns trigger language plpgsql as $$
begin
  if new.accepted_answer_id is not null and not exists (
    select 1 from public.answers where id = new.accepted_answer_id and question_id = new.id
  ) then
    raise exception 'La réponse acceptée doit appartenir à cette question';
  end if;
  return new;
end $$;

create trigger questions_check_accepted
  before update on public.questions
  for each row execute function public.check_accepted_answer();

-- ---------- Row Level Security ----------
alter table public.profiles     enable row level security;
alter table public.questions    enable row level security;
alter table public.answers      enable row level security;
alter table public.answer_votes enable row level security;
alter table public.projects     enable row level security;

-- Lecture publique (utile pour un futur site web indexable)
create policy "profiles_read"  on public.profiles  for select using (true);
create policy "questions_read" on public.questions for select using (true);
create policy "answers_read"   on public.answers   for select using (true);
create policy "projects_read"  on public.projects  for select using (true);

-- Profils
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Questions
create policy "questions_insert_own" on public.questions for insert with check (auth.uid() = author_id);
create policy "questions_update_own" on public.questions for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "questions_delete_own" on public.questions for delete using (auth.uid() = author_id);

-- Réponses
create policy "answers_insert_own" on public.answers for insert with check (auth.uid() = author_id);
create policy "answers_update_own" on public.answers for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "answers_delete_own" on public.answers for delete using (auth.uid() = author_id);

-- Votes (chacun ne voit et ne gère que les siens)
create policy "votes_read_own"   on public.answer_votes for select using (auth.uid() = user_id);
create policy "votes_insert_own" on public.answer_votes for insert with check (auth.uid() = user_id);
create policy "votes_update_own" on public.answer_votes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "votes_delete_own" on public.answer_votes for delete using (auth.uid() = user_id);

-- Projets
create policy "projects_insert_own" on public.projects for insert with check (auth.uid() = author_id);
create policy "projects_update_own" on public.projects for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "projects_delete_own" on public.projects for delete using (auth.uid() = author_id);
