-- AfriDevHub v12 : corrections des alertes du « Security & Performance Advisor » de Supabase. Idempotent.

-- 1. Fonctions internes (déclencheurs) : jamais appelables via /rest/v1/rpc.
do $$
declare f text;
begin
  foreach f in array array['public.notify_on_accept()', 'public.rls_auto_enable()', 'public.check_accepted_answer()'] loop
    if to_regprocedure(f) is not null then
      execute format('revoke execute on function %s from public, anon, authenticated', f);
    end if;
  end loop;
end $$;

-- 2. search_path fixé (alerte « Function Search Path Mutable »).
do $$ begin
  if to_regprocedure('public.check_accepted_answer()') is not null then
    alter function public.check_accepted_answer() set search_path = public;
  end if;
end $$;

-- 3. Vues de statistiques : droits de l'appelant (security invoker) au lieu de ceux du créateur.
alter view if exists public.site_stats  set (security_invoker = true);
alter view if exists public.space_stats set (security_invoker = true);
-- profiles_public et profiles_me restent « security definer » VOLONTAIREMENT : elles masquent bio et parcours
-- (colonnes privées) tant que le membre ne les a pas rendus publics. Voir SECURITE.md.

-- 4. Tables push : refus explicite (RLS activée, aucun accès direct ; seules les fonctions et la clé service passent).
do $$ begin
  if to_regclass('public.push_tokens') is not null then
    drop policy if exists "push_tokens: aucun acces direct" on public.push_tokens;
    create policy "push_tokens: aucun acces direct" on public.push_tokens for all to anon, authenticated using (false) with check (false);
  end if;
  if to_regclass('public.web_push_subs') is not null then
    drop policy if exists "web_push_subs: aucun acces direct" on public.web_push_subs;
    create policy "web_push_subs: aucun acces direct" on public.web_push_subs for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

-- 5. Politiques RLS : auth.uid() évalué une seule fois par requête (et non par ligne) => (select auth.uid()).
do $$
declare r record; q text; w text; stmt text;
begin
  for r in select * from pg_policies where schemaname = 'public'
           and (coalesce(qual, '') ~ 'auth\.(uid|jwt|role)\(\)' or coalesce(with_check, '') ~ 'auth\.(uid|jwt|role)\(\)') loop
    q := r.qual; w := r.with_check;
    -- remplace auth.fonction() non déjà enveloppé dans un SELECT
    q := regexp_replace(q, '(?<!SELECT )auth\.(uid|jwt|role)\(\)', '(select auth.\1())', 'gi');
    w := regexp_replace(w, '(?<!SELECT )auth\.(uid|jwt|role)\(\)', '(select auth.\1())', 'gi');
    if q is distinct from r.qual or w is distinct from r.with_check then
      stmt := format('alter policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
      if q is not null then stmt := stmt || format(' using (%s)', q); end if;
      if w is not null then stmt := stmt || format(' with check (%s)', w); end if;
      execute stmt;
    end if;
  end loop;
end $$;

-- 6. Clés étrangères sans index (jointures et suppressions en cascade plus rapides).
create index if not exists answer_votes_user_idx      on public.answer_votes (user_id);
create index if not exists comments_author_idx        on public.comments (author_id);
create index if not exists listings_author_idx        on public.listings (author_id);
create index if not exists notifications_actor_idx    on public.notifications (actor_id);
create index if not exists notifications_question_idx on public.notifications (question_id);
create index if not exists project_ratings_user_idx   on public.project_ratings (user_id);
create index if not exists projects_author_idx        on public.projects (author_id);
create index if not exists questions_accepted_idx     on public.questions (accepted_answer_id);
create index if not exists user_blocks_blocked_idx    on public.user_blocks (blocked_id);
-- Les index « jamais utilisés » sont conservés : la base est jeune, ils serviront avec le trafic réel.
