# AfriDevHub — Cahier des charges opérationnel

**Concours :** CADEV (Systalink) · **Version :** 1.0 du 4 octobre 2026 · **Date limite :** 31 octobre 2026 (27 jours)
**Équipe :** 2 personnes · **Slogan :** La communauté des développeurs africains : apprendre, partager, collaborer.

---

## 1. Objectif et critères de réussite

AfriDevHub est la plateforme d'échange des développeurs africains : poser des questions, partager ses projets, trouver des mentors et collaborateurs, accéder aux opportunités du continent (stages, hackathons, événements). Elle est web responsive et installable en PWA, pensée pour les connexions limitées, l'usage mobile et le bilinguisme FR/EN.

**Ce que le jury note, et comment on y répond :**

| Critère | Poids | Ce qu'il faut démontrer | Actions du cahier |
|---|---|---|---|
| Pertinence et utilité | 25 % | Le problème (devs dispersés, réalités locales ignorées) est réel et la solution y répond | Parcours complet sans trou (§4), données de démo crédibles (§9), pitch (§10) |
| Qualité technique | 30 % | Architecture, robustesse, sécurité, qualité du code, **maîtrise de l'équipe** (y compris sur le code produit avec l'IA), **conformité des licences** | §5, §6, audit de licences, revue de code expliquée (§8) |
| UX et ergonomie | 20 % | Fidélité à la maquette, mobile d'abord, accessibilité | §4 (UX), tests mobiles (§8) |
| Innovation et originalité | 15 % | Mode éco data, pouls du continent, espaces pays/techno, opportunités locales | §4.5, §4.8 |
| Vote du public | 10 % (bonus plafonné) | Page partageable, message simple | §4.10, §10 |

**Point d'attention :** le critère technique exige que l'équipe maîtrise tout ce qui est livré, y compris les parties générées avec l'IA. Chaque membre doit pouvoir expliquer l'architecture, le schéma de base, les règles de sécurité et n'importe quel fichier. Ce point est planifié dans le calendrier (§7).

---

## 2. Périmètre

**Dans le périmètre (obligatoire pour la démo) :** comptes, profils, questions/réponses/votes, projets avec notes, espaces par pays et par techno avec discussions, opportunités, mentors et collaborateurs, FR/EN, PWA, mode éco data.

**Souhaitable si le temps le permet :** notifications utiles, signalement/modération, page de partage soignée, filtres avancés.

**Hors périmètre (à ne pas promettre) :** paiement intégré, messagerie privée temps réel, application native Android/iOS, système de réputation avancé avec badges.

---

## 3. Utilisateurs

| Profil | Besoin principal | Parcours clé |
|---|---|---|
| Étudiant / junior | Poser une question, trouver un mentor, un stage | Inscription → question → réponse reçue → demande de mentor |
| Développeur confirmé | Aider, être visible, recruter | Répondre → projet publié → profil consulté |
| Freelance | Missions, réseau pays | Profil « ouvert aux missions » → opportunité contactée |
| Startup tech | Recruter, trouver des collaborateurs | Publier une offre → voir les profils par stack/pays |
| Visiteur (jury, public) | Comprendre en 1 minute | Accueil → fil → projet → vote/partage |

---

## 4. Exigences fonctionnelles

**Légende état :** ✅ fait · 🟡 partiel · ⬜ à faire. **Priorité :** M = obligatoire, S = souhaitable.

### 4.1 Comptes et authentification
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-01 | Inscription email + mot de passe, pseudo unique (3 caractères min.) | M | ✅ |
| F-02 | Connexion / déconnexion, session persistante | M | ✅ |
| F-03 | Confirmation d'email avec redirection vers le site déployé | M | 🟡 (à régler dans Supabase Auth) |
| F-04 | Réinitialisation du mot de passe | S | ⬜ |

### 4.2 Profils développeurs
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-10 | Profil : nom, pseudo, pays, bio, stack, GitHub, titre, site, langues, expérience, « ouvert à » (mentor, collab, missions) | M | ✅ |
| F-11 | Profil public `/u/pseudo` : activité, projets, réputation | M | ✅ |
| F-12 | Barre de complétion du profil | S | ✅ |
| F-13 | Avatar : initiales (pas de photo) ; option photo | S | 🟡 |

