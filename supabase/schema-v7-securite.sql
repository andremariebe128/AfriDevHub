-- =====================================================================================
-- AfriDevHub v7 : sécurité, intégrité, confidentialité, forum, compte
-- À exécuter dans Supabase > SQL Editor, APRÈS schema.sql et schema-v2 à v6.
-- Idempotent : peut être rejoué sans erreur.
-- =====================================================================================

-- ------------------------------------------------------------------ 0. Fonctions utilitaires
create or replace function public.is_http_url(u text) returns boolean
language sql immutable parallel safe set search_path = public as $$
  select u is null or (char_length(u) <= 500 and u ~* '^https?://[^[:space:]<>"'']+$');
$$;

create or replace function public.tags_ok(t text[]) returns boolean
language sql immutable parallel safe set search_path = public as $$
  select t is null or (
    coalesce(array_length(t, 1), 0) <= 8
    and not exists (select 1 from unnest(t) x where x is null or char_length(x) not between 1 and 30)
  );
$$;

-- ------------------------------------------------------------------ 1. Colonnes (réconciliation v5/v6 et front)
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio_public boolean not null default false,
  add column if not exists cv jsonb not null default '[]'::jsonb,
  add column if not exists cv_public boolean not null default true;

alter table public.listings
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists country text,
  add column if not exists link text;

alter table public.questions add column if not exists updated_at timestamptz;
alter table public.answers   add column if not exists updated_at timestamptz;
alter table public.projects  add column if not exists cover_url text;

create index if not exists listings_dates_idx on public.listings (section, start_date, end_date);
create index if not exists answers_author_idx on public.answers (author_id);
create index if not exists questions_author_idx on public.questions (author_id);

-- ------------------------------------------------------------------ 2. Contraintes (NOT VALID : n'échouent pas sur d'anciennes lignes, valent pour toute écriture future)
do $$
declare c record;
begin
  for c in select * from (values
    ('profiles',  'profiles_username_fmt',  $c$check (username ~ '^[A-Za-z0-9_.-]{3,30}$')$c$),
    ('profiles',  'profiles_bio_len',       $c$check (bio is null or char_length(bio) <= 1000)$c$),
    ('profiles',  'profiles_fullname_len',  $c$check (full_name is null or char_length(full_name) <= 80)$c$),
    ('profiles',  'profiles_country_len',   $c$check (country is null or char_length(country) between 2 and 60)$c$),
    ('profiles',  'profiles_github_http',   $c$check (public.is_http_url(github_url))$c$),
    ('profiles',  'profiles_website_http',  $c$check (public.is_http_url(website_url))$c$),
    ('profiles',  'profiles_avatar_https',  $c$check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 500))$c$),
    ('profiles',  'profiles_avatar_own',    $c$check (avatar_url is null or avatar_url ~ ('^https://[^/?#]+/storage/v1/object/public/avatars/' || id::text || '/[A-Za-z0-9_-]{1,64}\.(jpg|jpeg|png|webp)(\?v=[0-9]{1,16})?$'))$c$),
    ('profiles',  'profiles_stack_ok',      $c$check (public.tags_ok(stack))$c$),
    ('profiles',  'profiles_languages_ok',  $c$check (languages is null or coalesce(array_length(languages, 1), 0) <= 12)$c$),
    ('profiles',  'profiles_cv_shape',      $c$check (jsonb_typeof(cv) = 'array' and jsonb_array_length(cv) <= 20 and pg_column_size(cv) <= 20000)$c$),
    ('questions', 'questions_body_max',     $c$check (char_length(body) <= 20000)$c$),
    ('questions', 'questions_tags_ok',      $c$check (public.tags_ok(tags))$c$),
    ('answers',   'answers_body_max',       $c$check (char_length(body) <= 20000)$c$),
    ('projects',  'projects_desc_len',      $c$check (description is null or char_length(description) <= 2000)$c$),
    ('projects',  'projects_url_http',      $c$check (public.is_http_url(url))$c$),
    ('projects',  'projects_cover_https',   $c$check (cover_url is null or (cover_url ~ '^https://' and char_length(cover_url) <= 500))$c$),
    ('projects',  'projects_cover_own',     $c$check (cover_url is null or cover_url ~ ('^https://[^/?#]+/storage/v1/object/public/covers/' || author_id::text || '/[A-Za-z0-9_-]{1,64}\.(jpg|jpeg|png|webp)(\?v=[0-9]{1,16})?$'))$c$),
    ('projects',  'projects_tags_ok',       $c$check (public.tags_ok(tags))$c$),
    ('listings',  'listings_kind_len',      $c$check (char_length(kind) between 2 and 40)$c$),
    ('listings',  'listings_meta_len',      $c$check (char_length(meta) <= 200)$c$),
    ('listings',  'listings_body_len',      $c$check (char_length(body) <= 5000)$c$),
    ('listings',  'listings_tags_ok',       $c$check (public.tags_ok(tags))$c$),
    ('listings',  'listings_link_http',     $c$check (public.is_http_url(link))$c$),
    ('listings',  'listings_country_len',   $c$check (country is null or char_length(country) between 2 and 60)$c$),
    ('listings',  'listings_dates_ok',      $c$check (start_date is null or end_date is null or end_date >= start_date)$c$)
  ) as v(tbl, name, def)
  loop
    if not exists (select 1 from pg_constraint where conname = c.name and conrelid = ('public.' || c.tbl)::regclass) then
      execute format('alter table public.%I add constraint %I %s not valid', c.tbl, c.name, c.def);
    end if;
  end loop;
