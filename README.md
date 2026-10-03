# AfriDevHub - application 100 % web (PWA)

Plateforme d'échange des développeurs africains. Une seule application web, installable sur téléphone comme une app (PWA), sans Play Store ni APK.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS 3 · Supabase (PostgreSQL, Auth) · react-markdown

## Pages
| Route | Rôle |
|---|---|
| `/` | Landing : présentation, bouton « Installer l'app », dernières questions |
| `/questions` | Liste, recherche, filtre par tag (rendu serveur, indexable) |
| `/questions/[id]` | Détail, réponses Markdown, votes, réponse acceptée |
| `/ask` | Poser une question (connecté) |
| `/projects` | Projets partagés + formulaire d'ajout |
| `/login` | Connexion / inscription |
| `/profile` | Modifier son profil |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | SEO et installation |

## Mobile / PWA
- Barre de navigation en bas sur téléphone, menu classique sur ordinateur.
- Bouton « Installer l'app » (Android/Chrome) ; sur iPhone : Safari > Partager > « Sur l'écran d'accueil ».
- Service worker (`public/sw.js`) : page hors ligne et cache des fichiers statiques. Actif uniquement en production (`npm run build && npm start`).

## Lancer en local
1. Supabase : créer un projet, exécuter `supabase/schema.sql` dans le SQL Editor, désactiver « Confirm email » (Authentication > Providers > Email).
2. Configurer l'environnement :
   ```bash
   cp .env.example .env.local     # URL + clé anon de Supabase
   npm install
   npm run dev                    # http://localhost:3000
   ```
3. Tester la PWA : `npm run build && npm start`, puis ouvrir http://localhost:3000 dans Chrome (l'installation est proposée).

## Tester sur téléphone (même réseau Wi-Fi)
`npm run dev -- -H 0.0.0.0`, puis ouvrir `http://IP-DE-TON-PC:3000`. L'installation PWA exige HTTPS : elle se teste sur la version déployée.

## Déployer sur Vercel
1. Pousser le projet sur GitHub, puis Vercel > New Project > importer le dépôt.
2. Variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Supabase > Authentication > URL Configuration : mettre l'URL Vercel dans « Site URL ».

## Hébergement chez Systalink (si exigé par le concours)
Next.js demande un serveur Node : `npm install && npm run build && npm start` (port 3000, derrière un proxy HTTPS). À confirmer avec les organisateurs : accès SSH, version de Node, HTTPS. Sans Node, une alternative est possible (export statique), à voir avec eux.

## Notes techniques
- Lectures publiques côté serveur (client Supabase anonyme, autorisé par RLS) : les questions sont indexables par Google.
- Actions (poser, répondre, voter, accepter) côté navigateur avec la session de l'utilisateur, protégées par RLS.

## Suite possible
Connexion GitHub (OAuth) · profils publics `/u/[pseudo]` · notifications web push · espaces par pays · multilingue FR/EN.
