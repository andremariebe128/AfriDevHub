import { supabaseServer } from '@/lib/supabase';
import type { Item } from '@/lib/seed';
import { DEMO_CONTRIBUTORS, DEMO_PROFILES, DEMO_PROJECTS, DEMO_REPUTATION, DEMO_STATS, demoQuestion, demoQuestions, type Contributor } from '@/lib/demo';
import type { AnswerRow, Loaded, ProfileRow, ProjectItem, QuestionRow } from '@/lib/types';

/* ------------------------------------------------------------------
   Lectures publiques. Chaque loader retombe sur les données de démo
   quand Supabase est injoignable ou ne renvoie aucune ligne.
   (Aucune écriture ici : elles restent dans les composants clients.)
   ------------------------------------------------------------------ */

const TIMEOUT_MS = 2500;
let downUntil = 0;
const isDown = () => Date.now() < downUntil;
const markDown = () => { downUntil = Date.now() + 30_000; };

function withTimeout<T>(p: PromiseLike<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    Promise.resolve(p).then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/** Lit la table `listings` ; retombe sur les données de démo si la base est vide ou injoignable. */
export async function loadItems(section: 'space' | 'opportunity' | 'mentor', fallback: Item[]): Promise<Item[]> {
  if (isDown()) return fallback;
  try {
    const { data, error } = await withTimeout(supabaseServer().from('listings').select('*, profiles(username)').eq('section', section).order('created_at', { ascending: false }));
    if (error) markDown();
    if (error || !data?.length) return fallback;
    return data.map((r) => ({ title: r.title, meta: r.meta, kind: r.kind, tags: r.tags ?? [], text: r.body, author: r.profiles?.username }));
  } catch {
    markDown();
    return fallback;
  }
}

/* ------------------------------------------------------------ Questions */

export type Sort = 'new' | 'unanswered' | 'top';
const answersOf = (x: QuestionRow) => x.answers?.[0]?.count ?? 0;
function applySort(list: QuestionRow[], sort: Sort, limit: number): QuestionRow[] {
  if (sort === 'unanswered') list = list.filter((x) => answersOf(x) === 0);
  else if (sort === 'top') list = [...list].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0) || answersOf(b) - answersOf(a));
  return list.slice(0, limit);
}

export async function loadQuestions(opts: { q?: string; tag?: string; limit?: number; sort?: Sort } = {}): Promise<Loaded<QuestionRow[]>> {
  const { q = '', tag, limit = 50, sort = 'new' } = opts;
  const needle = q.trim().toLowerCase();
  const filtered = Boolean(needle || tag);
  const demo = (): Loaded<QuestionRow[]> => {
    let list = demoQuestions();
    if (needle) list = list.filter((x) => `${x.title} ${x.body}`.toLowerCase().includes(needle));
    if (tag) list = list.filter((x) => x.tags.includes(tag));
    return { data: applySort(list, sort, limit), demo: true };
  };
  if (isDown()) return demo();
  try {
    let query = supabaseServer().from('questions').select('*, profiles(username, country), answers(count)');
    if (needle) query = query.ilike('title', `%${q.trim()}%`);
    if (tag) query = query.contains('tags', [tag]);
    const { data, error } = await withTimeout(query.order('created_at', { ascending: false }).limit(sort === 'new' ? limit : 100));
    if (error) { markDown(); return demo(); }
    if (!data?.length && !filtered) return demo();
    return { data: applySort((data as QuestionRow[]) ?? [], sort, limit), demo: false };
  } catch {
    markDown();
    return demo();
  }
}

export async function loadQuestion(id: string): Promise<Loaded<{ question: QuestionRow; answers: AnswerRow[] } | null>> {
  if (id.startsWith('demo-')) return { data: demoQuestion(id), demo: true };
  if (isDown()) return { data: null, demo: false };
  try {
    const sb = supabaseServer();
    const { data: q, error } = await withTimeout(sb.from('questions').select('*, profiles(username, country)').eq('id', id).maybeSingle());
    if (error) { markDown(); return { data: null, demo: false }; }
    if (!q) return { data: null, demo: false };
    const { data: answers } = await withTimeout(
      sb.from('answers').select('*, profiles(username)').eq('question_id', id).order('score', { ascending: false }).order('created_at', { ascending: true }),
    );
    return { data: { question: q as QuestionRow, answers: (answers as AnswerRow[]) ?? [] }, demo: false };
  } catch {
    markDown();
    return { data: null, demo: false };
  }
}

/* -------------------------------------------------------------- Projets */

type ProjectDbRow = {
  id: string; title: string; description?: string | null; url?: string | null; cover_url?: string | null; tags?: string[] | null;
  profiles?: { username: string; country: string | null } | null; project_ratings?: { stars: number }[];
};