end $$;

-- Pseudo unique sans tenir compte de la casse (ignoré si des doublons historiques existent)
do $$ begin
  create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
exception when unique_violation then
  raise notice 'Doublons de pseudo (casse) : résoudre manuellement puis rejouer cette migration.';
end $$;

-- Pseudos réservés
create or replace function public.is_reserved_username(u text) returns boolean
language sql immutable parallel safe set search_path = public as $$
  select lower(coalesce(u, '')) = any (array[
    'admin','administrator','root','system','support','moderator','mod','staff','team','security','help','contact',
    'afridevhub','afridevhub_team','bamek','api','null','undefined','me','anonymous','anonyme','official','officiel'
  ]);
$$;

create or replace function public.guard_username() returns trigger
language plpgsql set search_path = public as $$
begin
  if (tg_op = 'INSERT' or new.username is distinct from old.username)
     and public.is_reserved_username(new.username)
     and auth.uid() is not null then
    raise exception 'Ce pseudo est réservé' using errcode = '23514';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard_username on public.profiles;
create trigger profiles_guard_username before insert or update of username on public.profiles
  for each row execute function public.guard_username();

-- Création du profil à l'inscription : tolérante, ne plante jamais l'inscription
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  raw text; uname text;
begin
  raw := coalesce(new.raw_user_meta_data->>'username', '');
  uname := regexp_replace(trim(raw), '[^A-Za-z0-9_.-]', '', 'g');
  if char_length(uname) < 3 or char_length(uname) > 30 or public.is_reserved_username(uname) then
    uname := 'dev_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  begin
    insert into public.profiles (id, username) values (new.id, uname);
  exception when unique_violation then
    insert into public.profiles (id, username)
    values (new.id, left(uname, 20) || '_' || substr(replace(new.id::text, '-', ''), 1, 6));
  end;
  return new;
end $$;

-- ------------------------------------------------------------------ 3. Confidentialité : bio et cv ne sont plus lisibles directement
-- Les privilèges de colonnes remplacent les privilèges de table pour anon/authenticated.
revoke select on public.profiles from anon, authenticated;
grant select (id, username, full_name, country, stack, github_url, created_at, headline, website_url, languages,
              years_exp, open_to, avatar_url, bio_public, cv_public)
  on public.profiles to anon, authenticated;

revoke insert, update on public.profiles from anon, authenticated;
grant update (username, full_name, country, bio, stack, github_url, headline, website_url, languages,
              years_exp, open_to, avatar_url, bio_public, cv, cv_public)
  on public.profiles to authenticated;

-- Profil public : bio et parcours uniquement si le membre les a rendus publics.
create or replace view public.profiles_public with (security_invoker = false) as
select p.id, p.username, p.full_name, p.country, p.headline, p.stack, p.languages, p.years_exp, p.open_to,
       p.github_url, p.website_url, p.avatar_url, p.created_at,
       p.bio_public, case when p.bio_public then p.bio end as bio,
       p.cv_public,  case when p.cv_public  then p.cv  end as cv
from public.profiles p;
grant select on public.profiles_public to anon, authenticated;

