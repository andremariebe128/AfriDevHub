/**
 * Données de démonstration (front uniquement).
 * Utilisées par les pages de lecture quand Supabase est injoignable ou ne renvoie aucune ligne.
 * Tous les pseudos et contenus sont fictifs.
 */
import type { AnswerRow, ProfileRow, ProjectItem, QuestionRow } from '@/lib/types';

const fence = (lang: string, code: string) => '```' + lang + '\n' + code + '\n```';
const iso = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString();

/* ------------------------------------------------------------------ Profils */

type DemoProfile = Omit<ProfileRow, 'id'> & { rep: number };

const PROFILES: DemoProfile[] = [
  { username: 'mawuli_code', full_name: 'Mawuli K.', country: 'Bénin', headline: 'Dev Laravel et paiements Mobile Money', bio: 'Je construis des API de paiement pour des PME de Cotonou. J’aime les webhooks bien faits et les migrations sans surprise.', stack: ['laravel', 'php', 'mobile-money', 'mysql'], languages: ['Français', 'Fon', 'English'], years_exp: 6, open_to: ['mentor', 'work'], github_url: 'https://github.com', website_url: null, rep: 1840 },
  { username: 'adaeze_ng', full_name: 'Adaeze O.', country: 'Nigeria', headline: 'Backend engineer, Node.js et PostgreSQL', bio: 'Backend engineer in Lagos. I care about reliability on flaky networks and boring, observable systems.', stack: ['node', 'postgres', 'typescript', 'docker'], languages: ['English', 'Igbo'], years_exp: 5, open_to: ['collab'], github_url: 'https://github.com', website_url: null, rep: 2310 },
  { username: 'fatou_flutter', full_name: 'Fatou D.', country: 'Sénégal', headline: 'Flutter et applications offline-first', bio: 'Applications mobiles qui marchent aussi quand le réseau tombe. Je mentore des étudiants de Dakar le samedi.', stack: ['flutter', 'dart', 'supabase', 'sqlite'], languages: ['Français', 'Wolof', 'English'], years_exp: 4, open_to: ['mentor', 'collab'], github_url: 'https://github.com', website_url: null, rep: 1675 },
  { username: 'yao_infra', full_name: 'Yao B.', country: 'Côte d’Ivoire', headline: 'DevOps et fiabilité (SRE)', bio: 'CI/CD, conteneurs, supervision. Je réduis les factures cloud et les nuits blanches.', stack: ['docker', 'linux', 'ci-cd', 'terraform'], languages: ['Français', 'English'], years_exp: 7, open_to: ['work'], github_url: 'https://github.com', website_url: null, rep: 1420 },
  { username: 'ngo_data', full_name: 'Ngo T.', country: 'Cameroun', headline: 'Data engineer, pipelines et qualité de données', bio: 'Pipelines de données pour la santé publique. Python, SQL et beaucoup de CSV mal formés.', stack: ['python', 'sql', 'pandas', 'airflow'], languages: ['Français', 'English'], years_exp: 5, open_to: ['mentor'], github_url: 'https://github.com', website_url: null, rep: 1290 },
  { username: 'kwame_ml', full_name: 'Kwame A.', country: 'Ghana', headline: 'ML engineer, modèles légers pour mobile', bio: 'Compressing models so they run on the phones people actually own. Twi and English NLP.', stack: ['python', 'pytorch', 'onnx', 'tflite'], languages: ['English', 'Twi'], years_exp: 3, open_to: ['collab'], github_url: 'https://github.com', website_url: null, rep: 980 },
  { username: 'wanjiku_pay', full_name: 'Wanjiku M.', country: 'Kenya', headline: 'Fintech et intégrations de paiement mobile', bio: 'Payments integrations for startups in Nairobi. STK push, reconciliation and a lot of retries.', stack: ['go', 'postgres', 'mobile-money', 'api'], languages: ['English', 'Swahili'], years_exp: 6, open_to: ['mentor', 'work'], github_url: 'https://github.com', website_url: null, rep: 1530 },
  { username: 'uwase_react', full_name: 'Uwase C.', country: 'Rwanda', headline: 'Front-end React, performance et accessibilité', bio: 'Interfaces rapides sur téléphones d’entrée de gamme. Accessibilité d’abord, animations ensuite.', stack: ['react', 'nextjs', 'tailwind', 'a11y'], languages: ['Français', 'English', 'Kinyarwanda'], years_exp: 4, open_to: ['collab', 'work'], github_url: 'https://github.com', website_url: null, rep: 1105 },
  { username: 'yassine_ai', full_name: 'Yassine E.', country: 'Maroc', headline: 'Full-stack Python et NLP pour l’arabe', bio: 'Django en journée, corpus arabes le soir. Je partage des jeux de données ouverts.', stack: ['python', 'django', 'nlp', 'sql'], languages: ['Français', 'العربية', 'English'], years_exp: 5, open_to: ['mentor'], github_url: 'https://github.com', website_url: null, rep: 1215 },
  { username: 'nour_embedded', full_name: 'Nour H.', country: 'Égypte', headline: 'Systèmes embarqués et IoT', bio: 'ESP32, capteurs solaires et MQTT. Je documente tout ce qui chauffe.', stack: ['c', 'esp32', 'mqtt', 'iot'], languages: ['العربية', 'English'], years_exp: 8, open_to: ['mentor', 'collab'], github_url: 'https://github.com', website_url: null, rep: 1360 },
  { username: 'thabo_rust', full_name: 'Thabo N.', country: 'Afrique du Sud', headline: 'Rust et systèmes à faible latence', bio: 'Rust, Go and Linux internals. I review pull requests faster than I answer email.', stack: ['rust', 'go', 'linux', 'sql'], languages: ['English', 'isiZulu'], years_exp: 9, open_to: ['mentor'], github_url: 'https://github.com', website_url: null, rep: 1950 },
  { username: 'mbuyi_mobile', full_name: 'Mbuyi L.', country: 'RD Congo', headline: 'Android natif et PWA basse connectivité', bio: 'Applications pour des zones où la 3G est un luxe. Kotlin, PWA et synchronisation tolérante aux coupures.', stack: ['kotlin', 'android', 'pwa', 'sqlite'], languages: ['Français', 'Lingala', 'English'], years_exp: 4, open_to: ['work', 'collab'], github_url: 'https://github.com', website_url: null, rep: 870 },
];

