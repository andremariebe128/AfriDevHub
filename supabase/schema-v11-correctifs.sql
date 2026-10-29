-- AfriDevHub v11 : correctifs (suppression de compte sur Supabase réel) + durcissement du push. Idempotent.

-- 1. Suppression de compte.
-- Supabase interdit « delete from storage.objects » en SQL (trigger storage.protect_delete) : l'ancienne version
-- échouait donc toujours. Les fichiers sont déjà retirés par l'API Storage côté application ; ici le nettoyage SQL
-- est tenté en « meilleur effort » et ne bloque plus la suppression du compte.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Non autorisé' using errcode = '28000';
  end if;
  delete from public.listings where author_id = uid;
  begin
    if to_regclass('storage.objects') is not null then
      delete from storage.objects
       where bucket_id in ('avatars', 'covers', 'post-images') and (storage.foldername(name))[1] = uid::text;
    end if;
  exception when others then
    null; -- suppression directe interdite par Supabase : les fichiers sont retirés via l'API Storage
  end;
  delete from auth.users where id = uid;  -- cascade : profil, questions, réponses, votes, commentaires, jetons push…
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 2. Web Push : l'endpoint est rappelé par notre serveur => liste blanche des services push connus (anti-SSRF)
--    et nombre d'abonnements limité par compte (anti-abus).
create or replace function public.register_web_push(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
declare host text;
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;
  if p_endpoint !~ '^https://[^/?#@\s]+/' or length(p_endpoint) > 2048
     or length(p_p256dh) > 256 or length(p_auth) > 64 or p_p256dh !~ '^[A-Za-z0-9_-]+$' or p_auth !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'abonnement invalide';
  end if;
  host := lower(substring(p_endpoint from '^https://([^/?#:]+)'));
  if not (host = 'fcm.googleapis.com'
       or host = 'updates.push.services.mozilla.com' or host like '%.push.services.mozilla.com'
       or host like '%.notify.windows.com' or host = 'web.push.apple.com' or host like '%.push.apple.com') then
    raise exception 'service push non autorisé';
  end if;
  if (select count(*) from public.web_push_subs where user_id = auth.uid()) >= 10
     and not exists (select 1 from public.web_push_subs where endpoint = p_endpoint) then
    raise exception 'trop d''abonnements';
  end if;
  insert into public.web_push_subs (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, updated_at = now();
end $$;
revoke all on function public.register_web_push(text, text, text) from public, anon;
grant execute on function public.register_web_push(text, text, text) to authenticated;

create or replace function public.register_push_token(p_token text, p_platform text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;
  if p_token is null or length(p_token) < 20 or length(p_token) > 4096 or p_token !~ '^[A-Za-z0-9_:.-]+$'
     or p_platform not in ('android','ios','macos','web') then
    raise exception 'jeton invalide';
  end if;
  if (select count(*) from public.push_tokens where user_id = auth.uid()) >= 10
     and not exists (select 1 from public.push_tokens where token = p_token) then
    raise exception 'trop d''appareils';
  end if;
  insert into public.push_tokens (token, user_id, platform)
  values (p_token, auth.uid(), p_platform)
  on conflict (token) do update
    set user_id = auth.uid(), platform = excluded.platform, updated_at = now();
end $$;
revoke all on function public.register_push_token(text, text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;