### 4.3 Questions et réponses
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-20 | Poser une question (titre ≥ 10, détails ≥ 20, 5 tags max, Markdown) | M | ✅ |
| F-21 | Liste, recherche par titre, filtre par tag | M | ✅ |
| F-22 | Répondre, voter pour/contre, accepter une réponse | M | ✅ |
| F-23 | Question marquée « résolue » | M | ✅ |
| F-24 | Filtre par pays de l'auteur | S | ⬜ |

### 4.4 Projets
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-30 | Publier un projet (titre, description, lien, tags) | M | ✅ |
| F-31 | Hub « Explorez Projets » : grille, filtres stack et pays | M | ✅ |
| F-32 | Notation 1 à 5 étoiles (un vote par membre) | M | ✅ (SQL v4 à exécuter) |
| F-33 | Image de couverture : champ dans le formulaire | S | ⬜ |
| F-34 | Bouton « Contacter créateur » vers le profil | M | ✅ |

### 4.5 Espaces par pays et par technologie  ← **écart principal avec le pitch**
Aujourd'hui `/espaces` est un annuaire de 20 espaces **sans discussion**. Le pitch promet des « espaces de discussion ».

| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-40 | Chaque espace a sa page `/espaces/[slug]` avec le fil des questions liées | M | ⬜ |
| F-41 | Espace techno = questions portant le tag correspondant ; espace pays = questions des membres de ce pays | M | ⬜ |
| F-42 | Bouton « Poser une question dans cet espace » (tag ou pays pré-rempli) | M | ⬜ |
| F-43 | Nombre de questions affiché sur chaque carte d'espace | S | ⬜ |

*Choix de conception retenu : pas de nouvelle table de messages. Un espace est une vue filtrée sur les questions existantes, ce qui limite le risque et le temps de développement.*

### 4.6 Opportunités, mentors, collaborateurs
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-50 | Annuaire opportunités (stage, hackathon, événement, freelance) avec recherche et filtre | M | ✅ |
| F-51 | Publication par un membre connecté (table `listings`) | M | ✅ |
| F-52 | Annuaire mentors et collaborateurs, bouton vers le profil de l'auteur | M | ✅ |
| F-53 | Remplacer les entrées « Exemple » par des données réelles | M | ⬜ |
| F-54 | Date limite et lien externe sur une opportunité | S | ⬜ |
| F-55 | Modifier/supprimer sa propre publication depuis l'interface | S | ⬜ |

### 4.7 Langues
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-60 | Bascule FR/EN persistante (cookie), toute l'interface traduite | M | ✅ |
| F-61 | Messages d'erreur renvoyés par Supabase traduits | S | ⬜ |
| F-62 | Le contenu publié par les membres n'est pas traduit (assumé, à dire au jury) | — | — |

