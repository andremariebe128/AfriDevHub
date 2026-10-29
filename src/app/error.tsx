'use client';

import { useT } from '@/components/I18n';

/** Erreur imprévue : message neutre (aucun détail technique affiché), nouvel essai possible. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useT();
  return (
    <div role="alert" className="mx-auto max-w-md py-20 text-center">
      <p className="text-base font-semibold">{t('err.generic')}</p>
      <button type="button" onClick={reset} className="btn btn-secondary btn-sm mt-4">{t('ui.retry')}</button>
    </div>
  );
}
