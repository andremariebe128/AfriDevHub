# AfriDevHub

**La communauté des développeurs africains : apprendre, partager, collaborer.**

Plateforme d'échange des développeurs africains : poser des questions, partager ses projets, trouver des mentors et collaborateurs, accéder aux opportunités du continent (stages, hackathons, événements). Pensée pour les réalités locales : connexions limitées, usage mobile, contenus en français et en anglais.

| Plateforme | Technologie | Statut |
|---|---|---|
| Web + mobile installable (PWA) | Next.js · Supabase | **Livrable principal du concours** |
| Android | Flutter | Phase 2, voir §9 |
| Windows (.exe) | Flutter | Phase 2, voir §9 |

---

## 1. Stack (version web)

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Poppins (embarquée) · Supabase (PostgreSQL, Auth, Row Level Security) · react-markdown.

## 2. Pages

| Route | Rôle |
|---|---|
| `/` | Fil d'actualité (dernières questions), présentation, « pouls du continent » |
| `/questions` | Questions & Forum : recherche, filtre par tag, menu « Espaces par Pays » |
| `/questions/[id]` | Détail, réponses Markdown, votes, réponse acceptée |
| `/ask` | Poser une question |
| `/projects` | « Explorez Projets » : grille, filtres stack/pays, notes en étoiles, ajout |
| `/espaces` | Annuaire des espaces par pays et par technologie |
| `/opportunites` | Stages, hackathons, événements, freelance |
| `/mentors` | Mentors et collaborateurs |
| `/publier` | Publier une opportunité ou un profil mentor |
| `/u/[pseudo]` | Profil public |
| `/profile` | Modifier son profil |
| `/notifications` | Notifications réelles (réponse, réponse acceptée, vote) |
| `/espaces/[slug]` | Fil de questions d'un espace pays ou techno |
| `/download` | Choix de la plateforme (PWA, Android, iOS, Windows, macOS, Linux) |
| `/login` | Connexion / inscription |

Transverse : bascule **FR/EN** (cookie), **mode éco data** (⚡), indicateur hors ligne, PWA installable, thème clair uniquement.

## 3. Mise en route

### 3.1 Base de données Supabase
Créer un projet, puis exécuter **dans cet ordre** dans le SQL Editor :

1. `supabase/schema.sql` : socle (`profiles`, `questions`, `answers`, `answer_votes`, `projects`)
2. `supabase/schema-v2.sql` : `listings` (espaces, opportunités, mentors)
3. `supabase/schema-v3.sql` : profils enrichis
4. `supabase/schema-v4.sql` : `project_ratings` (étoiles) et `projects.cover_url`
5. `supabase/schema-v5.sql` : `spaces` (référentiel pays/techno), `notifications` (triggers), vue `contributors`

**Accès réservé** : sans connexion, seules `/`, `/login`, `/download` et les pages légales sont ouvertes (`src/proxy.ts`). Les liens de téléchargement se règlent via `NEXT_PUBLIC_DL_*` dans `.env`.

Ne pas rejouer un fichier déjà exécuté (les `create policy` échouent si elles existent).
Authentication > Providers > Email : en développement, désactiver « Confirm email » ; en production, garder la confirmation et renseigner l'URL du site (§5).

### 3.2 Lancer en local
```bash
cp .env.example .env.local     # URL + clé anon Supabase
npm install
npm run dev                    # http://localhost:3000
```
Variables : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Elles sont intégrées au build : tout changement impose un **redéploiement**. Ne jamais exposer la clé `service_role`.

### 3.3 Tester la PWA et le mobile
`npm run build && npm start` (le service worker n'est actif qu'en production). Sur téléphone : `npm run dev -- -H 0.0.0.0` puis `http://IP-DU-PC:3000`. L'installation PWA exige HTTPS : à tester sur la version déployée.

### 3.4 Vérifications avant livraison
```bash
npx tsc --noEmit && npx next build
npx license-checker --summary
```

## 4. Architecture

