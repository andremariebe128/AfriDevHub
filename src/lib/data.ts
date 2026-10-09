import { AFRICA, canonicalCountry, countryBlurb, countryLabel, findCountry } from '@/lib/countries';
import { dayOrNull } from '@/lib/dates';
import { isMissingColumn } from '@/lib/errors';
import type { Locale } from '@/lib/i18n';
import { normalizeCv } from '@/lib/cv';
import { supabaseServer } from '@/lib/supabase';
import { safeUrl } from '@/lib/utils';
import type { AnswerRow, Item, Loaded, ProfileRow, ProjectItem, QuestionRow } from '@/lib/types';

/* Lectures serveur. Aucune donnée fictive : en cas d'échec, la liste est vide et `error` vaut true. */

const TIMEOUT_MS = 6000;
function withTimeout<T>(p: PromiseLike<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    Promise.resolve(p).then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
  });
}
const ok = <T,>(data: T): Loaded<T> => ({ data });
const fail = <T,>(data: T): Loaded<T> => ({ data, error: true });

/**
 * Tolérance : `profiles.avatar_url` n'existe qu'après la migration schema-v6. On tente la lecture avec la colonne ;
 * si Supabase répond « colonne inconnue », on relit sans elle (et on évite de réessayer pendant une minute).
 */
let avatarOffUntil = 0;
async function withAvatar<R extends { error: unknown }>(run: (avatar: boolean) => PromiseLike<R>): Promise<R> {
  if (Date.now() > avatarOffUntil) {
    const r = await run(true);
    if (!r.error) return r;
    if (!isMissingColumn(r.error as { message?: string; code?: string })) return r;
    avatarOffUntil = Date.now() + 60_000;
  }
  return run(false);
}
/** Les requêtes sont composées dynamiquement : on évite l'analyse de type du `select`. */
const sq = (s: string): string => s;
const pcols = (avatar: boolean, base: string) => (avatar ? `${base}, avatar_url` : base);

/* ------------------------------------------------------- Annuaires (listings) */

type ListingRowDb = {
  id?: string; title: string; meta: string | null; kind: string; tags: string[] | null; body: string | null;
  start_date?: string | null; end_date?: string | null; country?: string | null;
  profiles?: { username: string; avatar_url?: string | null } | { username: string; avatar_url?: string | null }[] | null;
};

export async function loadItems(section: 'opportunity' | 'mentor'): Promise<Item[]> {
  try {
    const sb = supabaseServer();
    const { data, error } = await withAvatar((a) =>
      withTimeout(sb.from('listings').select(sq(`*, profiles(${pcols(a, 'username')})`)).eq('section', section).order('created_at', { ascending: false }).limit(100)));
    if (error) return [];
    return ((data ?? []) as unknown as ListingRowDb[]).map((r) => {
      const pr = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      const country = r.country ? (r.country === 'ALL' ? 'ALL' : canonicalCountry(r.country)) : null;
      return {
        id: r.id, title: r.title, meta: r.meta ?? '', kind: r.kind, tags: r.tags ?? [], text: r.body ?? '',
        author: pr?.username, authorAvatar: safeUrl(pr?.avatar_url),
        startDate: dayOrNull(r.start_date), endDate: dayOrNull(r.end_date), country,
      } as Item;
    });
  } catch { return []; }
}

/* ------------------------------------------------------------------ Espaces */

type SpaceRow = { slug: string; kind: 'country' | 'tech'; name: string; tag: string | null; desc_fr: string; desc_en: string };
type QAct = { tags: string[] | null; profiles: { country: string | null } | { country: string | null }[] | null };
const countryOfRow = (r: QAct) => canonicalCountry((Array.isArray(r.profiles) ? r.profiles[0]?.country : r.profiles?.country) ?? '');

/**
 * Espaces pays et techno : fusion de la table `spaces` et du référentiel des 54 pays d'Afrique.
 * Un pays absent de la table apparaît quand même, avec une description neutre générée côté front.
 * Les compteurs sont calculés sur les données réelles (0 s'il n'y a rien).
 */
