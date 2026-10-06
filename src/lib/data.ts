import { supabaseServer } from '@/lib/supabase';
import type { AnswerRow, Item, Loaded, ProfileRow, ProjectItem, QuestionRow } from '@/lib/types';

/* Lectures serveur. Aucune donnée fictive : en cas d'échec, la liste est vide et `error` vaut true. */

const TIMEOUT_MS = 6000;
function withTimeout<T>(p: PromiseLike<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    Promise.resolve(p).then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
  });
}
const ok = <T,>(data: T): Loaded<T> => ({ data, demo: false });
const fail = <T,>(data: T): Loaded<T> => ({ data, demo: false, error: true });

/* ------------------------------------------------------- Annuaires (listings) */

export async function loadItems(section: 'opportunity' | 'mentor'): Promise<Item[]> {
  try {
    const { data, error } = await withTimeout(supabaseServer().from('listings').select('*, profiles(username)').eq('section', section).order('created_at', { ascending: false }).limit(100));
    if (error) return [];
    return (data ?? []).map((r) => ({ title: r.title, meta: r.meta, kind: r.kind, tags: r.tags ?? [], text: r.body, author: r.profiles?.username }));
  } catch { return []; }
}

/* ------------------------------------------------------------------ Espaces */

type SpaceRow = { slug: string; kind: 'country' | 'tech'; name: string; tag: string | null; desc_fr: string; desc_en: string };
type QAct = { tags: string[] | null; profiles: { country: string | null } | { country: string | null }[] | null };
const countryOfRow = (r: QAct) => (Array.isArray(r.profiles) ? r.profiles[0]?.country : r.profiles?.country) ?? null;

/** Espaces pays et techno (référentiel) avec compteurs calculés sur les données réelles. */
export async function loadSpaces(): Promise<Item[]> {
  try {
    const sb = supabaseServer();
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const [sp, pr, qs] = await Promise.all([
      withTimeout(sb.from('spaces').select('*').order('position')),
      withTimeout(sb.from('profiles').select('country, stack').limit(5000)),
      withTimeout(sb.from('questions').select('tags, profiles(country)').gte('created_at', since).limit(2000)),
    ]);
    if (sp.error) return [];
    const profiles = (pr.data ?? []) as { country: string | null; stack: string[] | null }[];
    const recent = (qs.data ?? []) as QAct[];
    return ((sp.data ?? []) as SpaceRow[]).map((s) => {
      const isCountry = s.kind === 'country';
      return {
        title: s.name, meta: isCountry ? 'Espace pays' : 'Espace techno', kind: isCountry ? 'Pays' : 'Techno', tags: [],
        text: s.desc_fr, en: { text: s.desc_en }, flag: isCountry ? s.name : undefined, href: `/espaces/${s.slug}`,
        members: isCountry ? profiles.filter((p) => p.country === s.name).length : profiles.filter((p) => s.tag && (p.stack ?? []).includes(s.tag)).length,
        weekly: isCountry ? recent.filter((r) => countryOfRow(r) === s.name).length : recent.filter((r) => s.tag && (r.tags ?? []).includes(s.tag)).length,
      } as Item;
    });
  } catch { return []; }
}

export async function loadSpace(slug: string): Promise<{ space: SpaceRow; questions: QuestionRow[] } | null> {
  try {
    const { data } = await withTimeout(supabaseServer().from('spaces').select('*').eq('slug', slug).maybeSingle());
    if (!data) return null;
    const space = data as SpaceRow;
    const { data: questions } = await loadQuestions(space.kind === 'country' ? { country: space.name, limit: 50 } : { tag: space.tag ?? undefined, limit: 50 });
    return { space, questions };
  } catch { return null; }
}

/* ------------------------------------------------------------ Questions */

export type Sort = 'new' | 'unanswered' | 'top';
const answersOf = (x: QuestionRow) => x.answers?.[0]?.count ?? 0;
function applySort(list: QuestionRow[], sort: Sort, limit: number): QuestionRow[] {
  if (sort === 'unanswered') list = list.filter((x) => answersOf(x) === 0);
  else if (sort === 'top') list = [...list].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0) || answersOf(b) - answersOf(a));
  return list.slice(0, limit);
}

export async function loadQuestions(opts: { q?: string; tag?: string; country?: string; limit?: number; sort?: Sort } = {}): Promise<Loaded<QuestionRow[]>> {
  const { q = '', tag, country, limit = 50, sort = 'new' } = opts;
  try {
    let query = supabaseServer().from('questions').select(`*, profiles${country ? '!inner' : ''}(username, country), answers(count)`);
    if (q.trim()) query = query.ilike('title', `%${q.trim()}%`);
    if (tag) query = query.contains('tags', [tag]);
    if (country) query = query.eq('profiles.country', country);
    const { data, error } = await withTimeout(query.order('created_at', { ascending: false }).limit(sort === 'new' ? limit : 100));
    if (error) return fail([]);
    return ok(applySort((data as unknown as QuestionRow[]) ?? [], sort, limit));
  } catch { return fail([]); }
}

