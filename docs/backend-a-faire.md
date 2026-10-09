# Back-end à faire pour la phase 3 (à l'attention d'André-Marie)

Le front de la phase 3 est livré **sans toucher à `supabase/`**. Il est écrit pour les colonnes et le bucket ci-dessous, mais il reste fonctionnel tant que la migration n'est pas passée (voir « Comportement sans migration »). Dès que le SQL est exécuté, tout s'active sans redéploiement du front.

## 1. Migration `supabase/schema-v6.sql` proposée

À exécuter dans Supabase > SQL Editor (idempotent : peut être rejoué).

```sql
-- AfriDevHub v6 : défis / concours, dates et pays des annonces, photo de profil, bio publique, parcours (CV)

-- ---------------------------------------------------------------- listings
-- Aucun changement sur `kind` : schema-v2.sql le déclare `text not null` sans contrainte `check`,
-- la nouvelle catégorie « Défi / Concours » est donc acceptée telle quelle.
alter table public.listings
  add column if not exists start_date date,
  add column if not exists end_date   date,
  add column if not exists country    text;   -- nom français du pays (ex. 'Bénin'), ou 'ALL' = ouvert à tous

do $$ begin
  alter table public.listings add constraint listings_dates_ok
    check (start_date is null or end_date is null or end_date >= start_date);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.listings add constraint listings_country_len
    check (country is null or char_length(country) between 2 and 60);
exception when duplicate_object then null; end $$;

create index if not exists listings_dates_idx on public.listings (section, start_date, end_date);

-- ---------------------------------------------------------------- profiles
alter table public.profiles
  add column if not exists avatar_url text,                                  -- URL publique (bucket `avatars`) + ?v=timestamp
  add column if not exists bio_public boolean not null default false,        -- bio privée par défaut
  add column if not exists cv         jsonb   not null default '[]'::jsonb,  -- parcours : voir schéma ci-dessous
  add column if not exists cv_public  boolean not null default true;         -- parcours public par défaut

do $$ begin
  alter table public.profiles add constraint profiles_cv_shape
    check (jsonb_typeof(cv) = 'array' and jsonb_array_length(cv) <= 20);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.profiles add constraint profiles_avatar_https
    check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 500));
exception when duplicate_object then null; end $$;

-- Les politiques RLS existantes de `profiles` (lecture publique, update par le propriétaire) couvrent les nouvelles colonnes.

-- ---------------------------------------------------------------- classement des contributeurs
-- Ajoute la photo (colonne en fin de vue : `create or replace` l'autorise).
create or replace view public.contributors with (security_invoker = true) as
select p.username, p.country, (coalesce(sum(a.score), 0) + 5 * count(a.id))::int as rep, p.avatar_url
from public.profiles p left join public.answers a on a.author_id = p.id
group by p.id;
grant select on public.contributors to anon, authenticated;

-- ---------------------------------------------------------------- stockage des photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars lisibles par tous" on storage.objects;
create policy "avatars lisibles par tous" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars : envoi dans son dossier" on storage.objects;
create policy "avatars : envoi dans son dossier" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars : mise à jour dans son dossier" on storage.objects;
create policy "avatars : mise à jour dans son dossier" on storage.objects
  for update to authenticated
  using      (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars : suppression dans son dossier" on storage.objects;
create policy "avatars : suppression dans son dossier" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
```

### Schéma de `profiles.cv` (jsonb)

Tableau de 20 entrées maximum, ordre = ordre choisi par le membre :

```json
[
  {
    "id": "uuid généré côté client",
    "type": "experience | education | project | certification",
    "title": "string, 2 à 100 caractères",
    "org": "string, 0 à 100 caractères (organisation, école, client…)",
    "start": "AAAA-MM",
    "end": "AAAA-MM ou null (null si en cours)",
    "current": true,
    "description": "string, 0 à 300 caractères",
    "url": "https://… ou null"
  }
]
```

Le front relit ce JSON de façon défensive (`src/lib/cv.ts`, `normalizeCv`) : une entrée invalide est ignorée, jamais d'erreur.

### Fichiers, chemins et formats

- Chemin d'envoi : `avatars/{user_id}/avatar.webp` (repli `avatar.jpg` si le navigateur ne sait pas encoder en WebP). Image 512×512 déjà recadrée et compressée par le navigateur ; limite 2 Mo avant compression côté front.
- `profiles.avatar_url` contient l'URL publique suivie de `?v={timestamp}` (contournement du cache).

## 2. Point d'attention : confidentialité de `bio` et `cv`

- Le front **masque côté serveur** la bio (sauf si `bio_public = true`) et le parcours (si `cv_public = false`) : ces champs ne sont pas envoyés aux visiteurs de `/u/[username]`. Le propriétaire les relit lui-même avec sa session.
- **Mais la politique `profiles_read using (true)` (schema.sql) rend toute la ligne `profiles` lisible par l'API REST.** Une personne qui interroge directement l'API peut donc encore lire une bio « privée ». Le masquage du front n'est qu'une première couche.
- Si une vraie confidentialité est voulue, une option : exposer une vue qui masque les champs, et retirer la lecture directe des colonnes sensibles.

