import BuffetCalculator from '@/components/BuffetCalculator';
import { getTranslations } from 'next-intl/server';

export default async function CateringPage() {
  const t = await getTranslations('Catering');

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0c0803' }}>
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

      {/* ── HERO BANNER ───────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '62vh' }}>
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1800&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
        {/* Dark gradient wash to keep the brand mood */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,8,3,0.72) 0%, rgba(12,8,3,0.55) 45%, rgba(12,8,3,0.97) 100%)',
          }}
        />
        {/* Gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 35%, rgba(193,127,59,0.18) 0%, transparent 60%)',
          }}
        />
        {/* Top kufic gold strip */}
        <div className="absolute top-0 left-0 right-0 h-0.75" style={{ background: 'linear-gradient(to right, transparent, #c17f3b, transparent)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-40 pb-24">
          <span
            className="font-bold uppercase"
            style={{ color: '#c17f3b', letterSpacing: '0.4em', fontSize: '11px' }}
          >
            {t('heroLabel')}
          </span>

          <div className="flex items-center gap-3 my-5" style={{ opacity: 0.6 }}>
            <span className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #c17f3b)' }} />
            <svg width="16" height="16" viewBox="0 0 20 20">
              <polygon points="10,2 11.8,7.2 17,8 12.8,11.5 14,17 10,14 6,17 7.2,11.5 3,8 8.2,7.2"
                fill="none" stroke="#c17f3b" strokeWidth="0.9" />
            </svg>
            <span className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #c17f3b)' }} />
          </div>

          <h1
            className="font-serif italic"
            style={{
              fontSize: 'clamp(2.6rem, 8vw, 5.25rem)',
              color: '#f7f2eb',
              lineHeight: 1.02,
              textShadow: '0 18px 50px rgba(0,0,0,0.5)',
            }}
          >
            {t('heroTitle')}
          </h1>

          <p
            className="max-w-2xl mx-auto font-light leading-relaxed mt-6"
            style={{ color: 'rgba(247,242,235,0.6)', fontSize: '1rem' }}
          >
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── ORDERING WORKFLOW ─────────────────────────────────────── */}
      <div className="relative z-10 px-3 sm:px-6 pb-20 -mt-6">
        <BuffetCalculator />
      </div>
    </main>
  );
}
