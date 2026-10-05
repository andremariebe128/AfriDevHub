export type Item = { title: string; meta: string; kind: string; tags: string[]; text: string; author?: string; en?: { text: string }; flag?: string; members?: number; weekly?: number };

export const COUNTRY_CODES: Record<string, string> = { 'Bénin': 'BJ', 'Sénégal': 'SN', 'Nigeria': 'NG', 'Ghana': 'GH', 'Côte d’Ivoire': 'CI', 'Cameroun': 'CM', 'Kenya': 'KE', 'Rwanda': 'RW', 'Maroc': 'MA', 'Égypte': 'EG', 'Afrique du Sud': 'ZA', 'RD Congo': 'CD' };

export const COUNTRIES = ['Bénin','Nigeria','Sénégal','Côte d’Ivoire','Cameroun','Ghana','Kenya','Rwanda','Maroc','Égypte','Afrique du Sud','RD Congo'];

const COUNTRY_TEXT: Record<string, [string, string, number, number]> = {
  'Bénin': ['Cotonou et Porto-Novo : Laravel, MTN MoMo et Moov Money, premiers jobs et meetups.', 'Cotonou and Porto-Novo: Laravel, MTN MoMo and Moov Money, first jobs and meetups.', 214, 38],
  'Nigeria': ['Lagos et Abuja : fintech, Paystack et Flutterwave, travail à distance pour des équipes étrangères.', 'Lagos and Abuja: fintech, Paystack and Flutterwave, remote work for foreign teams.', 612, 91],
  'Sénégal': ['Dakar : Wave et Orange Money, Flutter, communauté étudiante des écoles d’ingénieurs.', 'Dakar: Wave and Orange Money, Flutter, the engineering schools’ student community.', 287, 44],
  'Côte d’Ivoire': ['Abidjan : DevOps, Wave, Orange Money et MTN MoMo, startups et grands groupes.', 'Abidjan: DevOps, Wave, Orange Money and MTN MoMo, startups and large companies.', 246, 41],
  'Cameroun': ['Douala et Yaoundé : développeurs bilingues FR/EN, data, Orange Money et MTN MoMo.', 'Douala and Yaoundé: bilingual FR/EN developers, data, Orange Money and MTN MoMo.', 198, 29],
  'Ghana': ['Accra : MTN MoMo, sous-traitance, hubs tech et IA appliquée aux langues locales.', 'Accra: MTN MoMo, outsourcing, tech hubs and AI applied to local languages.', 233, 36],
  'Kenya': ['Nairobi : M-Pesa et API Daraja, Go et PHP, open source et hackathons.', 'Nairobi: M-Pesa and the Daraja API, Go and PHP, open source and hackathons.', 405, 63],
  'Rwanda': ['Kigali : services publics numériques, React et Next.js, programmes d’accélération.', 'Kigali: digital public services, React and Next.js, accelerator programmes.', 121, 17],
  'Maroc': ['Casablanca et Rabat : Django, NLP de l’arabe et de la darija, offshoring vers l’Europe.', 'Casablanca and Rabat: Django, Arabic and Darija NLP, offshoring to Europe.', 330, 52],
  'Égypte': ['Le Caire : embarqué, IoT, Python, grandes équipes d’ingénierie et freelances.', 'Cairo: embedded, IoT, Python, large engineering teams and freelancers.', 372, 58],
  'Afrique du Sud': ['Johannesburg et Le Cap : Rust, Go, cloud, coupures d’électricité et énergie solaire.', 'Johannesburg and Cape Town: Rust, Go, cloud, load shedding and solar power.', 289, 47],
  'RD Congo': ['Kinshasa et Lubumbashi : Android, PWA hors ligne, connexions instables, Airtel Money.', 'Kinshasa and Lubumbashi: Android, offline PWAs, unstable connections, Airtel Money.', 96, 12],
};

const TECH: [string, string, string, number, number][] = [
  ['PHP / Laravel', 'Files d’attente, webhooks de paiement idempotents, déploiement sur VPS à bas coût.', 'Queues, idempotent payment webhooks, low-cost VPS deployment.', 341, 57],
  ['JavaScript / Next.js', 'Rendu serveur, cache, performance sur réseaux 3G et téléphones d’entrée de gamme.', 'Server rendering, caching, performance on 3G networks and entry-level phones.', 428, 72],
  ['Flutter', 'Applications offline-first, synchronisation avec Supabase, publication sur Play Store.', 'Offline-first apps, Supabase sync, Play Store publishing.', 276, 49],
  ['Python / IA', 'Modèles légers, quantification, jeux de données en langues africaines.', 'Light models, quantisation, African-language datasets.', 254, 40],
  ['Embarqué / IoT', 'ESP32, MQTT, capteurs solaires, tolérance aux coupures Wi-Fi.', 'ESP32, MQTT, solar sensors, tolerance to Wi-Fi drops.', 112, 15],
  ['DevOps', 'CI/CD, conteneurs, supervision, réduire la facture cloud.', 'CI/CD, containers, monitoring, cutting the cloud bill.', 203, 33],
  ['Mobile Money & paiements', 'Wave, Orange Money, MTN MoMo, M-Pesa : intégrations, réconciliation, litiges.', 'Wave, Orange Money, MTN MoMo, M-Pesa: integrations, reconciliation, disputes.', 389, 66],
  ['Data & Big Data', 'Nettoyage de gros fichiers, SQL, pipelines pour la santé et l’agriculture.', 'Cleaning large files, SQL, pipelines for health and agriculture.', 167, 25],
];

export const SPACES: Item[] = [
  ...COUNTRIES.map((c) => {
    const [fr, en, members, weekly] = COUNTRY_TEXT[c];
    return { title: c, meta: 'Espace pays', kind: 'Pays', tags: [], text: fr, en: { text: en }, flag: c, members, weekly } as Item;
  }),
  ...TECH.map(([name, fr, en, members, weekly]) => ({ title: name, meta: 'Espace techno', kind: 'Techno', tags: [], text: fr, en: { text: en }, members, weekly } as Item)),
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
