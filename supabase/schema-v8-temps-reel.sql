-- AfriDevHub — v8 : notifications en temps réel (Supabase Realtime)
-- À exécuter après schema-v7-securite.sql. Idempotent.
--
-- Realtime diffuse les changements de la table `notifications` aux clients abonnés. Il applique les politiques RLS :
-- chaque utilisateur ne reçoit que ses propres lignes (politique « lecture par le destinataire », user_id = auth.uid()).

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      alter publication supabase_realtime add table public.notifications;
    end if;
  else
    raise notice 'Publication supabase_realtime absente : activer Realtime sur la table notifications depuis le tableau de bord (Database > Replication).';
  end if;
end $$;

-- Les changements de lignes (UPDATE) sont filtrés avec la clé primaire : l'identité de réplication par défaut suffit.
