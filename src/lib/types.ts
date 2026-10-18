export type QuestionRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  tags: string[];
  accepted_answer_id: string | null;
  created_at: string;
  updated_at?: string | null;
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
  updated_at?: string | null;
  profiles: { username: string; avatar_url?: string | null } | null;
};

export type CommentRow = {
  id: string;
  question_id: string;
  answer_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  profiles: { username: string; avatar_url?: string | null } | null;
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
  avatar_url: string | null;
  /** Lecture publique : `bio` et `cv` valent null tant que leur propriétaire ne les a pas rendus publics. */
  bio_public: boolean;
  cv_public: boolean;
  cv?: unknown;
};

/** Projet prêt à afficher (lecture). */
export type ProjectItem = {
  id: string;
  authorId: string | null;
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
  id?: string; title: string; meta: string; kind: string; tags: string[]; text: string; authorId?: string; author?: string; authorAvatar?: string | null;
  en?: { text: string }; flag?: string; members?: number; weekly?: number; href?: string;
  /** Opportunités : dates AAAA-MM-JJ et pays (nom français, ou `ALL` = ouvert à tous). */
  startDate?: string | null; endDate?: string | null; country?: string | null;
  /** Texte additionnel pour la recherche (ex. nom anglais d'un pays). */
  alt?: string;
};
