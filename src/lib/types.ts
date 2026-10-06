export type QuestionRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  tags: string[];
  accepted_answer_id: string | null;
  created_at: string;
  profiles: { username: string; country: string | null } | null;
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
  profiles: { username: string } | null;
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
};

/** Projet prêt à afficher (lecture), qu'il vienne de Supabase ou des données de démonstration. */
export type ProjectItem = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  cover: string | null;
  tags: string[];
  username: string | null;
  country: string | null;
  avg: number;
  count: number;
};

export type Loaded<T> = { data: T; demo: false; error?: boolean };

/** Ligne d'annuaire (espaces, opportunités, mentors). */
export type Item = { title: string; meta: string; kind: string; tags: string[]; text: string; author?: string; en?: { text: string }; flag?: string; members?: number; weekly?: number; href?: string };

