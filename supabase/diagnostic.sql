-- AfriDevHub : diagnostic de la base (lecture seule, ne modifie rien).
-- À exécuter dans Supabase > SQL Editor. Envoie-moi le résultat si une ligne est en ÉCHEC.
select * from (
  select 1 n, 'trigger de création de profil sur auth.users' as controle,
         exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace s on s.oid = c.relnamespace
                 where s.nspname = 'auth' and c.relname = 'users' and t.tgname = 'on_auth_user_created' and not t.tgisinternal) as ok
  union all select 2, 'vue profiles_me (schéma v7)', to_regclass('public.profiles_me') is not null
  union all select 3, 'fonction delete_my_account', to_regprocedure('public.delete_my_account()') is not null
  union all select 4, 'delete_my_account : version corrigée (v11)',
         coalesce((select prosrc like '%exception when others%' from pg_proc where oid = to_regprocedure('public.delete_my_account()')), false)
  union all select 5, 'authenticated peut modifier profiles.username',
         has_column_privilege('authenticated', 'public.profiles', 'username', 'UPDATE')
  union all select 6, 'authenticated peut modifier profiles.bio',
         has_column_privilege('authenticated', 'public.profiles', 'bio', 'UPDATE')
  union all select 7, 'authenticated peut LIRE profiles.id (nécessaire aux mises à jour)',
         has_column_privilege('authenticated', 'public.profiles', 'id', 'SELECT')
  union all select 8, 'politique RLS de modification du profil',
         exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and cmd in ('UPDATE', 'ALL'))
  union all select 9, 'RLS activée sur profiles',
         coalesce((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), false)
  union all select 10, 'table notifications + temps réel',
         exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications')
  union all select 11, 'push : table push_tokens', to_regclass('public.push_tokens') is not null
  union all select 12, 'push : table web_push_subs', to_regclass('public.web_push_subs') is not null
  union all select 13, 'push : register_web_push durci (v11)',
         coalesce((select prosrc like '%service push non autorisé%' from pg_proc where oid = to_regprocedure('public.register_web_push(text,text,text)')), false)
  union all select 14, 'push_tokens inaccessible en direct (anon/authenticated)',
         not has_table_privilege('authenticated', 'public.push_tokens', 'select') and not has_table_privilege('anon', 'public.push_tokens', 'select')
  union all select 15, 'pseudos en double (insensible à la casse)',
         not exists (select 1 from public.profiles group by lower(username) having count(*) > 1)
) x order by n;

-- Pseudos et comptes de démonstration (pour comprendre un pseudo « changé » à l'inscription) :
select p.username, u.email, p.created_at from public.profiles p join auth.users u on u.id = p.id order by p.created_at;