export async function loadQuestion(id: string): Promise<Loaded<{ question: QuestionRow; answers: AnswerRow[] } | null>> {
  try {
    const sb = supabaseServer();
    const { data: q, error } = await withTimeout(sb.from('questions').select('*, profiles(username, country)').eq('id', id).maybeSingle());
    if (error) return fail(null);
    if (!q) return ok(null);
    const { data: answers } = await withTimeout(sb.from('answers').select('*, profiles(username)').eq('question_id', id).order('score', { ascending: false }).order('created_at', { ascending: true }));
    return ok({ question: q as QuestionRow, answers: (answers as AnswerRow[]) ?? [] });
  } catch { return fail(null); }
}

/* -------------------------------------------------------------- Projets */

type ProjectDbRow = {
  id: string; title: string; description?: string | null; url?: string | null; cover_url?: string | null; tags?: string[] | null;
  profiles?: { username: string; country: string | null } | null; project_ratings?: { stars: number }[];
};

export async function loadProjects(): Promise<Loaded<ProjectItem[]>> {
  try {
    const sb = supabaseServer();
    let r = await withTimeout(sb.from('projects').select('*, profiles(username, country), project_ratings(stars)').order('created_at', { ascending: false }).limit(60));
    if (r.error) r = await withTimeout(sb.from('projects').select('*, profiles(username, country)').order('created_at', { ascending: false }).limit(60));
    if (r.error) return fail([]);
    const safe = (u?: string | null) => (u && /^https?:\/\//.test(u) ? u : null);
    return ok(((r.data ?? []) as ProjectDbRow[]).map((p) => {
      const st = (p.project_ratings ?? []).map((x) => x.stars);
      return {
        id: p.id, title: p.title, description: p.description ?? null, tags: p.tags ?? [], url: safe(p.url), cover: safe(p.cover_url),
        username: p.profiles?.username ?? null, country: p.profiles?.country ?? null,
        avg: st.length ? st.reduce((a, b) => a + b, 0) / st.length : 0, count: st.length,
      };
    }));
  } catch { return fail([]); }
}

/* --------------------------------------------------------------- Profils */

export type ProfileView = {
  profile: ProfileRow;
  questions: QuestionRow[];
  projects: { id: string; title: string; url: string | null; tags: string[] }[];
  rep: number;
};

export async function loadProfile(username: string): Promise<Loaded<ProfileView | null>> {
  try {
    const sb = supabaseServer();
    const { data: p, error } = await withTimeout(sb.from('profiles').select('*').eq('username', username).maybeSingle());
    if (error) return fail(null);
    if (!p) return ok(null);
    const [{ data: qs }, { data: pjs }, { data: ans }] = await Promise.all([
      withTimeout(sb.from('questions').select('*, profiles(username, country), answers(count)').eq('author_id', p.id).order('created_at', { ascending: false }).limit(10)),
      withTimeout(sb.from('projects').select('id, title, url, tags').eq('author_id', p.id).order('created_at', { ascending: false }).limit(10)),
      withTimeout(sb.from('answers').select('score').eq('author_id', p.id)),
    ]);
    const rep = (ans ?? []).reduce((n: number, a: { score?: number }) => n + (a.score ?? 0), 0) + (ans?.length ?? 0) * 5;
    return ok({
      profile: p as ProfileRow,
      questions: (qs as unknown as QuestionRow[]) ?? [],
      projects: (pjs ?? []).map((j: { id: string; title: string; url: string | null; tags: string[] | null }) => ({ id: j.id, title: j.title, url: j.url, tags: j.tags ?? [] })),
      rep,
    });
  } catch { return fail(null); }
}

/* ------------------------------------------------- Chiffres et communauté */

export type Stats = { members: number; countries: number; solved: number; projects: number };
export type Contributor = { username: string; country: string | null; rep: number };

export async function loadStats(): Promise<Loaded<Stats>> {
  const zero: Stats = { members: 0, countries: 0, solved: 0, projects: 0 };
  try {
    const sb = supabaseServer();
    const [m, c, s, p] = await Promise.all([
      withTimeout(sb.from('profiles').select('id', { count: 'exact', head: true })),
      withTimeout(sb.from('profiles').select('country').not('country', 'is', null).limit(5000)),
      withTimeout(sb.from('questions').select('id', { count: 'exact', head: true }).not('accepted_answer_id', 'is', null)),
      withTimeout(sb.from('projects').select('id', { count: 'exact', head: true })),
    ]);
    if (m.error || s.error || p.error) return fail(zero);
    const countries = new Set(((c.data ?? []) as { country: string }[]).map((r) => r.country)).size;
    return ok({ members: m.count ?? 0, countries, solved: s.count ?? 0, projects: p.count ?? 0 });
  } catch { return fail(zero); }
}

export async function loadContributors(limit = 5): Promise<Loaded<Contributor[]>> {
  try {
    const { data, error } = await withTimeout(supabaseServer().from('contributors').select('username, country, rep').order('rep', { ascending: false }).limit(limit));
    if (error) return fail([]);
    return ok((data ?? []) as Contributor[]);
  } catch { return fail([]); }
}
