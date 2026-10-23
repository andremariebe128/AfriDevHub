# Audit de sécurité AfriDevHub

## Méthode et limites
- Revue complète du code web, du code Flutter, des schémas SQL v1 à v6 et de l'ancienne fonction `api`.
- Correctifs regroupés dans `Web/supabase/schema-v7-securite.sql` et dans la nouvelle fonction `Flutter/supabase/functions/api`.
- **Testé réellement** : PostgreSQL 16 avec les schémas v1 à v7 rejoués (idempotent), 111 contrôles d'attaque SQL en tant que rôles `anon`/`authenticated` ; chaîne complète fonction Deno → PostgREST 12 → PostgreSQL, 105 scénarios (droits, injections, validations, confidentialité, suppression de compte) ; vérification de types TypeScript en mode strict.
- **Non testé ici** : la plateforme Supabase réelle (Auth, Storage, passerelle), les réglages du tableau de bord, le build Flutter (pas de compilateur Dart disponible : seule une vérification syntaxique a été faite). Un pentest « complet et intégral » sans accès à l'instance de production n'est pas honnête à promettre : refaire un test sur l'environnement déployé avant publication.

## Failles trouvées et corrigées
| # | Gravité | Faille | Correction |
|---|---|---|---|
| 1 | Critique | La fonction utilisait une clé de service : la RLS était contournée, un oubli de filtre exposait ou modifiait tout | Plus aucune clé de service ; client sous l'identité de l'appelant |
| 2 | Critique | Le score des réponses et la réputation pouvaient être falsifiés | Score calculé par triggers ; colonnes sensibles non modifiables |
| 3 | Haute | Auto-vote et auto-notation | Interdits en base |
| 4 | Haute | Bio et CV lisibles par tous via `select('*')` | Privilèges par colonne, vues `profiles_public` / `profiles_me`, opt-in du membre |
| 5 | Haute | Usurpation de pseudo (admin, support…) et pseudos abusifs | Liste de pseudos réservés, format, unicité insensible à la casse |
| 6 | Moyenne | Tailles de champs illimitées | Contraintes en base et validation côté fonction |
| 7 | Moyenne | Aucune limite de débit | Limites en base (triggers) et en mémoire par IP et par utilisateur |
| 8 | Moyenne | Listage des fichiers du stockage | Politiques de stockage par dossier utilisateur |
| 9 | Moyenne | Messages SQL bruts renvoyés au client | Erreurs normalisées, détails seulement dans les journaux |
| 10 | Moyenne | Injection de jokers LIKE / filtres | Échappement, listes blanches |
| 11 | Moyenne | Pas de suppression de compte, signalement ni blocage (exigés par les stores) | `delete_my_account()`, `export_my_data()`, `reports`, `user_blocks` |
| 12 | Faible | CORS ouvert | Origines explicites via `ALLOWED_ORIGINS` |
| 13 | Moyenne | `avatar_url` et `cover_url` acceptaient n'importe quelle adresse https (image externe, dossier d'un autre membre) via l'API REST directe | Contraintes `profiles_avatar_own` et `projects_cover_own` : uniquement le stockage de l'application, dossier du membre |
| 14 | Moyenne | Spam de notifications : retirer puis remettre un vote (ou une acceptation) en boucle inondait un autre membre | Trigger `dedupe_notification` : pas de doublon non lu |
| 15 | Moyenne | Suppression de compte : la suppression SQL de `storage.objects` peut laisser les fichiers lisibles par URL | Les fichiers sont d'abord retirés par l'API de stockage (web et fonction `api`) |
| 16 | Moyenne | Aucun plafond de fichiers envoyés par membre (remplissage du stockage) | Politiques d'envoi : 10 avatars, 100 couvertures, 300 images de messages |
| 17 | Faible | Recherche web : jokers `%` `_` non échappés, longueur illimitée | Échappement et limite à 100 caractères |
| 18 | Faible | URL du site par défaut de l'app Flutter incohérente avec le web | Alignée sur `https://afridevhub.vercel.app` (à régler via `SITE_URL`) |

## Examiné sans rien trouver
XSS (le Markdown ignore le HTML brut, filtre liens et images ; seul `ThemeScript` utilise `dangerouslySetInnerHTML`, avec un nonce), redirections ouvertes (`safeNext` côté web et Flutter), contournement du proxy par encodage de chemin, CSP et en-têtes, service worker (aucune page privée en cache), secrets (seules des clés `anon`, publiques par conception), injection dans les filtres PostgREST, fonctions `security definer` (toutes avec `search_path` fixé, exécution retirée à `anon`), cache et file d'attente hors ligne Flutter (liés à l'identifiant du compte, vidés à la déconnexion), liens et images externes dans l'app (schémas et origines filtrés), configuration Android (`allowBackup` et trafic en clair désactivés).

Notifications en temps réel (v8) : Realtime ne diffuse que les lignes que la politique RLS autorise (`user_id = auth.uid()`), le canal est de plus filtré côté client sur l'identifiant de l'utilisateur. Aucune donnée d'un autre compte ne transite.

## Limites connues (acceptées)
- Le blocage d'un membre masque son contenu côté application ; il n'est pas appliqué par la base (il n'existe pas de messagerie privée à protéger).
- Les signalements sont consultables seulement via le tableau de bord Supabase (pas d'interface de modération).
- `style-src 'unsafe-inline'` reste dans la CSP (nécessaire au rendu actuel) ; les scripts, eux, exigent un nonce.

## Actions manuelles à faire dans Supabase (je n'ai pas accès à votre projet)
1. Exécuter `schema-v7-securite.sql` après v6 (SQL Editor).
2. Déployer : `supabase functions deploy api`. Secret facultatif : `ALLOWED_ORIGINS` (domaines du site web, séparés par des virgules).
3. Authentication : confirmation d'e-mail activée, longueur minimale du mot de passe ≥ 8, protection contre les mots de passe compromis activée, limites de débit vérifiées, URL de redirection limitées à vos domaines, CAPTCHA activé si possible.
4. Vérifier qu'aucune clé `service_role` n'est présente dans le web ni dans l'app.
