/* eslint-disable @next/next/no-img-element */
/** Logo officiel (fichiers issus de logo_afridevhub.jpg). */
export default function Logo({ variant = 'header', height = 40 }: { variant?: 'header' | 'full'; height?: number }) {
  if (variant === 'full') return <img src="/logo-full.png" alt="AfriDevHub — La communauté des dévs africains" style={{ height, width: 'auto', maxWidth: '100%' }} />;
  return (
    <span className="inline-flex items-center gap-2">
      <img src="/logo-mark.png" alt="" style={{ height, width: 'auto' }} />
      <img src="/logo-wordmark.png" alt="AfriDevHub" className="hidden min-[430px]:block" style={{ height: height * 0.42, width: 'auto' }} />
    </span>
  );
}
