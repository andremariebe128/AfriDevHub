-- AfriDevHub v10 : Web Push (site fermé), standard VAPID. Idempotent.
create table if not exists public.web_push_subs (
  endpoint   text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  updated_at timestamptz not null default now()
);
create index if not exists web_push_subs_user_idx on public.web_push_subs (user_id);
alter table public.web_push_subs enable row level security;
revoke all on public.web_push_subs from anon, authenticated;

create or replace function public.register_web_push(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 2048 or length(p_p256dh) > 256 or length(p_auth) > 64 then
    raise exception 'abonnement invalide';
  end if;
  insert into public.web_push_subs (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, updated_at = now();
end $$;

create or replace function public.unregister_web_push(p_endpoint text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;
  delete from public.web_push_subs where endpoint = p_endpoint and user_id = auth.uid();
end $$;

revoke all on function public.register_web_push(text, text, text) from public, anon;
revoke all on function public.unregister_web_push(text) from public, anon;
grant execute on function public.register_web_push(text, text, text) to authenticated;
grant execute on function public.unregister_web_push(text) to authenticated;
