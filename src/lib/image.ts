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
