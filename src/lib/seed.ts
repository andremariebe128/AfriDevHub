export type Item = { title: string; meta: string; kind: string; tags: string[]; text: string; author?: string };

export const COUNTRY_FLAGS: Record<string, string> = { 'Bénin': '🇧🇯', 'Sénégal': '🇸🇳', 'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Côte d’Ivoire': '🇨🇮', 'Cameroun': '🇨🇲', 'Kenya': '🇰🇪', 'Rwanda': '🇷🇼', 'Maroc': '🇲🇦', 'Égypte': '🇪🇬', 'Afrique du Sud': '🇿🇦', 'RD Congo': '🇨🇩' };

export const COUNTRIES = ['Bénin','Nigeria','Sénégal','Côte d’Ivoire','Cameroun','Ghana','Kenya','Rwanda','Maroc','Égypte','Afrique du Sud','RD Congo'];

export const SPACES: Item[] = [
  ...COUNTRIES.map((c) => ({ title: `#${c.toLowerCase().replace(/[’ ]/g, '-')}`, meta: 'Espace pays', kind: 'Pays', tags: [c], text: `Échanges, entraide et bons plans des devs de ${c}.` })),
  ...['PHP / Laravel','JavaScript / Next.js','Flutter','Python / IA','Embarqué / IoT','DevOps','Mobile Money & paiements','Data & Big Data'].map((t) => ({ title: `#${t.toLowerCase().replace(/[^a-z]+/g, '-')}`, meta: 'Espace techno', kind: 'Techno', tags: [t], text: `Questions, retours d’expérience et ressources autour de ${t}.` })),
];

// Exemples de démonstration : à remplacer par la table Supabase `opportunities`.
export const OPPS: Item[] = [
  { title: 'Coupe d’Afrique des Développeurs (CADEV)', meta: 'Systalink · en ligne', kind: 'Hackathon', tags: ['Concours','Afrique'], text: 'Compétition continentale : construis, présente, fais voter.' },
  { title: 'Stage développeur web junior', meta: 'Exemple · Cotonou', kind: 'Stage', tags: ['PHP','JavaScript'], text: 'Exemple d’offre : 3 à 6 mois, mentorat inclus.' },
  { title: 'Meetup Flutter & Supabase', meta: 'Exemple · en ligne', kind: 'Événement', tags: ['Flutter','Supabase'], text: 'Exemple d’événement : démos de 10 minutes, questions ouvertes.' },
  { title: 'Mission freelance : API de paiement Mobile Money', meta: 'Exemple · à distance', kind: 'Freelance', tags: ['API','Paiement'], text: 'Exemple de mission courte pour dev backend confirmé.' },
];

export const MENTORS: Item[] = [
  { title: 'Mentor Backend & Architecture', meta: 'Exemple · FR/EN', kind: 'Mentor', tags: ['PHP','PostgreSQL'], text: 'Relecture de schémas, choix d’architecture, premiers déploiements.' },
  { title: 'Mentor Mobile', meta: 'Exemple · FR', kind: 'Mentor', tags: ['Flutter','PWA'], text: 'De l’idée à l’APK ou à la PWA installable.' },
  { title: 'Mentor IA & Data', meta: 'Exemple · FR/EN', kind: 'Mentor', tags: ['Python','ML'], text: 'Modèles légers, datasets locaux, compétitions.' },
  { title: 'Cherche collaborateur UI/UX', meta: 'Exemple · projet', kind: 'Collab', tags: ['Figma','Tailwind'], text: 'Projet open source en quête d’un œil design.' },
];
