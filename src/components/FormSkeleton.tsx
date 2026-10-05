import { useT } from '@/components/I18n';

/** Squelette de formulaire affiché pendant la lecture de la session. */
export default function FormSkeleton({ narrow = false }: { narrow?: boolean }) {
  const { t } = useT();
  return (
    <div className={`mx-auto ${narrow ? 'max-w-3xl' : 'max-w-5xl'} space-y-5`} role="status" aria-busy="true">
      <span className="sr-only">{t('ui.loading')}</span>
      <div className="skeleton h-8 w-56" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className={`skeleton ${i === 1 ? 'h-32' : 'h-11'} w-full`} />
        </div>
      ))}
    </div>
  );
}