const profileId = (username: string) => `demo-u-${username}`;
const countryOf = (username: string) => PROFILES.find((p) => p.username === username)?.country ?? null;

export const DEMO_PROFILES: ProfileRow[] = PROFILES.map(({ rep: _rep, ...p }) => ({ id: profileId(p.username), ...p }));
export const DEMO_REPUTATION: Record<string, number> = Object.fromEntries(PROFILES.map((p) => [p.username, p.rep]));

export type Contributor = { username: string; country: string | null; rep: number };
export const DEMO_CONTRIBUTORS: Contributor[] = [...PROFILES]
  .sort((a, b) => b.rep - a.rep)
  .map((p) => ({ username: p.username, country: p.country, rep: p.rep }));

/* --------------------------------------------------------------- Questions */

type RawAnswer = { by: string; min: number; score: number; body: string; accepted?: boolean };
type RawQuestion = { id: string; by: string; min: number; title: string; body: string; tags: string[]; answers: RawAnswer[] };

const RAW: RawQuestion[] = [
  {
    id: 'demo-q-webhook', by: 'mawuli_code', min: 42,
    title: 'Comment éviter les doublons quand le webhook Mobile Money est rappelé ?',
    tags: ['laravel', 'mobile-money', 'php'],
    body: 'Mon opérateur rappelle parfois deux fois le même webhook de paiement et je crédite le compte deux fois.\n\n' + fence('php', "public function handle(Request $r)\n{\n    $tx = Transaction::where('ref', $r->ref)->first();\n    $tx->wallet->increment('balance', $r->amount); // appelé 2 fois...\n    return response()->json(['ok' => true]);\n}") + '\n\nComment rendre ce handler idempotent proprement ?',
    answers: [
      { by: 'wanjiku_pay', min: 30, score: 24, accepted: true, body: 'Les opérateurs relancent après un timeout, c’est normal. Rends le traitement idempotent avec une contrainte d’unicité sur la référence et une transaction SQL :\n\n' + fence('php', "DB::transaction(function () use ($r) {\n    $tx = Transaction::where('ref', $r->ref)->lockForUpdate()->firstOrFail();\n    if ($tx->status === 'paid') return; // déjà traité\n    $tx->update(['status' => 'paid']);\n    $tx->wallet->increment('balance', $r->amount);\n});") + '\n\nRéponds toujours `200` rapidement, même pour un doublon.' },
      { by: 'adaeze_ng', min: 22, score: 7, body: 'Add a unique index on `(provider, ref)` too, so the database refuses the duplicate even if two requests race each other.' },
    ],
  },
  {
    id: 'demo-q-flutter-sync', by: 'fatou_flutter', min: 118,
    title: 'Flutter: how do I queue writes offline and sync with Supabase later?',
    tags: ['flutter', 'sql'],
    body: 'My field-agent app must keep working without network for hours. I store rows in SQLite, but I am unsure how to replay them safely once the connection is back.\n\n' + fence('dart', "Future<void> save(Report r) async {\n  await db.insert('reports', r.toMap());\n  // TODO: push to Supabase when online\n}") + '\n\nShould I build an outbox table or is there a better pattern?',
    answers: [
      { by: 'mbuyi_mobile', min: 95, score: 18, body: 'An outbox table is the right pattern. Store each mutation with a client-generated UUID and a `synced_at` column, then flush in order:\n\n' + fence('dart', "final pending = await db.query('outbox', orderBy: 'created_at');\nfor (final row in pending) {\n  await supabase.from(row['table']).upsert(jsonDecode(row['payload']));\n  await db.delete('outbox', where: 'id = ?', whereArgs: [row['id']]);\n}") + '\n\nUse `upsert` with the UUID so a retry never duplicates the row.' },
    ],
  },
  {
    id: 'demo-q-next-cache', by: 'uwase_react', min: 190,
    title: 'Next.js : pourquoi mon fetch côté serveur reste en cache alors que la page est dynamique ?',
    tags: ['javascript', 'react'],
    body: 'Ma page affiche le nombre de questions, mais la valeur ne change jamais après un ajout.\n\n' + fence('tsx', "export default async function Page() {\n  const res = await fetch(`${API}/stats`);\n  const stats = await res.json();\n  return <Counter value={stats.total} />;\n}") + '\n\nJe n’ai rien configuré côté cache. Où est le piège ?',
    answers: [
      { by: 'thabo_rust', min: 160, score: 12, accepted: true, body: 'Le rendu dynamique de la page ne dit rien du cache de la requête. Précise-le explicitement :\n\n' + fence('tsx', "const res = await fetch(`${API}/stats`, { cache: 'no-store' });\n// ou : { next: { revalidate: 30 } }") + '\n\nEt vérifie aussi le cache de ton CDN devant l’API.' },
      { by: 'adaeze_ng', min: 140, score: 3, body: 'Also check that your API does not send a long `Cache-Control` header. Fixing the client alone will not help in that case.' },
    ],
  },
  {
    id: 'demo-q-pandas', by: 'ngo_data', min: 260,
    title: 'Pandas : lire un CSV de 2 Go sur un laptop de 8 Go de RAM sans planter',
    tags: ['python', 'sql'],
    body: 'Je dois nettoyer un export de 2 Go (registres de santé) et mon laptop manque de mémoire dès `read_csv`.\n\n' + fence('python', "import pandas as pd\ndf = pd.read_csv('registre.csv')  # MemoryError\ndf = df[df['region'] == 'Littoral']") + '\n\nExiste-t-il une méthode simple sans passer par un cluster ?',
    answers: [
      { by: 'yassine_ai', min: 230, score: 15, accepted: true, body: 'Lis par morceaux et filtre à la volée, avec des types compacts :\n\n' + fence('python', "chunks = pd.read_csv(\n    'registre.csv', chunksize=200_000,\n    dtype={'region': 'category', 'age': 'int16'},\n    usecols=['region', 'age', 'date'],\n)\ndf = pd.concat(c[c['region'] == 'Littoral'] for c in chunks)") + '\n\nSi tu rejoues souvent la requête, convertis une fois en Parquet.' },
    ],
  },
  {
    id: 'demo-q-retry', by: 'wanjiku_pay', min: 330,
    title: 'Node.js: retry with exponential backoff for flaky 3G connections',
    tags: ['node', 'javascript'],
    body: 'Our mobile clients often lose requests. I want a small retry helper with backoff and jitter, without pulling a big dependency.\n\n' + fence('js', "async function retry(fn, tries = 3) {\n  for (let i = 0; i < tries; i++) {\n    try { return await fn(); } catch (e) { /* wait? */ }\n  }\n}"),
    answers: [
      { by: 'adaeze_ng', min: 300, score: 21, accepted: true, body: 'Add exponential delay with full jitter, and only retry errors that are safe to retry:\n\n' + fence('js', "const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function retry(fn, { tries = 4, base = 300 } = {}) {\n  for (let i = 0; ; i++) {\n    try { return await fn(); }\n    catch (e) {\n      if (i >= tries - 1 || e.status < 500) throw e;\n      await sleep(Math.random() * base * 2 ** i);\n    }\n  }\n}") },
    ],
  },
  {
    id: 'demo-q-ilike', by: 'yao_infra', min: 480,
    title: 'Index PostgreSQL : pourquoi mon ILIKE \'%mot%\' reste lent malgré l’index ?',
    tags: ['sql', 'python'],
    body: 'J’ai un index B-tree sur `title` mais la recherche par sous-chaîne parcourt toute la table (800 000 lignes).\n\n' + fence('sql', "CREATE INDEX idx_title ON questions (title);\nEXPLAIN SELECT * FROM questions WHERE title ILIKE '%paiement%';\n-- Seq Scan on questions"),
    answers: [
      { by: 'thabo_rust', min: 440, score: 19, accepted: true, body: 'Un B-tree ne sert pas aux motifs avec `%` en tête. Utilise des trigrammes :\n\n' + fence('sql', "CREATE EXTENSION IF NOT EXISTS pg_trgm;\nCREATE INDEX idx_title_trgm ON questions USING gin (title gin_trgm_ops);") + '\n\nLa même requête utilisera alors un Bitmap Index Scan.' },
      { by: 'ngo_data', min: 400, score: 4, body: 'Pour de la vraie recherche textuelle, regarde aussi `tsvector` avec la configuration `french`.' },
    ],
  },
  {
    id: 'demo-q-career', by: 'kwame_ml', min: 95,
    title: 'Junior dev in Accra: how do I land a first remote contract?',
    tags: ['career', 'javascript'],
    body: 'I have two small projects on GitHub and a few months of internship experience. Where should I look, and what should my proposal contain to stand out from agencies?',
    answers: [],
  },
  {
    id: 'demo-q-dto', by: 'mawuli_code', min: 960,
    title: 'PHP 8.3 : typer correctement un tableau de DTO',
    tags: ['php', 'laravel'],
    body: 'PHP ne permet pas `array<Item>` dans la signature. Comment garder un typage solide pour une liste d’objets `Item` ?\n\n' + fence('php', "final class Order\n{\n    /** @param Item[] $items */\n    public function __construct(public array $items) {}\n}"),
    answers: [
      { by: 'thabo_rust', min: 900, score: 9, accepted: true, body: 'Utilise la variadique, PHP vérifie alors chaque élément à l’exécution :\n\n' + fence('php', "final class Order\n{\n    /** @var Item[] */\n    public readonly array $items;\n\n    public function __construct(Item ...$items)\n    {\n        $this->items = $items;\n    }\n}") + '\n\nAjoute PHPStan niveau 8 pour couvrir le reste.' },
    ],
  },
  {
    id: 'demo-q-docker', by: 'yao_infra', min: 1300,
    title: 'Docker: how to shrink a 1.8 GB image for a small Node API?',
    tags: ['node', 'ci-cd'],
    body: 'My API is 300 lines but the image weighs 1.8 GB, and pushing it from Abidjan on a slow link takes forever.\n\n' + fence('dockerfile', "FROM node:22\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]"),
    answers: [
      { by: 'thabo_rust', min: 1250, score: 22, body: 'Use a multi-stage build on a slim base and copy only production files:\n\n' + fence('dockerfile', "FROM node:22-slim AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\n\nFROM node:22-slim\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY server.js ./\nUSER node\nCMD [\"node\", \"server.js\"]") + '\n\nAdd a `.dockerignore`; typical result is under 200 MB.' },
    ],
  },
  {
    id: 'demo-q-sw', by: 'mbuyi_mobile', min: 1700,
    title: 'Service Worker : mettre en cache des réponses API sans servir de données périmées',
    tags: ['javascript', 'react'],
    body: 'Ma PWA doit fonctionner hors ligne, mais mes utilisateurs voient parfois des listes vieilles de plusieurs jours.\n\n' + fence('js', "self.addEventListener('fetch', (e) => {\n  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));\n});"),
    answers: [
      { by: 'uwase_react', min: 1600, score: 14, accepted: true, body: 'Passe en « stale-while-revalidate » : on répond avec le cache puis on rafraîchit en arrière-plan.\n\n' + fence('js', "e.respondWith(\n  caches.open('api-v1').then(async (cache) => {\n    const cached = await cache.match(e.request);\n    const fresh = fetch(e.request).then((res) => {\n      cache.put(e.request, res.clone());\n      return res;\n    });\n    return cached || fresh;\n  })\n);") + '\n\nVersionne le nom du cache pour purger les anciennes données.' },
      { by: 'fatou_flutter', min: 1500, score: 2, body: 'Affiche aussi la date de dernière synchronisation dans l’interface : l’utilisateur comprend ce qu’il voit.' },
    ],
  },
  {
    id: 'demo-q-rerender', by: 'uwase_react', min: 2400,
    title: 'React : éviter les re-rendus d’une liste de 500 produits sur mobile d’entrée de gamme',
    tags: ['react', 'javascript'],
    body: 'Chaque frappe dans le champ de recherche relance le rendu des 500 cartes et l’écran saccade sur un téléphone à 2 Go de RAM.\n\n' + fence('tsx', "{products\n  .filter((p) => p.name.includes(query))\n  .map((p) => <ProductCard key={p.id} product={p} />)}"),
    answers: [
      { by: 'thabo_rust', min: 2300, score: 11, accepted: true, body: 'Trois leviers, du plus simple au plus efficace :\n\n- `useDeferredValue(query)` pour ne pas bloquer la saisie\n- `React.memo(ProductCard)` avec des props stables\n- une liste virtualisée (par ex. `@tanstack/react-virtual`) pour ne monter que ~15 cartes' },
    ],
  },
  {
    id: 'demo-q-sqlite', by: 'fatou_flutter', min: 3300,
    title: 'SQLite vs IndexedDB for an offline-first PWA in low-connectivity regions',
    tags: ['sql', 'javascript'],
    body: 'We are building a school-records PWA for rural areas. Is it worth shipping SQLite in WebAssembly, or is IndexedDB enough for a few thousand rows with simple queries?',
    answers: [
      { by: 'mbuyi_mobile', min: 3200, score: 10, accepted: true, body: 'For a few thousand rows and key-based lookups, IndexedDB (through a thin wrapper like `idb`) is enough and keeps your bundle small. Reach for SQLite WASM only when you need real joins or reporting offline. The extra ~1 MB hurts on 3G.' },
    ],
  },
  {
    id: 'demo-q-salary', by: 'ngo_data', min: 4200,
    title: 'Négocier son premier tarif de freelance (FCFA) : quels repères ?',
    tags: ['career'],
    body: 'Je démarre en freelance depuis Douala. Pour un site vitrine avec petit back-office, comment fixer un tarif juste sans me brader ni effrayer le client ?',
    answers: [
      { by: 'mawuli_code', min: 4100, score: 13, accepted: true, body: 'Mon repère : estime les jours de travail, multiplie par ton tarif journalier cible, puis ajoute 25 % de marge pour les retours client. Présente **deux ou trois forfaits** plutôt qu’un prix unique : les clients comparent les options au lieu de discuter le prix. Demande toujours un acompte de 40 % à la commande.' },
    ],
  },
  {
    id: 'demo-q-quant', by: 'kwame_ml', min: 5200,
    title: 'Quantize a small transformer to run on a 2 GB Android phone',
    tags: ['python'],
    body: 'I fine-tuned a 60M-parameter model for Twi sentiment classification. The FP32 file is 240 MB and inference is slow on a mid-range phone. What is the simplest path to something that fits and runs fast?\n\n' + fence('python', "import torch\nmodel = TwiClassifier()\nmodel.load_state_dict(torch.load('twi_sentiment.pt', weights_only=True))\nmodel.eval()"),
    answers: [
      { by: 'yassine_ai', min: 5100, score: 8, accepted: true, body: 'Start with dynamic int8 quantization, it is one line and usually keeps accuracy within a point:\n\n' + fence('python', "q = torch.quantization.quantize_dynamic(\n    model, {torch.nn.Linear}, dtype=torch.qint8\n)\ntorch.save(q.state_dict(), 'twi_sentiment_int8.pt')") + '\n\nThen export to ONNX and run it with ONNX Runtime Mobile.' },
    ],
  },
  {
    id: 'demo-q-mqtt', by: 'nour_embedded', min: 25,
    title: 'ESP32 et MQTT : comment éviter de perdre des mesures quand le Wi-Fi coupe ?',
    tags: ['python', 'ci-cd'],
    body: 'Mes capteurs solaires publient toutes les 10 s mais perdent des mesures lors des coupures. Je cherche un moyen simple de garder les mesures en attente puis de les renvoyer.',
    answers: [],
  },
];

