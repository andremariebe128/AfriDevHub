'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

const TONES = ['bg-brand-700', 'bg-leaf-600', 'bg-[#1d6b6a]', 'bg-[#a4531b]', 'bg-brand-900', 'bg-[#6a4a1c]'];

/** Avatar : photo de profil si `src` est fourni (repli sur les initiales si l'image échoue), sinon initiales colorées. */
export default function Avatar({ name, src, size = 40, className = '' }: { name?: string | null; src?: string | null; size?: number; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const label = (name ?? '?').replace(/^@/, '');
  const hash = Array.from(label).reduce((a, c) => a + c.charCodeAt(0), 0);
  const parts = label.split(/[\s_.-]+/).filter(Boolean);
  const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : label.slice(0, 2)).toUpperCase();
  const showImg = Boolean(src) && failed !== src;
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-bold text-white ring-2 ring-surface ${showImg ? 'bg-surface-2' : TONES[hash % TONES.length]} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {showImg ? (
        <img src={src!} alt="" width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(src!)} className="h-full w-full object-cover" />
      ) : initials}
    </span>
  );
}
