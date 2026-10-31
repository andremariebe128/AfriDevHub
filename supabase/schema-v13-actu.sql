-- AfriDevHub v13 : « Actu Dev » (fil d'actualité des développeurs + discussion par sujet). Idempotent.
-- Publier : réputation minimale OU compte vérifié (abonnement). Discuter : tout membre connecté.

-- ------------------------------------------------------------------ 1. Compte vérifié (badge, abonnement)
-- `verified_until` n'est modifiable par aucun membre (absent des privilèges d'écriture) : seul l'administrateur
-- (SQL Editor / futur paiement) l'écrit. Exemple :
--   update public.profiles set verified_until = now() + interval '30 days' where username = 'Andre-Marie';
alter table public.profiles add column if not exists verified_until timestamptz;
grant select (verified_until) on public.profiles to anon, authenticated;

-- ------------------------------------------------------------------ 2. Droit de publier
create or replace function public.news_min_rep() returns int language sql immutable as $$ select 15 $$;

create or replace function public.news_rep(uid uuid) returns int
language sql stable set search_path = public as $$
  select (coalesce(sum(a.score), 0) + 5 * count(a.id))::int from public.answers a where a.author_id = uid
$$;

create or replace function public.can_post_news(uid uuid) returns boolean
language sql stable set search_path = public as $$
  select coalesce((select p.verified_until > now() from public.profiles p where p.id = uid), false)
      or public.news_rep(uid) >= public.news_min_rep()
$$;

-- État du membre connecté : { can_post, rep, min_rep, verified }
create or replace function public.news_status() returns jsonb
language sql stable set search_path = public as $$
  select jsonb_build_object(
    'can_post', public.can_post_news(auth.uid()),
    'rep', public.news_rep(auth.uid()),
    'min_rep', public.news_min_rep(),
    'verified', coalesce((select p.verified_until > now() from public.profiles p where p.id = auth.uid()), false))
  where auth.uid() is not null
$$;
revoke all on function public.news_status() from public, anon;
grant execute on function public.news_status() to authenticated;

-- ------------------------------------------------------------------ 3. Liens vérifiés (liste blanche de domaines, HTTPS seulement)
-- La même liste est dans src/lib/linkhosts.ts (aperçu côté serveur) : les deux doivent rester identiques.
create or replace function public.news_allowed_hosts() returns text[] language sql immutable as $$
  select array[
    'github.com','gitlab.com','dev.to','medium.com','hashnode.com','hashnode.dev','stackoverflow.com','stackexchange.com',
    'developer.mozilla.org','docs.flutter.dev','flutter.dev','dart.dev','pub.dev','nextjs.org','react.dev','vercel.com',
    'supabase.com','nodejs.org','python.org','php.net','laravel.com','kaggle.com','zindi.africa','arxiv.org','huggingface.co',
    'youtube.com','youtu.be','news.ycombinator.com','techcabal.com','techpoint.africa','disrupt-africa.com','wearetech.africa',
    'developers.google.com','android-developers.googleblog.com','blog.google','cloud.google.com','firebase.google.com',
    'microsoft.com','learn.microsoft.com','aws.amazon.com','cloudflare.com','openai.com','anthropic.com','linkedin.com',
    'smashingmagazine.com','css-tricks.com','web.dev','owasp.org','mozilla.org','kotlinlang.org','rust-lang.org','go.dev']
$$;

create or replace function public.news_link_ok(u text) returns boolean
language plpgsql immutable set search_path = public as $$
declare h text;
begin
  if u is null then return true; end if;
  if char_length(u) > 500 or u !~* '^https://([a-z0-9-]+\.)+[a-z]{2,}(/[^[:space:]<>"'']*)?$' then return false; end if;
  h := lower(substring(u from '^https://([^/]+)'));
  return exists (select 1 from unnest(public.news_allowed_hosts()) d where h = d or h like '%.' || d);
end $$;

-- ------------------------------------------------------------------ 4. Publications
create table if not exists public.news_posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 1 and 2000),
  image_url   text,
  link_url    text,
  link_title  text check (link_title is null or char_length(link_title) <= 160),
  link_desc   text check (link_desc is null or char_length(link_desc) <= 300),
  link_site   text check (link_site is null or char_length(link_site) <= 80),
  msg_count   int  not null default 0,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz,
  constraint news_link_allowed  check (public.news_link_ok(link_url)),
  constraint news_preview_needs_link check (link_url is not null or (link_title is null and link_desc is null and link_site is null)),
  constraint news_image_own check (image_url is null or image_url ~ ('^https://[^/?#]+/storage/v1/object/public/post-images/' || author_id::text || '/[A-Za-z0-9_-]{1,64}\.(jpg|jpeg|png|webp)$'))
);
create index if not exists news_posts_created_idx on public.news_posts (created_at desc);
create index if not exists news_posts_author_idx  on public.news_posts (author_id);

