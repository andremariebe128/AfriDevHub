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
