/* Préparation d'une photo de profil côté navigateur : recadrage carré centré, 512×512, WebP (repli JPEG). */

export const AVATAR_SIZE = 512;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const AVATAR_BUCKET = 'avatars';

export type AvatarCheck = 'type' | 'size' | null;
export const checkAvatarFile = (f: File): AvatarCheck => (!AVATAR_TYPES.includes(f.type) ? 'type' : f.size > AVATAR_MAX_BYTES ? 'size' : null);

type Source = { w: number; h: number; draw: (ctx: CanvasRenderingContext2D, sx: number, sy: number, s: number, size: number) => void; close: () => void };

async function decode(file: File): Promise<Source> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { w: bmp.width, h: bmp.height, draw: (c, sx, sy, s, size) => c.drawImage(bmp, sx, sy, s, s, 0, 0, size, size), close: () => bmp.close() };
    } catch { /* repli sur <img> */ }
  }
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('decode'));
    i.src = url;
  });
  return { w: img.naturalWidth, h: img.naturalHeight, draw: (c, sx, sy, s, size) => c.drawImage(img, sx, sy, s, s, 0, 0, size, size), close: () => URL.revokeObjectURL(url) };
}

const toBlob = (c: HTMLCanvasElement, type: string, q: number) => new Promise<Blob | null>((res) => c.toBlob(res, type, q));

/** Recadre au carré (centré), redimensionne à 512×512 et encode en WebP (JPEG si le navigateur ne sait pas). */
export async function squareAvatar(file: File, size = AVATAR_SIZE): Promise<{ blob: Blob; type: 'image/webp' | 'image/jpeg'; ext: 'webp' | 'jpg' }> {
  const src = await decode(file);
  try {
    if (!src.w || !src.h) throw new Error('empty');
    const side = Math.min(src.w, src.h);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#ffffff'; // PNG transparents : fond blanc
    ctx.fillRect(0, 0, size, size);
    ctx.imageSmoothingQuality = 'high';
    src.draw(ctx, (src.w - side) / 2, (src.h - side) / 2, side, size);
    const webp = await toBlob(canvas, 'image/webp', 0.85);
    if (webp && webp.type === 'image/webp') return { blob: webp, type: 'image/webp', ext: 'webp' };
    const jpg = await toBlob(canvas, 'image/jpeg', 0.9);
    if (!jpg) throw new Error('encode');
    return { blob: jpg, type: 'image/jpeg', ext: 'jpg' };
  } finally { src.close(); }
}

/* ---------- Photos de messages et couvertures de projets : réduction proportionnelle, WebP (repli JPEG) ---------- */

export const POST_BUCKET = 'post-images';
export const COVER_BUCKET = 'covers';
export const IMG_MAX_BYTES = 3 * 1024 * 1024;
export const IMG_SOURCE_MAX = 20 * 1024 * 1024;

/** Contrôle d'un fichier source avant réduction (type et poids maximal). */
export const checkSourceImage = (f: File): AvatarCheck => (!AVATAR_TYPES.includes(f.type) ? 'type' : f.size > IMG_SOURCE_MAX ? 'size' : null);

/** Réduit l'image pour que son grand côté ne dépasse pas [maxSide] px, puis l'encode sous [IMG_MAX_BYTES]. */
export async function fitImage(file: File, maxSide: number): Promise<{ blob: Blob; type: 'image/webp' | 'image/jpeg'; ext: 'webp' | 'jpg' }> {
  let source: CanvasImageSource;
  let w = 0, h = 0;
  let close = () => {};
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      source = bmp; w = bmp.width; h = bmp.height; close = () => bmp.close();
    } catch { source = undefined as unknown as CanvasImageSource; }
  }
  if (!w) {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('decode')); i.src = url; });
    source = img; w = img.naturalWidth; h = img.naturalHeight; close = () => URL.revokeObjectURL(url);
  }
  try {
    if (!w || !h) throw new Error('empty');
    const k = Math.min(1, maxSide / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source!, 0, 0, cw, ch);
    for (const q of [0.85, 0.75, 0.65, 0.5]) {
      const webp = await toBlob(canvas, 'image/webp', q);
      if (webp && webp.type === 'image/webp') { if (webp.size <= IMG_MAX_BYTES) return { blob: webp, type: 'image/webp', ext: 'webp' }; continue; }
      const jpg = await toBlob(canvas, 'image/jpeg', q);
      if (jpg && jpg.size <= IMG_MAX_BYTES) return { blob: jpg, type: 'image/jpeg', ext: 'jpg' };
    }
    throw new Error('toobig');
  } finally { close(); }
}

/** Nom de fichier unique conforme à la règle du stockage : lettres, chiffres, _ et - (64 max). */
export const newImageName = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
