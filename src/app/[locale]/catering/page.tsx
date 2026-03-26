import BuffetCalculator from '@/components/BuffetCalculator';
import { getTranslations } from 'next-intl/server';

export default async function CateringPage() {
  const t = await getTranslations('Catering');

  return (
    <main
      className="pt-32 pb-20 min-h-screen"
      style={{ backgroundColor: '#0c0803' }}
    >
      {/* Noise grain — matches BuffetCalculator */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6">
        {/* Hero header */}
        <div className="text-center mb-16 space-y-4">
          <span
            className="font-bold uppercase"
            style={{
              color: '#c17f3b',
              letterSpacing: '0.3em',
              fontSize: '10px',
            }}
          >
            {t('heroLabel')}
          </span>
          <h1
            className="font-serif italic"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              color: '#f7f2eb',
              lineHeight: 1.05,
            }}
          >
            {t('heroTitle')}
          </h1>
          <p
            className="max-w-2xl mx-auto font-light leading-relaxed"
            style={{ color: 'rgba(247,242,235,0.45)', fontSize: '0.95rem' }}
          >
            {t('heroSubtitle')}
          </p>
        </div>

        <BuffetCalculator />
      </div>
    </main>
  );
}