export async function loadSpaces(locale: Locale = 'fr'): Promise<Item[]> {
  const sb = supabaseServer();
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  let rows: SpaceRow[] = [];
  let profiles: { country: string | null; stack: string[] | null }[] | null = null;
  let recent: QAct[] | null = null;
  try {
    const [sp, pr, qs] = await Promise.all([
      withTimeout(sb.from('spaces').select('*').order('position')),
      withTimeout(sb.from('profiles').select('country, stack').limit(5000)),
      withTimeout(sb.from('questions').select('tags, profiles(country)').gte('created_at', since).limit(2000)),
    ]);
    if (!sp.error) rows = (sp.data ?? []) as SpaceRow[];
    if (!pr.error) profiles = (pr.data ?? []) as { country: string | null; stack: string[] | null }[];
    if (!qs.error) recent = (qs.data ?? []) as QAct[];
  } catch { /* on affiche au moins le référentiel, sans compteurs */ }

  const countByCountry = (name: string) => (profiles ? profiles.filter((p) => p.country && canonicalCountry(p.country) === name).length : undefined);
  const weeklyByCountry = (name: string) => (recent ? recent.filter((r) => countryOfRow(r) === name).length : undefined);

  const dbCountry = new Map<string, SpaceRow>();
  const extras: SpaceRow[] = [];
  for (const r of rows) {
    if (r.kind !== 'country') continue;
    const c = findCountry(r.name);
    if (c) dbCountry.set(c.code, r); else extras.push(r);
  }

  const countries: Item[] = AFRICA.map((c) => {
    const db = dbCountry.get(c.code);
    return {
      title: c.fr, meta: '', kind: 'Pays', tags: [], flag: c.fr, href: `/espaces/${db?.slug ?? c.slug}`,
      // Description neutre générée pour tous les pays : les textes de la base ne sont pas utilisés pour les pays.
      text: countryBlurb(c, 'fr'),
      en: { text: countryBlurb(c, 'en') },
      alt: `${c.en} ${c.capFr} ${c.capEn} ${c.code}`,
      members: countByCountry(c.fr), weekly: weeklyByCountry(c.fr),
    } as Item;
  });
  for (const r of extras) {
    countries.push({ title: r.name, meta: '', kind: 'Pays', tags: [], flag: r.name, href: `/espaces/${r.slug}`, text: '', members: countByCountry(r.name), weekly: weeklyByCountry(r.name) } as Item);
  }
  const label = (i: Item) => { const c = findCountry(i.title); return c ? countryLabel(c, locale) : i.title; };
  countries.sort((a, b) => label(a).localeCompare(label(b), locale));

  const tech: Item[] = rows.filter((r) => r.kind === 'tech').map((s) => ({
    title: s.name, meta: '', kind: 'Techno', tags: [], text: s.desc_fr, en: { text: s.desc_en }, href: `/espaces/${s.slug}`,
    members: profiles ? profiles.filter((p) => s.tag && (p.stack ?? []).includes(s.tag)).length : undefined,
    weekly: recent ? recent.filter((r) => s.tag && (r.tags ?? []).includes(s.tag)).length : undefined,
  } as Item));
  return [...countries, ...tech];
}

export async function loadSpace(slug: string): Promise<{ space: SpaceRow; questions: QuestionRow[] } | null> {
  try {
    let space: SpaceRow | null = null;
    const c = slug.startsWith('pays-') ? findCountry(slug) : null;
    if (c) {
      space = { slug, kind: 'country', name: c.fr, tag: null, desc_fr: countryBlurb(c, 'fr'), desc_en: countryBlurb(c, 'en') };
    } else {
      const { data } = await withTimeout(supabaseServer().from('spaces').select('*').eq('slug', slug).maybeSingle());
      if (!data) return null;
      space = data as SpaceRow;
    }
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
    const sb = supabaseServer();
    const { data, error } = await withAvatar((a) => {
      let query = sb.from('questions').select(sq(`*, profiles${country ? '!inner' : ''}(${pcols(a, 'username, country')}), answers(count)`));
      if (q.trim()) query = query.ilike('title', `%${q.trim()}%`);
      if (tag) query = query.contains('tags', [tag]);
      if (country) query = query.eq('profiles.country', country);
      return withTimeout(query.order('created_at', { ascending: false }).limit(sort === 'new' ? limit : 100));
    });
    if (error) return fail([]);
    return ok(applySort((data as unknown as QuestionRow[]) ?? [], sort, limit));
  } catch { return fail([]); }
}

export async function loadQuestion(id: string): Promise<Loaded<{ question: QuestionRow; answers: AnswerRow[] } | null>> {
  try {
    const sb = supabaseServer();
    const { data: q, error } = await withAvatar((a) => withTimeout(sb.from('questions').select(sq(`*, profiles(${pcols(a, 'username, country')})`)).eq('id', id).maybeSingle()));
    if (error) return fail(null);
    if (!q) return ok(null);
    const { data: answers } = await withAvatar((a) => withTimeout(sb.from('answers').select(sq(`*, profiles(${pcols(a, 'username')})`)).eq('question_id', id).order('score', { ascending: false }).order('created_at', { ascending: true })));
    return ok({ question: q as unknown as QuestionRow, answers: (answers as unknown as AnswerRow[]) ?? [] });
  } catch { return fail(null); }
}

/* -------------------------------------------------------------- Projets */

type ProjectDbRow = {
  id: string; title: string; description?: string | null; url?: string | null; cover_url?: string | null; tags?: string[] | null;
  profiles?: { username: string; country: string | null; avatar_url?: string | null } | null; project_ratings?: { stars: number }[];
};