export async function loadProjects(): Promise<Loaded<ProjectItem[]>> {
  const demo = (): Loaded<ProjectItem[]> => ({ data: DEMO_PROJECTS, demo: true });
  if (isDown()) return demo();
  try {
    const sb = supabaseServer();
    let r = await withTimeout(sb.from('projects').select('*, profiles(username, country), project_ratings(stars)').order('created_at', { ascending: false }).limit(60));
    if (r.error) r = await withTimeout(sb.from('projects').select('*, profiles(username, country)').order('created_at', { ascending: false }).limit(60));
    if (r.error) { markDown(); return demo(); }
    const rows = (r.data ?? []) as ProjectDbRow[];
    if (!rows.length) return demo();
    const ok = (u?: string | null) => (u && /^https?:\/\//.test(u) ? u : null);
    return {
      demo: false,
      data: rows.map((p) => {
        const st = (p.project_ratings ?? []).map((x) => x.stars);
        return {
          id: p.id, title: p.title, description: p.description ?? null, tags: p.tags ?? [], url: ok(p.url), cover: ok(p.cover_url),
          username: p.profiles?.username ?? null, country: p.profiles?.country ?? null,
          avg: st.length ? st.reduce((a, b) => a + b, 0) / st.length : 0, count: st.length,
        };
      }),
    };
  } catch {
    markDown();
    return demo();
  }
}

/* --------------------------------------------------------------- Profils */

export type ProfileView = {
  profile: ProfileRow;
  questions: QuestionRow[];
  projects: { id: string; title: string; url: string | null; tags: string[] }[];
  rep: number;
};

export async function loadProfile(username: string): Promise<Loaded<ProfileView | null>> {
  const demo = (): Loaded<ProfileView | null> => {
    const profile = DEMO_PROFILES.find((p) => p.username === username);
    if (!profile) return { data: null, demo: false };
    return {
      demo: true,
      data: {
        profile,
        questions: demoQuestions().filter((q) => q.profiles?.username === username),
        projects: DEMO_PROJECTS.filter((p) => p.username === username).map(({ id, title, url, tags }) => ({ id, title, url, tags })),
        rep: DEMO_REPUTATION[username] ?? 0,
      },
    };
  };
  if (isDown()) return demo();
  try {
    const sb = supabaseServer();
    const { data: p, error } = await withTimeout(sb.from('profiles').select('*').eq('username', username).maybeSingle());
    if (error) { markDown(); return demo(); }
    if (!p) return demo();
    const [{ data: qs }, { data: pjs }, { data: ans }] = await Promise.all([
      withTimeout(sb.from('questions').select('*, profiles(username, country), answers(count)').eq('author_id', p.id).order('created_at', { ascending: false }).limit(10)),
      withTimeout(sb.from('projects').select('id, title, url, tags').eq('author_id', p.id).order('created_at', { ascending: false }).limit(10)),
      withTimeout(sb.from('answers').select('score').eq('author_id', p.id)),
    ]);
    const rep = (ans ?? []).reduce((n: number, a: { score?: number }) => n + (a.score ?? 0), 0) + (ans?.length ?? 0) * 5;
    return {
      demo: false,
      data: {
        profile: p as ProfileRow,
        questions: (qs as QuestionRow[]) ?? [],
        projects: (pjs ?? []).map((j: { id: string; title: string; url: string | null; tags: string[] | null }) => ({ id: j.id, title: j.title, url: j.url, tags: j.tags ?? [] })),
        rep,
      },
    };
  } catch {
    markDown();
    return demo();
  }
}

/* ------------------------------------------------- Chiffres et communauté */

export type Stats = { members: number; countries: number; solved: number; projects: number };

export async function loadStats(): Promise<Loaded<Stats>> {
  const demo = (): Loaded<Stats> => ({ data: DEMO_STATS, demo: true });
  if (isDown()) return demo();
  try {
    const sb = supabaseServer();
    const all = (table: string) => withTimeout(sb.from(table).select('id', { count: 'exact', head: true }));
    const [m, s, p] = await Promise.all([
      all('profiles'),
      withTimeout(sb.from('questions').select('id', { count: 'exact', head: true }).not('accepted_answer_id', 'is', null)),
      all('projects'),
    ]);
    if (m.error || s.error || p.error) { markDown(); return demo(); }
    const members = m.count ?? 0;
    const solved = s.count ?? 0;
    const projects = p.count ?? 0;
    if (!members && !solved && !projects) return demo();
    return { demo: false, data: { members, countries: DEMO_STATS.countries, solved, projects } };
  } catch {
    markDown();
    return demo();
  }
}

export async function loadContributors(limit = 5): Promise<Loaded<Contributor[]>> {
  const demo = (): Loaded<Contributor[]> => ({ data: DEMO_CONTRIBUTORS.slice(0, limit), demo: true });
  if (isDown()) return demo();
  try {
    const { data, error } = await withTimeout(supabaseServer().from('profiles').select('username, country').order('created_at', { ascending: true }).limit(limit));
    if (error) { markDown(); return demo(); }
    if (!data?.length) return demo();
    return { demo: false, data: data.map((r: { username: string; country: string | null }) => ({ username: r.username, country: r.country, rep: 0 })) };
  } catch {
    markDown();
    return demo();
  }
}
