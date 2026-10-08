'use client';

/** Interrupteur accessible (role="switch") avec libellé et texte d'aide associés. */
export default function Switch({ id, checked, onChange, label, help }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; help: string }) {
  return (
    <div className="flex items-start gap-2">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={`${id}-h`}
        onClick={() => onChange(!checked)}
        className="-my-2.5 -ml-1 flex h-11 w-[3.25rem] shrink-0 items-center justify-center rounded-md"
      >
        <span className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${checked ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-surface-2'}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-transform ${checked ? 'translate-x-[1.375rem]' : 'translate-x-1'}`} />
        </span>
      </button>
      <div className="min-w-0">
        <label id={`${id}-l`} htmlFor={id} className="cursor-pointer text-sm font-semibold">{label}</label>
        <p id={`${id}-h`} className="mt-0.5 text-xs text-subtle">{help}</p>
      </div>
    </div>
  );
}