export async function loadProjects(): Promise<Loaded<ProjectItem[]>> {
  try {
    const sb = supabaseServer();
    let r = await withAvatar((a) => withTimeout(sb.from('projects').select(sq(`*, profiles(${pcols(a, 'username, country')}), project_ratings(stars)`)).order('created_at', { ascending: false }).limit(60)));
    if (r.error) r = await withAvatar((a) => withTimeout(sb.from('projects').select(sq(`*, profiles(${pcols(a, 'username, country')})`)).order('created_at', { ascending: false }).limit(60)));
    if (r.error) return fail([]);
    return ok(((r.data ?? []) as unknown as ProjectDbRow[]).map((p) => {
      const st = (p.project_ratings ?? []).map((x) => x.stars);
      return {
        id: p.id, title: p.title, description: p.description ?? null, tags: p.tags ?? [], url: safeUrl(p.url), cover: safeUrl(p.cover_url),
        username: p.profiles?.username ?? null, avatar: safeUrl(p.profiles?.avatar_url), country: p.profiles?.country ?? null,
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
  /** Parcours public (vide si le propriétaire l'a masqué). */
  cv: ReturnType<typeof normalizeCv>;
};

export async function loadProfile(username: string): Promise<Loaded<ProfileView | null>> {
  try {
    const sb = supabaseServer();
    const { data: p, error } = await withTimeout(sb.from('profiles').select('*').eq('username', username).maybeSingle());
    if (error) return fail(null);
    if (!p) return ok(null);
    const [{ data: qs }, { data: pjs }, { data: ans }] = await Promise.all([
      withAvatar((a) => withTimeout(sb.from('questions').select(sq(`*, profiles(${pcols(a, 'username, country')}), answers(count)`)).eq('author_id', p.id).order('created_at', { ascending: false }).limit(10))),
      withTimeout(sb.from('projects').select('id, title, url, tags').eq('author_id', p.id).order('created_at', { ascending: false }).limit(10)),
      withTimeout(sb.from('answers').select('score').eq('author_id', p.id)),
    ]);
    const rep = (ans ?? []).reduce((n: number, a: { score?: number }) => n + (a.score ?? 0), 0) + (ans?.length ?? 0) * 5;

    /* Confidentialité : la bio n'est publique que si bio_public = true ; le parcours l'est par défaut (cv_public ≠ false).
       Le contenu masqué est retiré ici, côté serveur, et n'est donc jamais sérialisé vers le navigateur d'un visiteur. */
    const row = p as ProfileRow;
    const bioPublic = row.bio_public === true;
    const cvPublic = row.cv_public !== false;
    const cv = normalizeCv(row.cv);
    const profile: ProfileRow = { ...row, bio: bioPublic ? row.bio : null, cv: undefined, avatar_url: safeUrl(row.avatar_url) };
    return ok({
      profile,
      questions: (qs as unknown as QuestionRow[]) ?? [],
      projects: (pjs ?? []).map((j: { id: string; title: string; url: string | null; tags: string[] | null }) => ({ id: j.id, title: j.title, url: j.url, tags: j.tags ?? [] })),
      rep,
      cv: cvPublic ? cv : [],
    });
  } catch { return fail(null); }
}

/** Tags les plus utilisés dans les questions récentes (données réelles ; liste vide s'il n'y en a pas). */
export async function loadPopularTags(limit = 10): Promise<string[]> {
  try {
    const { data, error } = await withTimeout(supabaseServer().from('questions').select('tags').order('created_at', { ascending: false }).limit(500));
    if (error) return [];
    const n = new Map<string, number>();
    for (const r of (data ?? []) as { tags: string[] | null }[]) for (const t of r.tags ?? []) n.set(t, (n.get(t) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([t]) => t);
  } catch { return []; }
}

/* ------------------------------------------------- Chiffres et communauté */

export type Stats = { members: number; countries: number; solved: number; projects: number };
export type Contributor = { username: string; country: string | null; rep: number; avatar_url?: string | null };

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
    const countries = new Set(((c.data ?? []) as { country: string }[]).map((r) => canonicalCountry(r.country)).filter(Boolean)).size;
    return ok({ members: m.count ?? 0, countries, solved: s.count ?? 0, projects: p.count ?? 0 });
  } catch { return fail(zero); }
}

export async function loadContributors(limit = 5): Promise<Loaded<Contributor[]>> {
  try {
    // `*` : la vue `contributors` gagne la colonne avatar_url avec schema-v6, sans casser avant.
    const { data, error } = await withTimeout(supabaseServer().from('contributors').select('*').order('rep', { ascending: false }).limit(limit));
    if (error) return fail([]);
    return ok(((data ?? []) as Contributor[]).map((c) => ({ ...c, avatar_url: safeUrl(c.avatar_url) })));
  } catch { return fail([]); }
}