-- Mon profil complet (ligne de l'utilisateur connecté uniquement).
create or replace view public.profiles_me with (security_invoker = false) as
select * from public.profiles p where p.id = auth.uid();
revoke all on public.profiles_me from anon;
grant select on public.profiles_me to authenticated;

-- Classement des contributeurs (avec photo)
create or replace view public.contributors with (security_invoker = true) as
select p.username, p.country, (coalesce(sum(a.score), 0) + 5 * count(a.id))::int as rep, p.avatar_url
from public.profiles p left join public.answers a on a.author_id = p.id
group by p.id;
grant select on public.contributors to anon, authenticated;

-- ------------------------------------------------------------------ 4. Intégrité : colonnes verrouillées
-- answers.score ne peut être modifié que par le trigger des votes (security definer).
revoke insert, update on public.answers from anon, authenticated;
grant insert (question_id, author_id, body) on public.answers to authenticated;
grant update (body) on public.answers to authenticated;

revoke insert, update on public.questions from anon, authenticated;
grant insert (author_id, title, body, tags) on public.questions to authenticated;
grant update (title, body, tags, accepted_answer_id) on public.questions to authenticated;

revoke insert, update on public.projects from anon, authenticated;
grant insert (author_id, title, description, url, tags, cover_url) on public.projects to authenticated;
grant update (title, description, url, tags, cover_url) on public.projects to authenticated;

revoke insert, update on public.listings from anon, authenticated;
grant insert (author_id, section, kind, title, meta, body, tags, start_date, end_date, country, link) on public.listings to authenticated;
grant update (kind, title, meta, body, tags, start_date, end_date, country, link) on public.listings to authenticated;

revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;
revoke insert, delete on public.notifications from anon, authenticated;

revoke insert, update, delete on public.spaces from anon, authenticated;
revoke insert, update, delete on public.project_ratings from anon;

-- Pas de vote pour sa propre réponse
create or replace function public.forbid_self_vote() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.answers a where a.id = new.answer_id and a.author_id = new.user_id) then
    raise exception 'Vous ne pouvez pas voter pour votre propre réponse' using errcode = '23514';
  end if;
  return new;
end $$;
drop trigger if exists answer_votes_no_self on public.answer_votes;
create trigger answer_votes_no_self before insert or update on public.answer_votes
  for each row execute function public.forbid_self_vote();

-- Pas de note sur son propre projet
create or replace function public.forbid_self_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.projects p where p.id = new.project_id and p.author_id = new.user_id) then
    raise exception 'Vous ne pouvez pas noter votre propre projet' using errcode = '23514';
  end if;
  return new;
end $$;
drop trigger if exists project_ratings_no_self on public.project_ratings;
create trigger project_ratings_no_self before insert or update on public.project_ratings
  for each row execute function public.forbid_self_rating();

-- Date de modification (affichée « modifié »)
create or replace function public.touch_question_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.title is distinct from old.title or new.body is distinct from old.body or new.tags is distinct from old.tags then
    new.updated_at := now();
  end if;
  return new;
end $$;
create or replace function public.touch_answer_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.body is distinct from old.body then
    new.updated_at := now();
  end if;
  return new;
end $$;
drop function if exists public.touch_updated_at() cascade;
drop trigger if exists questions_touch on public.questions;
create trigger questions_touch before update on public.questions for each row execute function public.touch_question_updated_at();
drop trigger if exists answers_touch on public.answers;
create trigger answers_touch before update on public.answers for each row execute function public.touch_answer_updated_at();

-- Compteur de réponses (tri « sans réponse » et « populaires » sans jointure coûteuse)
alter table public.questions add column if not exists answers_count int not null default 0;
update public.questions q set answers_count = (select count(*) from public.answers a where a.question_id = q.id)
  where q.answers_count <> (select count(*) from public.answers a where a.question_id = q.id);
create index if not exists questions_answers_count_idx on public.questions (answers_count, created_at desc);
create index if not exists profiles_country_idx on public.profiles (country);

create or replace function public.sync_answers_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.questions set answers_count = answers_count + 1 where id = new.question_id;
  elsif tg_op = 'DELETE' then
    update public.questions set answers_count = greatest(answers_count - 1, 0) where id = old.question_id;
  end if;
  return null;
end $$;
drop trigger if exists answers_count_sync on public.answers;
create trigger answers_count_sync after insert or delete on public.answers for each row execute function public.sync_answers_count();
revoke execute on function public.sync_answers_count() from public, anon, authenticated;