function buildAnswers(q: RawQuestion): AnswerRow[] {
  return q.answers.map((a, i) => ({
    id: `${q.id}-a${i + 1}`,
    author_id: profileId(a.by),
    body: a.body,
    score: a.score,
    created_at: iso(a.min),
    profiles: { username: a.by },
  }));
}

const hash = (s: string) => Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0);

export function demoQuestions(): QuestionRow[] {
  return RAW.map((q) => {
    const accepted = q.answers.findIndex((a) => a.accepted);
    return {
      id: q.id,
      author_id: profileId(q.by),
      title: q.title,
      body: q.body,
      tags: q.tags,
      accepted_answer_id: accepted >= 0 ? `${q.id}-a${accepted + 1}` : null,
      created_at: iso(q.min),
      profiles: { username: q.by, country: countryOf(q.by) },
      answers: [{ count: q.answers.length }],
      votes: q.answers.length ? Math.max(...q.answers.map((a) => a.score)) - 2 : (hash(q.id) % 4),
      views: 40 + (hash(q.id) % 17) * 23 + q.answers.length * 60,
    };
  });
}

export function demoQuestion(id: string): { question: QuestionRow; answers: AnswerRow[] } | null {
  const raw = RAW.find((q) => q.id === id);
  if (!raw) return null;
  const question = demoQuestions().find((q) => q.id === id)!;
  return { question, answers: buildAnswers(raw) };
}