```
Navigateur / PWA ──► Next.js (pages serveur en lecture, composants client pour les actions)
Flutter Android/Windows ──┐
                          ▼
                 Supabase : Postgres + Auth + RLS   (une seule base pour tous les clients)
```
- Lectures publiques côté serveur avec la clé anon (autorisées par RLS) : questions indexables.
- Actions (poser, répondre, voter, noter, publier) côté client avec la session de l'utilisateur, protégées par RLS.
- Traductions : `src/lib/i18n.ts`. Données de démonstration : `src/lib/seed.ts` (utilisées si `listings` est vide).
- Service worker `public/sw.js` : page hors ligne et fichiers statiques.

## 5. Déploiement

**Vercel (recommandé) :** pousser sur GitHub, importer le projet, renseigner les 3 variables, déployer. Puis Supabase > Authentication > URL Configuration : mettre l'URL du site dans « Site URL » et « Redirect URLs ».

**Systalink :** le service actif est géré par l'équipe. À confirmer dans le règlement : une URL hébergée ailleurs est-elle acceptée, et quelle preuve fournir. Si un hébergement Node est exigé : `npm install && npm run build && npm start` (port 3000, derrière un proxy HTTPS).

---

# CAHIER DES CHARGES

**Concours CADEV (Systalink)** · version 2.0 du 6 octobre 2026 · **date limite : 25 octobre 2026 à 17 h 00 GMT (18 h 00 à Cotonou)** · équipe de 2 personnes.

> **Règlement CADEV : points qui changent le plan**
> - **Dépôt le 25 oct. à 17 h GMT**, pas le 31. Vote des pairs du 25 oct. 18 h au 26 oct. 23 h 59 : **chaque membre de l'équipe doit voter, sinon le projet est exclu**.
> - **Déploiement sur Datacloud obligatoire** : au moins un produit ou service Datacloud acquis et utilisé pour déployer le projet (condition de recevabilité). Un déploiement Vercel seul ne suffit pas.
> - **Licences** : GPL, AGPL, LGPL interdites. `sharp`/`libvips` (LGPL, livrés avec Next.js) sont retirés par `scripts/strip-lgpl.mjs` (lancé au `npm install`). `lightningcss` (MPL-2.0, outil de build de Tailwind) est à déclarer. Linux/Flutter : GTK est LGPL.
> - **Déclarations à la soumission** : outils d'IA utilisés et parties concernées, liste des composants tiers et de leurs licences, déclaration de titularité de chaque membre.
> - **Projet créé pendant le concours** (29 sept. – 25 oct.) ; le lauréat cède ses droits patrimoniaux à Systalink (art. 8).

## 6. Objectifs et critères du concours

| Critère | Poids | Réponse du projet |
|---|---|---|
| Pertinence et utilité | 25 % | Problème réel (devs dispersés, réalités locales ignorées) ; parcours complet ; données de démo crédibles |
| Qualité technique | 30 % | Architecture, RLS, sécurité, qualité du code, **maîtrise de l'équipe y compris sur le code produit avec l'IA**, **licences conformes** |
| Expérience utilisateur | 20 % | Fidélité à la maquette, mobile d'abord, accessibilité |
| Innovation et originalité | 15 % | Mode éco data, espaces pays/techno, opportunités locales, pouls du continent |
| Vote du public | 10 % (plafonné) | Page partageable, message simple, lien court |

L'équipe doit pouvoir expliquer l'architecture, le schéma, les règles RLS et tout fichier livré. Des revues croisées sont planifiées (§12).

## 7. Périmètre

- **Obligatoire :** comptes, profils, Q&R avec votes, projets notés, espaces avec discussions, opportunités, mentors/collaborateurs, FR/EN, PWA, mode éco data.
- **Souhaitable :** notifications, signalement, réinitialisation du mot de passe, filtres avancés.
- **Hors périmètre :** paiement, messagerie privée temps réel, système de badges, application iOS.

## 8. Exigences fonctionnelles (état au 6 octobre)

✅ fait · 🟡 partiel · ⬜ à faire · M obligatoire · S souhaitable