-- Statistiques agrégées (aucune donnée personnelle)
create or replace view public.space_stats with (security_invoker = false) as
select s.slug,
  (case when s.kind = 'country'
        then (select count(*) from public.profiles p where p.country = s.name)
        else (select count(*) from public.profiles p where s.tag is not null and s.tag = any (p.stack)) end)::int as members,
  (case when s.kind = 'country'
        then (select count(*) from public.questions q join public.profiles p on p.id = q.author_id where p.country = s.name and q.created_at > now() - interval '7 days')
        else (select count(*) from public.questions q where s.tag is not null and s.tag = any (q.tags) and q.created_at > now() - interval '7 days') end)::int as weekly
from public.spaces s;
grant select on public.space_stats to anon, authenticated;

create or replace view public.site_stats with (security_invoker = false) as
select (select count(*) from public.profiles)::int as members,
       (select count(distinct country) from public.profiles where country is not null)::int as countries,
       (select count(*) from public.questions where accepted_answer_id is not null)::int as solved,
       (select count(*) from public.projects)::int as projects;
grant select on public.site_stats to anon, authenticated;

-- ------------------------------------------------------------------ 5. Anti-abus : limites de débit par utilisateur (ne s'appliquent pas à la clé de service)
create or replace function public.rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  lim int := tg_argv[0]::int;
  win interval := tg_argv[1]::interval;
  col text := coalesce(tg_argv[2], 'author_id');
  uid uuid; n int;
begin
  uid := auth.uid();
  if uid is null then return new; end if;
  execute format('select count(*) from %I.%I where %I = $1 and created_at > now() - $2', tg_table_schema, tg_table_name, col)
    into n using uid, win;
  if n >= lim then
    raise exception 'Trop d''actions en peu de temps, réessayez plus tard' using errcode = '54000';
  end if;
  return new;
end $$;

drop trigger if exists questions_rate on public.questions;
create trigger questions_rate before insert on public.questions for each row execute function public.rate_limit('10', '1 hour');
drop trigger if exists answers_rate on public.answers;
create trigger answers_rate before insert on public.answers for each row execute function public.rate_limit('40', '1 hour');
drop trigger if exists projects_rate on public.projects;
create trigger projects_rate before insert on public.projects for each row execute function public.rate_limit('10', '1 day');
drop trigger if exists listings_rate on public.listings;
create trigger listings_rate before insert on public.listings for each row execute function public.rate_limit('10', '1 day');

-- ------------------------------------------------------------------ 6. Forum : commentaires, signalements, blocages
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  answer_id uuid references public.answers(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 600),
  created_at timestamptz not null default now()
);
create index if not exists comments_question_idx on public.comments (question_id, created_at);
create index if not exists comments_answer_idx on public.comments (answer_id);
alter table public.comments enable row level security;
drop policy if exists "commentaires lisibles par tous" on public.comments;
create policy "commentaires lisibles par tous" on public.comments for select using (true);
drop policy if exists "commenter en son nom" on public.comments;
create policy "commenter en son nom" on public.comments for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "supprimer son commentaire" on public.comments;
create policy "supprimer son commentaire" on public.comments for delete to authenticated using (author_id = auth.uid());
revoke all on public.comments from anon, authenticated;
grant select on public.comments to anon, authenticated;
grant insert (question_id, answer_id, author_id, body) on public.comments to authenticated;
grant delete on public.comments to authenticated;

-- Le commentaire d'une réponse doit viser une réponse de la même question
create or replace function public.check_comment_target() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.answer_id is not null and not exists (
    select 1 from public.answers a where a.id = new.answer_id and a.question_id = new.question_id
  ) then
    raise exception 'La réponse ciblée n''appartient pas à cette question' using errcode = '23514';
  end if;
  return new;
end $$;
drop trigger if exists comments_check_target on public.comments;
create trigger comments_check_target before insert on public.comments for each row execute function public.check_comment_target();
drop trigger if exists comments_rate on public.comments;
create trigger comments_rate before insert on public.comments for each row execute function public.rate_limit('60', '1 hour');

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('question','answer','comment','user','project','listing')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);
alter table public.reports enable row level security;
drop policy if exists "signaler en son nom" on public.reports;
create policy "signaler en son nom" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
revoke all on public.reports from anon, authenticated;
grant insert (reporter_id, target_type, target_id, reason) on public.reports to authenticated;
drop trigger if exists reports_rate on public.reports;
create trigger reports_rate before insert on public.reports for each row execute function public.rate_limit('20', '1 day', 'reporter_id');

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.user_blocks enable row level security;
drop policy if exists "voir ses blocages" on public.user_blocks;
create policy "voir ses blocages" on public.user_blocks for select to authenticated using (blocker_id = auth.uid());
drop policy if exists "bloquer en son nom" on public.user_blocks;
create policy "bloquer en son nom" on public.user_blocks for insert to authenticated with check (blocker_id = auth.uid());
drop policy if exists "débloquer" on public.user_blocks;
create policy "débloquer" on public.user_blocks for delete to authenticated using (blocker_id = auth.uid());
revoke all on public.user_blocks from anon, authenticated;
grant select, delete on public.user_blocks to authenticated;
grant insert (blocker_id, blocked_id) on public.user_blocks to authenticated;

