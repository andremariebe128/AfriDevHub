import dns from 'node:dns/promises';
import https from 'node:https';
import net from 'node:net';
import { newsLinkOk } from '@/lib/linkhosts';

export type Preview = { url: string; title: string | null; description: string | null; site: string };

/** Adresse non publique (boucle locale, réseau privé, lien-local, CGNAT, multicast, métadonnées cloud…) : toujours refusée. */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19));
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v);
    if (mapped) return isPrivateIp(mapped[1]);
    return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || /^fe[89ab]/.test(v) || v.startsWith('ff') || v.startsWith('64:ff9b');
  }
  return true;
}

const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(Number(n), 0x10ffff)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Math.min(parseInt(n, 16), 0x10ffff)))
  .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' } as Record<string, string>)[n]);
const clean = (s: string | undefined, max: number) => {
  if (!s) return null;
  const t = decode(s).replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, max) : null;
};

/** Extrait titre / description / nom du site d'un document HTML (texte brut uniquement : aucune image, aucun script). */
export function parseMeta(html: string, host: string): { title: string | null; description: string | null; site: string } {
  const head = html.slice(0, 200_000);
  const metas = new Map<string, string>();
  for (const m of head.matchAll(/<meta\s+([^>]*?)\/?>/gi)) {
    const attrs: Record<string, string> = {};
    for (const a of m[1].matchAll(/([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? '';
    const key = (attrs.property ?? attrs.name ?? '').toLowerCase();
    if (key && attrs.content != null && !metas.has(key)) metas.set(key, attrs.content);
  }
  const titleTag = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1];
  return {
    title: clean(metas.get('og:title') ?? metas.get('twitter:title') ?? titleTag, 160),
    description: clean(metas.get('og:description') ?? metas.get('twitter:description') ?? metas.get('description'), 300),
    site: clean(metas.get('og:site_name'), 80) ?? host.replace(/^www\./, ''),
  };
}

const MAX_BYTES = 300_000;
const TIMEOUT_MS = 4000;

async function safeAddress(host: string): Promise<{ address: string; family: 4 | 6 }> {
  if (net.isIP(host)) throw new Error('ip');
  const list = await dns.lookup(host, { all: true, verbatim: true });
  if (list.length === 0 || list.some((a) => isPrivateIp(a.address))) throw new Error('private');
  return { address: list[0].address, family: list[0].family as 4 | 6 };
}

function getOnce(url: URL, ip: { address: string; family: 4 | 6 }): Promise<{ status: number; location?: string; type: string; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      protocol: 'https:', hostname: url.hostname, port: 443, path: url.pathname + url.search, method: 'GET', servername: url.hostname,
      // L'adresse validée est « épinglée » : pas de seconde résolution DNS (anti DNS-rebinding).
      lookup: (_h, _o, cb) => cb(null, ip.address, ip.family),
      headers: { 'user-agent': 'AfriDevHubBot/1.0 (+aperçu de lien)', accept: 'text/html,application/xhtml+xml', 'accept-encoding': 'identity' },
      timeout: TIMEOUT_MS,
    }, (res) => {
      const status = res.statusCode ?? 0;
      const type = String(res.headers['content-type'] ?? '').toLowerCase();
      const location = typeof res.headers.location === 'string' ? res.headers.location : undefined;
      if (status >= 300 && status < 400) { res.resume(); return resolve({ status, location, type, body: '' }); }
      if (status !== 200 || !type.includes('text/html')) { res.resume(); return resolve({ status, type, body: '' }); }
      const chunks: Buffer[] = []; let n = 0;
      res.on('data', (c: Buffer) => {
        n += c.length; chunks.push(c);
        if (n >= MAX_BYTES) { res.destroy(); }
      });
      const done = () => resolve({ status, type, body: Buffer.concat(chunks).toString('utf8', 0, MAX_BYTES) });
      res.on('end', done); res.on('close', done); res.on('error', done);
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}

/** Aperçu d'un lien de la liste blanche. Redirections suivies (3 max) et revalidées à chaque saut. Retourne null si impossible. */
export async function fetchPreview(raw: string): Promise<Preview | null> {
  if (!newsLinkOk(raw)) return null;
  let url = new URL(raw);
  try {
    for (let hop = 0; hop < 4; hop++) {
      if (url.protocol !== 'https:' || url.username || url.password || url.port || !newsLinkOk(url.href)) return null;
      const r = await getOnce(url, await safeAddress(url.hostname));
      if (r.status >= 300 && r.status < 400 && r.location) { url = new URL(r.location, url); continue; }
      if (!r.body) return null;
      return { url: raw, ...(({ title, description, site }) => ({ title, description, site }))(parseMeta(r.body, url.hostname)) };
    }
  } catch { /* réseau, DNS ou délai dépassé : pas d'aperçu */ }
  return null;
}