/* ------------------------------------------------------------------ Projets */

export const DEMO_PROJECTS: ProjectItem[] = [
  { id: 'demo-p-agrisms', title: 'AgriSMS', description: 'Alertes météo et prix du marché par SMS pour les agriculteurs, sans smartphone.', url: 'https://example.org/agrisms', cover: null, tags: ['php', 'sms', 'api'], username: 'mawuli_code', country: 'Bénin', avg: 4.6, count: 38 },
  { id: 'demo-p-korapay', title: 'KoraPay Kit', description: 'SDK open source pour intégrer plusieurs opérateurs Mobile Money avec une seule API.', url: 'https://example.org/korapay', cover: null, tags: ['mobile-money', 'node', 'typescript'], username: 'adaeze_ng', country: 'Nigeria', avg: 4.8, count: 112 },
  { id: 'demo-p-kolo', title: 'Kolo', description: 'Gestion de budget et de tontines, entièrement utilisable hors ligne.', url: 'https://example.org/kolo', cover: null, tags: ['flutter', 'sqlite'], username: 'fatou_flutter', country: 'Sénégal', avg: 4.4, count: 57 },
  { id: 'demo-p-medqueue', title: 'MedQueue', description: 'File d’attente numérique pour dispensaires, avec notification SMS au patient.', url: 'https://example.org/medqueue', cover: null, tags: ['node', 'postgres'], username: 'ngo_data', country: 'Cameroun', avg: 4.2, count: 24 },
  { id: 'demo-p-twi', title: 'Twi Sentiment Lite', description: 'Modèle d’analyse de sentiment en twi, quantifié pour tourner sur téléphone.', url: 'https://example.org/twi-sentiment', cover: null, tags: ['python', 'onnx'], username: 'kwame_ml', country: 'Ghana', avg: 4.7, count: 31 },
  { id: 'demo-p-mpesa', title: 'Reconcile', description: 'Outil de réconciliation des paiements STK push pour les petites boutiques.', url: 'https://example.org/reconcile', cover: null, tags: ['go', 'postgres'], username: 'wanjiku_pay', country: 'Kenya', avg: 4.5, count: 45 },
  { id: 'demo-p-schoolbox', title: 'SchoolBox', description: 'Plateforme de cours légère pour écoles rurales, installable et synchronisée par lots.', url: 'https://example.org/schoolbox', cover: null, tags: ['react', 'nextjs', 'pwa'], username: 'uwase_react', country: 'Rwanda', avg: 4.3, count: 29 },
  { id: 'demo-p-darija', title: 'Corpus Darija', description: 'Corpus ouvert de dialecte marocain annoté pour la recherche en traitement du langage.', url: 'https://example.org/darija', cover: null, tags: ['python', 'nlp'], username: 'yassine_ai', country: 'Maroc', avg: 4.9, count: 66 },
  { id: 'demo-p-solarwatch', title: 'SolarWatch', description: 'Tableau de bord de production solaire pour kits hors réseau, basé sur ESP32 et MQTT.', url: 'https://example.org/solarwatch', cover: null, tags: ['esp32', 'mqtt', 'iot'], username: 'nour_embedded', country: 'Égypte', avg: 4.4, count: 19 },
  { id: 'demo-p-gridlog', title: 'Gridlog', description: 'Journal d’événements ultra-léger en Rust pour petits serveurs et passerelles.', url: 'https://example.org/gridlog', cover: null, tags: ['rust', 'linux'], username: 'thabo_rust', country: 'Afrique du Sud', avg: 4.6, count: 41 },
];

/* ------------------------------------------------------------ Statistiques */

export const DEMO_STATS = { members: 2480, countries: 12, solved: 1260, projects: 340 };
