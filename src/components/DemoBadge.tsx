'use client';
import { useT } from '@/components/I18n';
import { IFolder } from '@/components/Icons';

/** Petit repère discret affiché quand le fallback de démonstration est actif. */
export default function DemoBadge({ className = '', onDark = false }: { className?: string; onDark?: boolean }) {
  const { t } = useT();
  return (
    <span
      title={t('demo.tip')}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide ${onDark ? 'border-gold-400/40 bg-gold-400/10 text-gold-300' : 'border-gold-400/50 bg-gold-400/12 text-warm'} ${className}`}
    >
      <IFolder className="h-3 w-3" />
      {t('demo.badge')}
    </span>
  );
}