```sql
-- OPTION (à décider ensemble, impacte le front)
create or replace view public.profiles_public with (security_invoker = false) as
select id, username, full_name, country, headline, stack, languages, years_exp, open_to,
       github_url, website_url, avatar_url, created_at,
       bio_public, case when bio_public then bio end as bio,
       cv_public,  case when cv_public  then cv  end as cv
from public.profiles;
grant select on public.profiles_public to anon, authenticated;
-- puis : revoke select (bio, cv) on public.profiles from anon, authenticated;
```

  Le front lit aujourd'hui `profiles` directement avec `select('*')` (voir la liste en section 4) : il faudrait alors le faire lire `profiles_public` (et prévoir une lecture de sa propre ligne pour le propriétaire). À ne faire qu'après accord, sinon `select('*')` échouera.

## 3. Espaces par pays (optionnel)

Le front affiche **les 54 pays d'Afrique** (`src/lib/countries.ts`) en fusionnant la table `spaces` et ce référentiel : un pays absent de `spaces` apparaît quand même, avec une description neutre générée côté front (« Échanges entre développeurs au Bénin. Capitale : Porto-Novo. »). Aucune insertion n'est donc requise.

Les colonnes `desc_fr` / `desc_en` des lignes `kind = 'country'` de `spaces` **ne sont plus affichées** : tous les pays utilisent le texte neutre généré par le front (nom + capitale). Les descriptions des espaces `kind = 'tech'` restent lues en base.

Si vous voulez tout de même les lignes en base (par exemple pour y mettre des descriptions rédigées), le slug attendu est `pays-` + nom français sans accents, apostrophes et espaces remplacés par `-` (`pays-benin`, `pays-cote-d-ivoire`, `pays-rd-congo`, `pays-afrique-du-sud`…), `kind = 'country'`, et `name` = nom français exact du référentiel (c'est aussi la valeur stockée dans `profiles.country` et `listings.country`).

## 4. Où le front dépend de ces changements

| Fonction | Fichiers du front | Colonnes / ressources |
|---|---|---|
| Défi / Concours | `src/components/PublishForm.tsx`, `src/app/opportunites/page.tsx`, `src/lib/utils.ts` | aucune (catégorie texte libre) |
| Dates des annonces, statut « À venir / En cours / Terminé » | `PublishForm.tsx`, `ListingRow.tsx`, `Directory.tsx`, `src/lib/dates.ts`, `src/lib/data.ts` (`loadItems`) | `listings.start_date`, `listings.end_date` |
| Pays concerné / ouvert à tous | `PublishForm.tsx`, `CountrySelect.tsx`, `ListingRow.tsx`, `data.ts` | `listings.country` |
| Photo de profil | `AvatarUpload.tsx`, `src/lib/image.ts`, `Avatar.tsx`, `Header.tsx`, `QACard.tsx`, `AnswerSection.tsx`, `ProjectsHub.tsx`, `ListingRow.tsx`, `src/app/page.tsx`, `src/app/u/[username]/page.tsx`, `data.ts` | `profiles.avatar_url`, bucket `avatars` + policies, vue `contributors` |
| Bio publique | `src/app/profile/page.tsx`, `src/app/u/[username]/page.tsx`, `OwnerPrivate.tsx`, `data.ts` (`loadProfile`) | `profiles.bio_public` |
| Parcours (CV / Portfolio) | `CvEditor.tsx`, `CvTimeline.tsx`, `OwnerPrivate.tsx`, `src/lib/cv.ts`, `profile/page.tsx`, `u/[username]/page.tsx`, `data.ts` | `profiles.cv`, `profiles.cv_public` |
| Boutons GitHub / Portfolio | `src/app/u/[username]/page.tsx` | colonnes existantes `github_url`, `website_url` |

Lectures qui tolèrent l'absence des colonnes : `select('*')` (annonces, profils, vue `contributors`) ou, pour `avatar_url` imbriqué dans `profiles(...)`, une première tentative avec la colonne puis une seconde sans elle si Supabase répond « colonne inconnue » (`src/lib/data.ts`, fonction `withAvatar`).

## 5. Comportement sans migration (état actuel)

- `/publier` : l'envoi retente sans `start_date`, `end_date`, `country` si Supabase répond `42703` / `PGRST204` ; si le membre avait rempli ces champs, il voit « Annonce publiée, mais certaines options (dates, pays) ne sont pas encore activées côté serveur ».
- `/profile` : même principe pour `bio_public`, `cv`, `cv_public` (message « Certaines options ne sont pas encore activées côté serveur »). Sans la colonne `bio_public`, toutes les bios sont considérées privées, donc masquées aux visiteurs.
- Photo : bucket absent → « Le stockage des photos n'est pas encore activé côté serveur » ; refus RLS / 403 → message demandant de se reconnecter ; colonne `avatar_url` absente → message d'options non activées. Le formulaire reste utilisable dans tous les cas.

## 6. Sitemap

`src/app/sitemap.ts` ne liste plus que les pages publiques depuis `src/proxy.ts` : `/`, `/login`, `/download` et les trois pages légales. Les questions, projets, espaces, opportunités et mentors ne sont plus indexables tant qu'ils exigent une connexion.