-- ------------------------------------------------------------------ 7. Stockage des images (lecture publique par URL, écriture dans son dossier uniquement)
do $$
declare b text; p text;
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'Schéma storage absent : buckets ignorés.';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
    ('avatars',     'avatars',     true, 2097152, array['image/jpeg','image/png','image/webp']),
    ('covers',      'covers',      true, 3145728, array['image/jpeg','image/png','image/webp']),
    ('post-images', 'post-images', true, 3145728, array['image/jpeg','image/png','image/webp'])
  on conflict (id) do update
    set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

  -- Retirer les anciennes politiques de lecture large (listing public des fichiers)
  for p in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects'
           and policyname in ('avatars lisibles par tous', 'avatars : envoi dans son dossier', 'avatars : mise à jour dans son dossier', 'avatars : suppression dans son dossier')
  loop
    execute format('drop policy if exists %I on storage.objects', p);
  end loop;

  foreach b in array array['avatars', 'covers', 'post-images'] loop
    execute format('drop policy if exists %I on storage.objects', 'adh_' || b || '_select');
    execute format('create policy %I on storage.objects for select to authenticated using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)', 'adh_' || b || '_select', b);
    execute format('drop policy if exists %I on storage.objects', 'adh_' || b || '_insert');
    -- Plafond de fichiers par membre et par bucket (évite le remplissage du stockage) : 10 avatars, 100 couvertures, 300 images de messages.
    execute format($f$create policy %I on storage.objects for insert to authenticated with check (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text and array_length(storage.foldername(name), 1) = 1 and name ~ '^[0-9a-f-]{36}/[A-Za-z0-9_-]{1,64}\.(jpg|jpeg|png|webp)$' and (select count(*) from storage.objects o where o.bucket_id = %L and (storage.foldername(o.name))[1] = auth.uid()::text) < %s)$f$, 'adh_' || b || '_insert', b, b, case b when 'avatars' then 10 when 'covers' then 100 else 300 end);
    execute format('drop policy if exists %I on storage.objects', 'adh_' || b || '_update');
    execute format($f$create policy %I on storage.objects for update to authenticated using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text and array_length(storage.foldername(name), 1) = 1 and name ~ '^[0-9a-f-]{36}/[A-Za-z0-9_-]{1,64}\.(jpg|jpeg|png|webp)$')$f$, 'adh_' || b || '_update', b, b);
    execute format('drop policy if exists %I on storage.objects', 'adh_' || b || '_delete');
    execute format('create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)', 'adh_' || b || '_delete', b);
  end loop;
end $$;

-- ------------------------------------------------------------------ 8. Compte : suppression et export (App Store, RGPD)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Non autorisé' using errcode = '28000';
  end if;
  delete from public.listings where author_id = uid;
  if to_regclass('storage.objects') is not null then
    delete from storage.objects where bucket_id in ('avatars', 'covers', 'post-images') and (storage.foldername(name))[1] = uid::text;
  end if;
  delete from auth.users where id = uid;  -- cascade : profil, questions, réponses, votes, commentaires, projets…
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

create or replace function public.export_my_data() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Non autorisé' using errcode = '28000';
  end if;
  return jsonb_build_object(
    'profile',       (select to_jsonb(p) from public.profiles p where p.id = uid),
    'questions',     coalesce((select jsonb_agg(to_jsonb(q)) from public.questions q where q.author_id = uid), '[]'),
    'answers',       coalesce((select jsonb_agg(to_jsonb(a)) from public.answers a where a.author_id = uid), '[]'),
    'comments',      coalesce((select jsonb_agg(to_jsonb(c)) from public.comments c where c.author_id = uid), '[]'),
    'projects',      coalesce((select jsonb_agg(to_jsonb(j)) from public.projects j where j.author_id = uid), '[]'),
    'listings',      coalesce((select jsonb_agg(to_jsonb(l)) from public.listings l where l.author_id = uid), '[]'),
    'notifications', coalesce((select jsonb_agg(to_jsonb(n)) from public.notifications n where n.user_id = uid), '[]'),
    'blocked_users', coalesce((select jsonb_agg(b.blocked_id) from public.user_blocks b where b.blocker_id = uid), '[]'),
    'exported_at',   now()
  );