| ID | Exigence | P | État |
|---|---|---|---|
| F-01/02 | Inscription (pseudo unique), connexion, session persistante | M | ✅ |
| F-03 | Confirmation d'email avec bonne URL de redirection | M | 🟡 |
| F-04 | Réinitialisation du mot de passe | S | ⬜ |
| F-10 | Profil complet (pays, stack, GitHub, site, langues, expérience, « ouvert à ») | M | ✅ |
| F-11 | Profil public `/u/pseudo` | M | ✅ |
| F-13 | Photo de profil (aujourd'hui : initiales) | S | ⬜ |
| F-20/21 | Poser une question, recherche, filtre par tag | M | ✅ |
| F-22/23 | Répondre, voter, accepter, « résolue » | M | ✅ |
| F-24 | Filtre des questions par pays | S | ⬜ |
| F-30/31 | Publier un projet, hub avec filtres stack et pays | M | ✅ |
| F-32 | Notes 1 à 5 étoiles (SQL v4 à exécuter) | M | ✅ |
| F-33 | Champ « image de couverture » dans le formulaire | S | ⬜ |
| **F-40** | **Page d'un espace `/espaces/[slug]` avec son fil de questions** | M | ⬜ |
| **F-41** | Espace techno = questions du tag ; espace pays = questions des membres du pays | M | ⬜ |
| **F-42** | « Poser une question dans cet espace » (tag/pays pré-rempli) | M | ⬜ |
| F-50/51/52 | Annuaires opportunités et mentors, publication, bouton vers le profil de l'auteur | M | ✅ |
| F-53 | Remplacer les entrées « Exemple » par de vraies données | M | ⬜ |
| F-54/55 | Date limite et lien d'une opportunité ; modifier/supprimer sa publication | S | ⬜ |
| F-60 | Bascule FR/EN complète | M | ✅ |
| F-61 | Erreurs Supabase traduites | S | ⬜ |
| F-70 | Mode éco data + bandeau « Mode Lite » | M | ✅ |
| F-71 | PWA installable, page hors ligne | M | 🟡 à vérifier en production |
| F-72 | Questions déjà vues consultables hors ligne | S | ⬜ |
| F-73 | « Pouls du continent » branché sur de vraies données (aujourd'hui illustratif) | S | 🟡 |
| F-80 | Notifications (réponse reçue, réponse acceptée) | S | ⬜ |
| F-81 | Sans F-80 : retirer la cloche ou l'assumer comme « bientôt » | M | 🟡 |
| F-90/92 | Métadonnées de partage, lien court et message pour le vote public | M | 🟡 |

*Choix retenu pour F-40 à F-42 : pas de table de messages. Un espace est une vue filtrée des questions existantes (moins de risque et de temps).*

## 9. Versions Flutter : Android et Windows (.exe)

### 9.1 Ce que cela implique réellement
- Flutter n'est **pas** une conversion de l'application Next.js : c'est une **seconde application** (nouvelle interface en Dart) qui réutilise **la même base Supabase** et les mêmes règles RLS. Le code React/Tailwind ne se réutilise pas.
- Une seule base de code Flutter produit Android et Windows, mais chaque cible a ses contraintes : mise en page, navigation (barre du bas sur mobile, menu latéral sur Windows), liens d'authentification.
- **Risque calendrier :** livrer le web complet et deux clients Flutter en 25 jours à 2 personnes est ambitieux. Le dossier de concours annonçait une application web + PWA : la PWA répond déjà à « version mobile ». Les clients Flutter sont donc un **plus**, pas le livrable à sécuriser.
- **Décision go / no-go le 18 octobre :** si le web n'est pas stable à cette date, le Flutter est mis de côté pour la soumission.

### 9.2 Périmètre Flutter (version 1, volontairement réduite)
Android et Windows partagent la même liste :

| ID | Fonction | P |
|---|---|---|
| FL-01 | Connexion / inscription / déconnexion (Supabase) | M |
| FL-02 | Fil d'actualité et liste des questions, recherche, tags | M |
| FL-03 | Détail d'une question, répondre, voter, accepter | M |
| FL-04 | Poser une question | M |
| FL-05 | Hub projets avec étoiles, voir le projet, contacter le créateur | M |
| FL-06 | Profil (voir et modifier) et profil public | M |
| FL-07 | FR/EN, thème clair, identité (logo, couleurs, Poppins) | M |
| FL-08 | Espaces, opportunités, mentors (lecture) | S |
| FL-09 | Mode Lite (pas d'images distantes) et cache des dernières questions | S |
| FL-10 | Publication d'opportunités / mentors | S |

### 9.3 Choix techniques proposés
- Paquets : `supabase_flutter`, `go_router`, `flutter_riverpod`, `flutter_markdown`, `url_launcher`, `shared_preferences`, `connectivity_plus`, `flutter_localizations` + `intl` (fichiers ARB FR/EN), `google_fonts` ou police Poppins embarquée dans `assets/`.
- Structure : `lib/core` (client Supabase, thème, routeur), `lib/features/{auth,questions,projects,profile,spaces}`, `lib/l10n`.
- Les écrans reprennent la maquette : mêmes couleurs (Tech Blue `#1F6E9C`, vert `#279160`, orange `#DC722D`), mêmes composants.
- **Auth :** pour éviter les problèmes de redirection e-mail sur Android et Windows, utiliser la connexion par mot de passe avec confirmation désactivée côté mobile, ou un code à usage unique (OTP) ; les liens profonds (`io.supabase.afridevhub://login-callback`) sont une option avancée.
- **Sécurité :** uniquement la clé `anon` dans l'application ; toute règle d'accès reste dans RLS ; jamais de `service_role`.

### 9.4 Livraison des binaires
| Cible | Commande | Résultat | Remarques |
|---|---|---|---|
| Android | `flutter build apk --release` (ou `appbundle`) | `app-release.apk` | Clé de signature (keystore) à créer et sauvegarder ; test sur vrai téléphone |
| Windows | `flutter build windows --release` | dossier `Runner` avec `afridevhub.exe`, DLL et `data/` | **À construire sur Windows.** L'.exe seul ne suffit pas : distribuer le dossier complet ou créer un installateur (Inno Setup ou MSIX) |

### 9.5 Critères d'acceptation Flutter
Connexion, question posée, réponse, vote et projet noté fonctionnent contre la base de production, en FR et EN, sur un téléphone Android réel et sur un PC Windows, sans erreur au lancement ni écran blanc hors ligne.

## 10. Exigences non fonctionnelles

**Performance (cibles à mesurer avec Lighthouse, profil mobile) :** score ≥ 85 sur accueil, questions et projets ; chargement fluide sur 3G rapide ; aucune image lourde non optimisée.

**Sécurité :**
| ID | Exigence | Vérification |
|---|---|---|
| S-01 | RLS sur **toutes** les tables | Relire chaque `create policy`, tester avec 2 comptes |
| S-02 | Jamais de clé `service_role` côté client | Recherche dans le code et les variables |
| S-03 | Markdown sans HTML brut (pas de XSS) | Tester `<script>` et `<img onerror>` dans une réponse |
| S-04 | Liens externes `noopener noreferrer`, `http(s)` uniquement | Re-tester |
| S-05 | Validation client **et** contraintes SQL | Contraintes `check` |
| S-06 | En-têtes de sécurité (CSP, X-Frame-Options, Referrer-Policy) | securityheaders.com |
| S-07 | Anti-spam sur les publications | Limite par utilisateur |

**Qualité et licences :** `tsc` et `next build` propres à chaque livraison ; rapport `license-checker` conservé (Poppins sous licence OFL ; Flutter et ses paquets à auditer aussi) ; le logo appartient à l'équipe ; aucune image sans droits. **Mentionner dans ce README que l'IA a assisté le développement et que l'équipe a relu et compris le code.**

**Accessibilité et compatibilité :** contrastes AA, navigation clavier, `aria-label` sur les icônes ; Chrome Android (priorité), Safari iOS, navigateurs bureau ; écrans 360, 390, 768 et 1280 px.

**Données personnelles :** collecte minimale (e-mail, pseudo, pays, profil volontaire) ; page « Confidentialité » courte ; vérifier les obligations légales applicables au Bénin avant soumission.

## 11. Données de démonstration

La démo ne doit jamais être vide : 6 à 8 comptes de test (pays et stacks variés), au moins 12 questions dont 4 résolues, 6 projets notés, 8 opportunités réelles, 4 mentors. Contenu réel ou clairement marqué « exemple » ; ne pas inventer d'organisations ni d'événements existants.

## 12. Calendrier

| Période | Objectif | Critère de sortie |
|---|---|---|
| **6–11 oct** | Mise en ligne réelle | Projet Supabase, SQL v1 à v5 exécutés, **produit Datacloud acquis et site déployé dessus**, scénarios 1 à 4 passés en ligne |
| **12–17 oct** | Données et finitions | Vraies opportunités et mentors, premiers contenus réels, tests Flutter Android et Windows |
| **18 oct** | **Go / no-go Flutter** | Web stable ? Sinon les clients Flutter sont écartés du dossier |
| **19–21 oct** | Robustesse | Sécurité S-01 à S-07, licences, déclarations (IA, composants), vidéo de démo |
| **22 oct** | **Gel du code** | Build propre, README final |
| **23–24 oct** | Soumission | Dépôt sur la plateforme Datacloud ; le 24 sert de marge |
| **25 oct, 17 h GMT** | **Clôture** | Aucune soumission après cette heure |
| **25 oct 18 h – 26 oct 23 h 59** | Vote des pairs | **Chaque membre vote** pour un projet attribué |

## 13. Recette (en ligne, sur vrai téléphone)

1. Inscription → confirmation → connexion.
2. Compléter le profil → ouvrir le profil public.
3. Poser une question avec tags → réponse d'un 2ᵉ compte → vote → acceptation.
4. Publier un projet → le noter avec un autre compte → filtrer par stack et pays.
5. Ouvrir un espace pays et un espace techno → y poser une question.
6. Publier une opportunité et un profil mentor → ouvrir le profil de l'auteur.
7. Basculer FR ↔ EN partout.
8. Mode éco data, puis couper le réseau : indicateur hors ligne et page hors ligne.
9. Installer la PWA (Chrome Android).
10. Sécurité : un compte ne peut ni modifier ni supprimer les données d'un autre.
11. Mêmes scénarios 1 à 4 sur l'APK et sur le `.exe`.

« Terminé » = marche en ligne, en FR et EN, sur 360 px, sans erreur console, noté dans le journal de recette.

## 14. Livrables de soumission

URL publique testée sur mobile · dépôt propre avec ce README et la licence · schéma de base et rapport de licences · vidéo de démo de 2 à 3 minutes (problème, parcours, éco data, FR/EN, PWA, et APK/.exe si prêts) · pitch (one-liner, problème, cible, fonctionnalités) · message court pour le vote public.

**À confirmer dans le règlement CADEV :** format du dossier, hébergement attendu, durée de la vidéo, déclaration de l'usage de l'IA, fonctionnement du vote public, droits sur le code, et si présenter des clients Flutter en plus de la PWA est accepté.

## 15. Risques

| Risque | Probabilité | Impact | Réponse |
|---|---|---|---|
| Déploiement tardif révélant des bugs (clés, redirections) | Élevée | Élevé | Tout mettre en ligne en S1 |
| Écart pitch / produit (espaces sans discussion) | Certaine aujourd'hui | Élevé | F-40 à F-42 en S2 |
| **Trois clients (web, Android, Windows) en 25 jours** | Élevée | Élevé | Périmètre Flutter réduit, go/no-go le 18 oct, web prioritaire |
| Équipe incapable d'expliquer le code généré | Moyenne | Élevé (30 %) | Revues croisées, documentation d'architecture |
| RLS trop ouverte ou trop fermée | Moyenne | Élevé | Tests avec 2 comptes |
| Démo vide | Moyenne | Élevé | §11 |
| Authentification mobile (redirection e-mail) | Moyenne | Moyen | Mot de passe sans confirmation ou OTP côté Flutter |
| `.exe` impossible à construire hors Windows | Certaine | Moyen | Prévoir une machine Windows |
| Licences (images, polices, paquets) | Faible | Moyen | Audit en S3 |

## 16. Prochaines actions (cette semaine)

1. Créer le projet Supabase, exécuter les 4 SQL, renseigner les variables, déployer, régler l'URL du site dans Supabase Auth.
2. Dérouler les scénarios 1 à 4 en ligne et noter chaque bug.
3. Lire le règlement CADEV et trancher les points du §14.
4. Créer le projet Flutter (`flutter create afridevhub_app --platforms=android,windows`), brancher `supabase_flutter`, faire la connexion.
5. Démarrer F-40 (page d'un espace) dès que le site est en ligne.
