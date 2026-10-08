export type QuestionRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  tags: string[];
  accepted_answer_id: string | null;
  created_at: string;
  profiles: { username: string; country: string | null; avatar_url?: string | null } | null;
  answers?: { count: number }[];
  votes?: number;
  views?: number;
};

export type AnswerRow = {
  id: string;
  author_id: string;
  body: string;
  score: number;
  created_at: string;
  profiles: { username: string; avatar_url?: string | null } | null;
};

export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  tags: string[];
  created_at: string;
  profiles: { username: string } | null;
};

export type ProfileRow = {
  id: string;
  username: string;
  full_name: string | null;
  country: string | null;
  headline: string | null;
  bio: string | null;
  stack: string[];
  languages: string[];
  years_exp: number | null;
  open_to: string[];
  github_url: string | null;
  website_url: string | null;
  /** Colonnes ajoutées par schema-v6 : absentes tant que la migration n'est pas passée. */
  avatar_url?: string | null;
  bio_public?: boolean | null;
  cv?: unknown;
  cv_public?: boolean | null;
};

/** Projet prêt à afficher (lecture). */
export type ProjectItem = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  cover: string | null;
  tags: string[];
  username: string | null;
  avatar: string | null;
  country: string | null;
  avg: number;
  count: number;
};

export type Loaded<T> = { data: T; error?: boolean };

/** Ligne d'annuaire (espaces, opportunités, mentors). */
export type Item = {
  id?: string; title: string; meta: string; kind: string; tags: string[]; text: string; author?: string; authorAvatar?: string | null;
  en?: { text: string }; flag?: string; members?: number; weekly?: number; href?: string;
  /** Opportunités : dates AAAA-MM-JJ et pays (nom français, ou `ALL` = ouvert à tous). */
  startDate?: string | null; endDate?: string | null; country?: string | null;
  /** Texte additionnel pour la recherche (ex. nom anglais d'un pays). */
  alt?: string;
};