alter table public.news_posts enable row level security;
drop policy if exists "news: lecture" on public.news_posts;
create policy "news: lecture" on public.news_posts for select using (true);
drop policy if exists "news: publier" on public.news_posts;
create policy "news: publier" on public.news_posts for insert to authenticated
  with check (author_id = (select auth.uid()) and public.can_post_news((select auth.uid())));
drop policy if exists "news: modifier le sien" on public.news_posts;
create policy "news: modifier le sien" on public.news_posts for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
drop policy if exists "news: supprimer le sien" on public.news_posts;
create policy "news: supprimer le sien" on public.news_posts for delete to authenticated using (author_id = (select auth.uid()));

revoke all on public.news_posts from anon, authenticated;
grant select on public.news_posts to anon, authenticated;
grant insert (author_id, body, image_url, link_url, link_title, link_desc, link_site) on public.news_posts to authenticated;
grant update (body) on public.news_posts to authenticated;
grant delete on public.news_posts to authenticated;

drop trigger if exists news_posts_rate on public.news_posts;
create trigger news_posts_rate before insert on public.news_posts for each row execute function public.rate_limit('5', '1 day');

create or replace function public.news_touch() returns trigger language plpgsql set search_path = public as $$
begin
  if new.body is distinct from old.body then new.edited_at := now(); end if;
  return new;
end $$;
drop trigger if exists news_posts_touch on public.news_posts;
create trigger news_posts_touch before update on public.news_posts for each row execute function public.news_touch();

-- ------------------------------------------------------------------ 5. Discussion (messages d'un sujet)
create table if not exists public.news_messages (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.news_posts(id) on delete cascade,
  author_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  reply_to   uuid references public.news_messages(id) on delete set null,
  body       text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  edited_at  timestamptz
);
create index if not exists news_messages_post_idx   on public.news_messages (post_id, created_at);
create index if not exists news_messages_author_idx on public.news_messages (author_id);
create index if not exists news_messages_reply_idx  on public.news_messages (reply_to);

alter table public.news_messages enable row level security;
drop policy if exists "msg: lecture" on public.news_messages;
create policy "msg: lecture" on public.news_messages for select to authenticated using (true);
drop policy if exists "msg: envoyer" on public.news_messages;
create policy "msg: envoyer" on public.news_messages for insert to authenticated with check (author_id = (select auth.uid()));
drop policy if exists "msg: modifier le sien" on public.news_messages;
create policy "msg: modifier le sien" on public.news_messages for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
drop policy if exists "msg: supprimer le sien" on public.news_messages;
create policy "msg: supprimer le sien" on public.news_messages for delete to authenticated using (author_id = (select auth.uid()));

revoke all on public.news_messages from anon, authenticated;
grant select on public.news_messages to authenticated;
grant insert (post_id, author_id, reply_to, body) on public.news_messages to authenticated;
grant update (body) on public.news_messages to authenticated;
grant delete on public.news_messages to authenticated;

drop trigger if exists news_messages_rate on public.news_messages;
create trigger news_messages_rate before insert on public.news_messages for each row execute function public.rate_limit('30', '1 minute');

create or replace function public.news_msg_check() returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.reply_to is not null
     and not exists (select 1 from public.news_messages m where m.id = new.reply_to and m.post_id = new.post_id) then
    raise exception 'La réponse doit viser un message du même sujet' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' and new.body is distinct from old.body then new.edited_at := now(); end if;
  return new;
end $$;
drop trigger if exists news_messages_check on public.news_messages;
create trigger news_messages_check before insert or update on public.news_messages for each row execute function public.news_msg_check();

-- Compteur de messages du sujet (la table des sujets n'est pas modifiable par les membres : fonction dédiée).
create or replace function public.news_count() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update public.news_posts set msg_count = msg_count + 1 where id = new.post_id;
  else update public.news_posts set msg_count = greatest(msg_count - 1, 0) where id = old.post_id; end if;
  return null;
end $$;
drop trigger if exists news_messages_count on public.news_messages;
create trigger news_messages_count after insert or delete on public.news_messages for each row execute function public.news_count();
revoke execute on function public.news_count() from public, anon, authenticated;

-- ------------------------------------------------------------------ 6. Signalement + temps réel
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('question','answer','comment','user','project','listing','news_post','news_message'));

do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['news_messages', 'news_posts'] loop
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  else
    raise notice 'Publication supabase_realtime absente : activer Realtime sur news_messages depuis le tableau de bord.';
  end if;
end $$;
