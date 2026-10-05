import { getT } from '@/lib/i18n-server';
import { getLegalDoc, OPERATOR, type LegalDoc } from '@/lib/legal';

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{name\}|\{email\})/).map((part, i) => {
        if (part === '{name}') return <strong key={i} className="font-semibold text-fg">{OPERATOR.name}</strong>;
        if (part === '{email}')
          return OPERATOR.email
            ? <a key={i} href={`mailto:${OPERATOR.email}`} className="font-medium text-accent-fg underline underline-offset-4">{OPERATOR.email}</a>
            : <span key={i} className="font-medium text-fg">{OPERATOR.emailFallback}</span>;
        return part;
      })}
    </>
  );
}

/** Page juridique : sommaire collant sur grand écran, sections numérotées, mise à jour datée. */
export default async function LegalPage({ slug }: { slug: LegalDoc['slug'] }) {
  const { t, locale } = await getT();
  const doc = getLegalDoc(slug, locale);
  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <details className="rounded-md border border-line bg-raised lg:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center px-3.5 text-sm font-semibold">{t('legal.toc')}</summary>
          <ol className="border-t border-line px-1 py-2">
            {doc.sections.map((s, i) => (
              <li key={s.id}><a href={`#${s.id}`} className="flex min-h-11 items-center gap-2 rounded px-2.5 text-sm text-muted hover:text-fg"><span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, '0')}</span>{s.h}</a></li>
            ))}
          </ol>
        </details>
        <nav aria-label={t('legal.toc')} className="hidden lg:block">
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">{t('legal.toc')}</p>
          <ol className="space-y-0.5 border-l border-line">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px flex min-h-8 items-start gap-2 border-l border-transparent py-1 pl-3 text-sm text-muted transition hover:border-brand-500 hover:text-fg">
                  <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, '0')}</span>{s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <article className="min-w-0">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 font-mono text-xs text-subtle">{t('legal.updated')} {OPERATOR.updated[locale]}</p>
        <p className="mt-5 max-w-prose text-base leading-relaxed text-muted">{doc.intro}</p>

        <div className="mt-10 space-y-10">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24 border-t border-line pt-6">
              <h2 id={`${s.id}-h`} className="flex items-baseline gap-3 font-display text-xl font-semibold tracking-tight">
                <span className="font-mono text-sm font-medium text-subtle">{String(i + 1).padStart(2, '0')}</span>{s.h}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">
                {s.body.map((b, j) =>
                  typeof b === 'string'
                    ? <p key={j}><Rich text={b} /></p>
                    : <ul key={j} className="list-disc space-y-1.5 pl-5 marker:text-subtle">{b.map((li, k) => <li key={k}><Rich text={li} /></li>)}</ul>,
                )}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