end $$;
revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

-- ------------------------------------------------------------------ 9. Durcissement général
-- Aucune fonction security definer n'est appelable par anon, sauf nécessité.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.refresh_answer_score() from public, anon, authenticated;
revoke execute on function public.rate_limit() from public, anon, authenticated;
revoke execute on function public.forbid_self_vote() from public, anon, authenticated;
revoke execute on function public.forbid_self_rating() from public, anon, authenticated;
revoke execute on function public.check_comment_target() from public, anon, authenticated;

-- ------------------------------------------------------------------ 10. Notifications : commentaires, et respect des blocages
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in ('answer', 'accepted', 'vote', 'comment'));

-- Un membre bloqué ne génère plus de notification chez celui qui l'a bloqué.
create or replace function public.notify_on_answer() returns trigger language plpgsql security definer set search_path = public as $$
declare qa uuid;
begin
  select author_id into qa from public.questions where id = new.question_id;
  if qa is not null and qa <> new.author_id
     and not exists (select 1 from public.user_blocks b where b.blocker_id = qa and b.blocked_id = new.author_id) then
    insert into public.notifications (user_id, type, question_id, actor_id) values (qa, 'answer', new.question_id, new.author_id);
  end if;
  return new;
end $$;

create or replace function public.notify_on_vote() returns trigger language plpgsql security definer set search_path = public as $$
declare aa uuid; qid uuid;
begin
  if new.value = 1 then
    select author_id, question_id into aa, qid from public.answers where id = new.answer_id;
    if aa is not null and aa <> new.user_id
       and not exists (select 1 from public.user_blocks b where b.blocker_id = aa and b.blocked_id = new.user_id) then
      insert into public.notifications (user_id, type, question_id, actor_id) values (aa, 'vote', qid, new.user_id);
    end if;
  end if;
  return new;
end $$;

-- Nouveau commentaire -> notifier l'auteur de la question et l'auteur de la réponse commentée (une seule fois chacun)
create or replace function public.notify_on_comment() returns trigger language plpgsql security definer set search_path = public as $$
declare qa uuid; aa uuid;
begin
  select author_id into qa from public.questions where id = new.question_id;
  if new.answer_id is not null then
    select author_id into aa from public.answers where id = new.answer_id;
  end if;
  if qa is not null and qa <> new.author_id
     and not exists (select 1 from public.user_blocks b where b.blocker_id = qa and b.blocked_id = new.author_id) then
    insert into public.notifications (user_id, type, question_id, actor_id) values (qa, 'comment', new.question_id, new.author_id);
  end if;
  if aa is not null and aa <> new.author_id and aa is distinct from qa
     and not exists (select 1 from public.user_blocks b where b.blocker_id = aa and b.blocked_id = new.author_id) then
    insert into public.notifications (user_id, type, question_id, actor_id) values (aa, 'comment', new.question_id, new.author_id);
  end if;
  return new;
end $$;
drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments for each row execute function public.notify_on_comment();
revoke execute on function public.notify_on_comment() from public, anon, authenticated;

-- Anti-spam : une notification identique et non lue (même type, question et auteur de l'action) n'est pas répétée.
-- Sans cela, retirer puis remettre un vote (ou une acceptation) en boucle inonde la boîte de réception d'un autre membre.
create or replace function public.dedupe_notification() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.notifications n
    where n.user_id = new.user_id and n.type = new.type and n.question_id is not distinct from new.question_id
      and n.actor_id is not distinct from new.actor_id and n.read_at is null
  ) then
    return null;
  end if;
  return new;
end $$;
drop trigger if exists notifications_dedupe on public.notifications;
create trigger notifications_dedupe before insert on public.notifications for each row execute function public.dedupe_notification();
revoke execute on function public.dedupe_notification() from public, anon, authenticated;

revoke execute on function public.notify_on_answer() from public, anon, authenticated;
revoke execute on function public.notify_on_vote() from public, anon, authenticated;
