const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', 'aria-hidden': true } as const;
export const IHome = (p: { className?: string }) => <svg {...P} className={p.className ?? 'h-6 w-6'}><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" /></svg>;
export const ICompass = (p: { className?: string }) => <svg {...P} className={p.className ?? 'h-6 w-6'}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>;
export const IChat = (p: { className?: string }) => <svg {...P} className={p.className ?? 'h-6 w-6'}><path d="M4 5h16v11H9l-5 4z" /></svg>;
export const IBell = (p: { className?: string }) => <svg {...P} className={p.className ?? 'h-6 w-6'}><path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4" /></svg>;
export const ISearch = (p: { className?: string }) => <svg {...P} className={p.className ?? 'h-5 w-5'}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>;
export const IHeart = (p: { className?: string; on?: boolean }) => <svg {...P} fill={p.on ? 'currentColor' : 'none'} className={p.className ?? 'h-5 w-5'}><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z" /></svg>;
export const IShare = (p: { className?: string }) => <svg {...P} className={p.className ?? 'h-5 w-5'}><path d="M12 15V3M8 7l4-4 4 4M5 12v8h14v-8" /></svg>;
export const IPlus = (p: { className?: string }) => <svg {...P} strokeWidth={2.5} className={p.className ?? 'h-7 w-7'}><path d="M12 5v14M5 12h14" /></svg>;
