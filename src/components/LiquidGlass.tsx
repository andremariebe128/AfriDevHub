'use client';

import { forwardRef, useEffect, useRef, type CSSProperties } from 'react';

/**
 * Fond "Liquid Glass" (inspiration iOS / macOS) :
 * - blobs organiques tres flous qui ondulent lentement
 * - grain fin + vignette pour la profondeur
 * - un panneau verre depoli en option (surface claire ou sombre)
 * Respecte prefers-reduced-motion et html[data-lite] (animations coupees en CSS).
 */

export function LiquidGlassBackground({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Expose l'etat du theme pour adapter la palette de blobs via CSS.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => el.dataset.dark = String(document.documentElement.classList.contains('dark'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`lg-bg pointer-events-none fixed inset-0 -z-20 overflow-hidden ${className}`}
    >
      {/* Voile de lisibilite tres leger */}
      <div className="absolute inset-0 bg-canvas/40 dark:bg-canvas/30" />

      {/* Blobs liquides */}
      <div className="absolute -inset-[10%]">
        <div className="lg-blob lg-blob-a" style={{ '--lg-c': 'var(--lg-b1)', '--lg-d': '26s', '--lg-delay': '0s',   '--lg-drift': '60px' } as CSSProperties} />
        <div className="lg-blob lg-blob-b" style={{ '--lg-c': 'var(--lg-b2)', '--lg-d': '32s', '--lg-delay': '-8s',  '--lg-drift': '80px' } as CSSProperties} />
        <div className="lg-blob lg-blob-c" style={{ '--lg-c': 'var(--lg-b3)', '--lg-d': '36s', '--lg-delay': '-16s', '--lg-drift': '70px' } as CSSProperties} />
        <div className="lg-blob lg-blob-d" style={{ '--lg-c': 'var(--lg-b4)', '--lg-d': '29s', '--lg-delay': '-4s',  '--lg-drift': '90px' } as CSSProperties} />
        <div className="lg-blob lg-blob-e" style={{ '--lg-c': 'var(--lg-b5)', '--lg-d': '34s', '--lg-delay': '-20s', '--lg-drift': '50px' } as CSSProperties} />
      </div>

      {/* Grain + vignette pour la profondeur */}
      <div className="lg-grain absolute inset-0 opacity-[0.35] dark:opacity-[0.25]" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 120% at 50% 0%, transparent 40%, rgb(0 0 0 / 0.06) 100%)' }} />
    </div>
  );
}

/** Panneau en verre depoli (pour encapsuler le formulaire). */
export const GlassPanel = forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
  function GlassPanel({ className = '', children }, ref) {
    return (
      <div ref={ref} className={`glass rounded-2xl border p-6 shadow-float backdrop-blur-2xl sm:p-8 ${className}`}>
        {children}
      </div>
    );
  }
);