### 4.8 Réalités locales (différenciation)
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-70 | Mode éco data : coupe animations et décor, mémorisé, bandeau « Mode Lite » | M | ✅ |
| F-71 | PWA installable, page hors-ligne, indicateur hors ligne | M | 🟡 (vérifier le cache réel, §8) |
| F-72 | Consultation hors-ligne des dernières questions déjà vues | S | ⬜ |
| F-73 | « Pouls du continent » (aperçu d'activité par pays) : brancher sur de vraies données | S | 🟡 (illustratif) |

### 4.9 Notifications
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-80 | Page notifications : réponse à ma question, réponse acceptée | S | ⬜ (page vide) |
| F-81 | Si F-80 non fait : retirer la cloche ou l'assumer comme « bientôt » | M | 🟡 |

### 4.10 Visibilité et vote du public
| ID | Exigence | Priorité | État |
|---|---|---|---|
| F-90 | Métadonnées de partage (titre, description, image) sur l'accueil et les pages publiques | M | 🟡 |
| F-91 | Sitemap et robots | S | ✅ |
| F-92 | Lien court à partager + message prêt à copier | M | ⬜ |

---

## 5. Exigences non fonctionnelles

### 5.1 Performance (cibles, à mesurer avec Lighthouse sur profil mobile)
- Performance ≥ 85 sur l'accueil, la liste des questions et le hub projets.
- Chargement initial fluide sur connexion lente (3G rapide simulée) ; pas d'image lourde non optimisée.
- Mode éco data : aucune animation, pas de décor.

### 5.2 Sécurité
| ID | Exigence | Vérification |
|---|---|---|
| S-01 | Row Level Security activée sur **toutes** les tables ; politiques minimales (lire = public, écrire = propriétaire) | Relire chaque `create policy` ; tester avec un 2ᵉ compte |
| S-02 | Aucune clé secrète côté client : seule la clé `anon` est exposée, jamais `service_role` | Recherche dans le code et les variables |
| S-03 | Markdown affiché sans HTML brut (pas de XSS) | Test avec `<script>` et `<img onerror>` dans une réponse |
| S-04 | Liens externes en `rel="noopener noreferrer"`, seuls `http(s)` acceptés | Déjà appliqué, à re-tester |
| S-05 | Validation des champs côté client **et** contraintes SQL | Contraintes `check` du schéma |
| S-06 | En-têtes de sécurité (CSP, X-Frame-Options, Referrer-Policy) | Test sur securityheaders.com |
| S-07 | Limitation d'abus (anti-spam sur publication) | Option : limite côté Supabase ou délai par utilisateur |

### 5.3 Qualité du code et licences
- `tsc --noEmit` et `next build` sans erreur à chaque livraison.
- README clair : installation, variables, ordre des SQL, architecture, choix techniques.
- **Audit de licences** : `npx license-checker --summary` et conserver le rapport. La police Poppins est sous licence OFL. Le logo appartient à l'équipe. Aucune image ou icône sans droits.
- **Transparence IA** : mentionner dans le README que l'IA a assisté le développement et que l'équipe a relu et compris le code (le critère l'évalue).

### 5.4 Accessibilité et compatibilité
- Contrastes AA, navigation clavier, `aria-label` sur les icônes, `lang` correct.
- Navigateurs : Chrome Android (priorité), Safari iOS, Chrome/Edge/Firefox bureau.
- Écrans testés : 360 px, 390 px, 768 px, 1280 px.

### 5.5 Données personnelles
- Collecter le minimum : email, pseudo, pays, informations de profil volontaires.
- Page « Confidentialité » courte (données collectées, finalité, contact de suppression). Vérifier les obligations du droit applicable au Bénin avant la soumission.

---

## 6. Architecture technique

```
Navigateur / PWA  ──►  Next.js 16 (App Router, React, Tailwind)
                          │  pages serveur (lecture) + composants client (actions)
                          ▼
                       Supabase : Postgres + Auth + Row Level Security
```

- **Front :** Next.js, TypeScript, Tailwind, Poppins embarquée, service worker.
- **Données :** `schema.sql` (socle : profils, questions, réponses, votes, projets) puis `schema-v2.sql` (`listings`), `schema-v3.sql` (profils enrichis), `schema-v4.sql` (notes et couverture).
- **i18n :** dictionnaire unique `src/lib/i18n.ts`, langue en cookie.
- **Hébergement :** à décider (Vercel est le plus simple). La gestion du service actif chez Systalink reste de ton côté ; **à confirmer dans le règlement** : une URL externe est-elle acceptée, et quelle preuve demander.

**Variables d'environnement :** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Toute modification impose un redéploiement.

---

## 7. Calendrier jusqu'au 31 octobre

| Période | Objectif | Livrables / critère de sortie |
|---|---|---|
| **S1 · 4–10 oct** | Mise en ligne réelle | Projet Supabase créé, 4 SQL exécutés dans l'ordre, clés en place, site déployé, inscription → question → réponse testés en ligne. Auth : URL du site configurée. |
| **S2 · 11–17 oct** | Combler l'écart du pitch | Espaces avec discussions (F-40 à F-42), notifications ou retrait de la cloche (F-80/81), couverture projet (F-33), vraies opportunités (F-53) |
| **S3 · 18–24 oct** | Robustesse et sécurité | Passage de la liste S-01 à S-07, tests de bout en bout, audit de licences, Lighthouse, correctifs mobiles, page confidentialité |
| **S4 · 25–31 oct** | Finition et soumission | **Gel du code le mer. 28 oct**. 29 : vidéo, pitch, README final, dossier. 30 : soumission. **31 : marge de sécurité uniquement.** |

**Répartition suggérée (2 personnes) :** une personne porte le fonctionnel (espaces, opportunités, notifications), l'autre la qualité (sécurité, tests, licences, documentation, démo). Chaque semaine, chacun présente à l'autre un module qu'il n'a pas écrit : c'est l'entraînement à la « maîtrise de l'équipe ».

---

## 8. Tests et recette

**Scénarios de bout en bout à passer, en ligne, sur un vrai téléphone :**
1. Inscription → confirmation d'email → connexion.
2. Compléter le profil → ouvrir son profil public.
3. Poser une question avec tags → recevoir une réponse d'un 2ᵉ compte → voter → accepter.
4. Publier un projet → le noter avec un autre compte → filtrer par stack et par pays.
5. Ouvrir un espace pays et un espace techno → y poser une question.
6. Publier une opportunité et un profil mentor → cliquer vers le profil de l'auteur.
7. Basculer FR ↔ EN sur toutes les pages.
8. Activer le mode éco data ; couper le réseau : l'indicateur hors ligne et la page hors-ligne apparaissent.
9. Installer la PWA depuis Chrome Android.
10. Sécurité : un compte ne peut ni modifier ni supprimer les données d'un autre.

**Définition de « terminé » pour une fonctionnalité :** elle marche en ligne, en FR et en EN, sur 360 px, sans erreur console, avec un test manuel noté dans le journal de recette.

**Contrôles avant gel (28 oct) :** build propre, Lighthouse relevé, rapport de licences, relecture des politiques RLS, aucun secret dans le dépôt, README à jour.

---

## 9. Données de démonstration

La démo est obligatoire : elle ne doit jamais être vide.
- Créer 6 à 8 comptes de test (pays et stacks variés) et au moins : 12 questions dont 4 résolues, 6 projets notés, 8 opportunités réelles, 4 mentors.
- Contenu **réel ou clairement identifié comme exemple** : ne pas inventer d'organisations ni d'événements existants.
- Garder un jeu de comptes de test pour la vidéo, séparé des comptes personnels.

---

## 10. Livrables de soumission

| Livrable | Contenu |
|---|---|
| URL publique | Application en ligne, testée sur mobile |
| Dépôt de code | Propre, README, licence du projet, historique lisible |
| Documentation | Ce cahier, schéma de base, guide d'installation, rapport de licences |
| Vidéo de démo (2–3 min) | Problème → parcours principal → mode éco data → FR/EN → PWA |
| Pitch | One-liner : « La communauté des développeurs africains : apprendre, partager, collaborer. » + problème, cible, 5 fonctionnalités |
| Message pour le vote public | Texte court et lien à copier (F-92) |

**À confirmer dans le règlement CADEV :** format exact du dossier, hébergement attendu, durée de la vidéo, déclaration de l'usage de l'IA, fonctionnement du vote public, droits sur le code.

---

## 11. Risques

| Risque | Probabilité | Impact | Réponse |
|---|---|---|---|
| Déploiement tardif révélant des bugs (clés, redirections d'email) | Élevée | Élevé | Tout mettre en ligne en S1 |
| Écart pitch / produit (espaces sans discussion) | Certaine aujourd'hui | Élevé | F-40 à F-42 en S2 |
| L'équipe ne sait pas expliquer le code généré | Moyenne | Élevé (30 % du score) | Revues croisées hebdomadaires, README d'architecture |
| Règles RLS trop ouvertes ou trop fermées | Moyenne | Élevé | Tests avec 2 comptes (S-01) |
| Application vide pendant la démo | Moyenne | Élevé | Données de démo (§9) |
| Dépassement de calendrier | Moyenne | Moyen | Gel le 28 oct, souhaitables sacrifiables |
| Problème de licence (image, police, bibliothèque) | Faible | Moyen | Audit en S3 |

---

## 12. Prochaines actions (cette semaine)

1. Créer le projet Supabase et exécuter dans l'ordre `schema.sql`, `schema-v2.sql`, `schema-v3.sql`, `schema-v4.sql`.
2. Renseigner les variables d'environnement et déployer ; régler l'URL du site dans Supabase Auth.
3. Dérouler les scénarios 1 à 4 du §8 en ligne et noter chaque bug.
4. Lire le règlement CADEV et trancher les points du §10.
5. Démarrer F-40 (page d'un espace) dès que l'application est en ligne.
