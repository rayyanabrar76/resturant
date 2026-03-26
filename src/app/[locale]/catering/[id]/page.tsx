'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Clock, Users, ChefHat, Star } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════════════ */

const OFFER_DETAILS: Record<string, { image: string; features: string[]; tags: string[]; arabic: string }> = {
  '1': {
    image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    features: ['feature1_1', 'feature1_2', 'feature1_3', 'feature1_4'],
    tags: ['Traditional', 'Family Style'],
    arabic: 'تقديم عائلي تقليدي',
  },
  '2': {
    image: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    features: ['feature2_1', 'feature2_2', 'feature2_3', 'feature2_4'],
    tags: ['Corporate', 'Formal'],
    arabic: 'مناسبات الشركات',
  },
  '3': {
    image: 'https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    features: ['feature3_1', 'feature3_2', 'feature3_3', 'feature3_4'],
    tags: ['Luxury', 'Weddings'],
    arabic: 'حفلات الأعراس الفاخرة',
  },
};

const PRICES: Record<string, string> = { '1': '€400', '2': '€750', '3': '€1.200' };

/* ══════════════════════════════════════════════════════════════════════════
   ORNAMENTS
══════════════════════════════════════════════════════════════════════════ */

const StarIcon = ({ size = 14, color = '#c17f3b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <polygon points="10,2 11.8,7.2 17,8 12.8,11.5 14,17 10,14 6,17 7.2,11.5 3,8 8.2,7.2"
      fill="none" stroke={color} strokeWidth="0.9" />
    <circle cx="10" cy="10" r="2.2" fill={color} opacity="0.65" />
  </svg>
);

const TileOverlay = () => (
  <div className="absolute inset-0 pointer-events-none" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpattern id='cdt' x='0' y='0' width='64' height='64' patternUnits='userSpaceOnUse'%3E%3Cpolygon points='32,4 36,18 50,18 39,27 43,41 32,33 21,41 25,27 14,18 28,18' fill='none' stroke='%23f7f2eb' stroke-width='0.65'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23cdt)'/%3E%3C/svg%3E")`,
    opacity: 0.04,
  }} />
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════ */

export default function CateringDetailPage() {
  const { id }  = useParams();
  const t       = useTranslations('Catering');
  const locale  = useLocale();
  const isRTL   = locale === 'ar';

  const offerId = (id as string) in OFFER_DETAILS ? (id as string) : '1';
  const offer   = OFFER_DETAILS[offerId];
  const price   = PRICES[offerId] ?? '€400';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500;600;700&display=swap');

        .catering-detail-page {
          background-color: #0c0803;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        .catering-detail-page::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03; mix-blend-mode: overlay; pointer-events: none; z-index: 0;
        }

        .feature-row {
          border-bottom: 1px solid rgba(247,242,235,0.06);
          padding-bottom: 0.9rem;
          margin-bottom: 0.9rem;
        }
        .feature-row:last-child { border-bottom: none; margin-bottom: 0; }

        .info-pill {
          background: rgba(247,242,235,0.05);
          border: 1px solid rgba(247,242,235,0.09);
          border-radius: 16px; padding: 0.75rem 1rem;
          display: flex; align-items: center; gap: 0.6rem;
        }

        .service-card {
          background: rgba(247,242,235,0.04);
          border: 1px solid rgba(193,127,59,0.12);
          border-radius: 20px; padding: 1.5rem;
        }

        .cta-btn {
          background: #2d5016; color: #f7f2eb;
          border: 1px solid rgba(74,124,35,0.45);
          box-shadow: 0 8px 32px rgba(45,80,22,0.45);
          transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .cta-btn:hover {
          background: #4a7c23;
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(45,80,22,0.6);
        }
      `}</style>

      <main
        className="catering-detail-page"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ paddingTop: '7rem', paddingBottom: '7rem' }}
      >

        {/* Glow */}
        <div className="absolute top-0 left-0 pointer-events-none z-0" style={{
          width: '60vw', height: '60vh',
          background: 'radial-gradient(ellipse at top left, rgba(193,127,59,0.05) 0%, transparent 65%)',
        }} />

        {/* Top kufic strip */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <svg className="w-full block" height="5" preserveAspectRatio="none" style={{ opacity: 0.5 }}>
            <defs>
              <pattern id="kufic-cd" x="0" y="0" width="40" height="5" patternUnits="userSpaceOnUse">
                <rect x="0"  y="0" width="10" height="5" fill="#c17f3b" />
                <rect x="11" y="1" width="6"  height="4" fill="#c17f3b" />
                <rect x="19" y="0" width="4"  height="5" fill="#c17f3b" />
                <rect x="25" y="1" width="10" height="4" fill="#c17f3b" />
                <rect x="37" y="0" width="3"  height="5" fill="#c17f3b" />
              </pattern>
            </defs>
            <rect width="100%" height="5" fill="url(#kufic-cd)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-14">

          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
            <Link href="/catering" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} style={{ color: 'rgba(247,242,235,0.35)' }} />
              <span
                style={{
                  fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700,
                  letterSpacing: '0.25em', textTransform: 'uppercase',
                  color: 'rgba(247,242,235,0.35)', transition: 'color 0.25s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c17f3b'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(247,242,235,0.35)'; }}
              >
                {t('backToCatering')}
              </span>
            </Link>
          </motion.div>

          {/* ── Mobile hero image ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }}
            className="relative w-full rounded-2xl overflow-hidden lg:hidden mb-8"
            style={{ aspectRatio: '16/9', border: '1px solid rgba(193,127,59,0.1)', boxShadow: '0 16px 60px rgba(0,0,0,0.55)' }}
          >
            <img src={offer.image} alt="Catering" loading="eager" className="w-full h-full object-cover" />
            <TileOverlay />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,8,3,0.65) 0%, rgba(12,8,3,0.1) 55%, transparent 100%)' }} />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {offer.tags.map(tag => (
                <span key={tag} style={{
                  background: 'rgba(12,8,3,0.75)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(193,127,59,0.25)',
                  padding: '0.3rem 0.85rem', borderRadius: '9999px',
                  fontFamily: "'Jost', sans-serif", fontSize: '9px',
                  fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(247,242,235,0.7)',
                }}>{tag}</span>
              ))}
            </div>
          </motion.div>

          {/* ── Main two-col grid ── */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* ── LEFT ── */}
            <div className="space-y-8 lg:space-y-10">

              {/* Desktop hero image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative hidden lg:block rounded-3xl overflow-hidden"
                style={{ aspectRatio: '16/10', border: '1px solid rgba(193,127,59,0.12)', boxShadow: '0 24px 80px rgba(0,0,0,0.55)' }}
              >
                <img src={offer.image} alt="Catering" className="w-full h-full object-cover" />
                <TileOverlay />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,8,3,0.6) 0%, rgba(12,8,3,0.05) 60%, transparent 100%)' }} />
                <div className="absolute top-6 left-6 flex gap-2">
                  {offer.tags.map(tag => (
                    <span key={tag} style={{
                      background: 'rgba(12,8,3,0.75)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(193,127,59,0.25)',
                      padding: '0.35rem 1rem', borderRadius: '9999px',
                      fontFamily: "'Jost', sans-serif", fontSize: '9px',
                      fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: 'rgba(247,242,235,0.65)',
                    }}>{tag}</span>
                  ))}
                </div>
                {/* Arabic label on image */}
                <div className="absolute bottom-6 left-6">
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontStyle: 'italic', letterSpacing: '0.08em', color: 'rgba(247,242,235,0.4)' }}>
                    {offer.arabic}
                  </p>
                </div>
              </motion.div>

              {/* Title + desc */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontStyle: 'italic', letterSpacing: '0.1em', color: 'rgba(247,242,235,0.3)', marginBottom: '0.5rem' }}>
                  {offer.arabic}
                </p>
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 300, lineHeight: 0.95,
                  color: '#f7f2eb', marginBottom: '1.2rem',
                }}>
                  {t(`offer${offerId}Title`).split(' ').slice(0, -1).join(' ')}{' '}
                  <span style={{ color: '#c17f3b', fontStyle: 'italic' }}>
                    {t(`offer${offerId}Title`).split(' ').slice(-1)}
                  </span>
                </h1>

                {/* Ornamental divider */}
                <div className="flex items-center gap-3 mb-5" style={{ opacity: 0.45 }}>
                  <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, #c17f3b)' }} />
                  <StarIcon size={13} color="#c17f3b" />
                  <div className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, #c17f3b)' }} />
                </div>

                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.05rem, 1.6vw, 1.18rem)',
                  fontWeight: 300, lineHeight: 1.9,
                  color: 'rgba(247,242,235,0.58)',
                }}>
                  {t(`offer${offerId}LongDesc`)}
                </p>
              </motion.div>

              {/* Info pills */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="flex gap-3 overflow-x-auto py-1">
                <div className="info-pill shrink-0">
                  <Users size={15} style={{ color: '#c17f3b', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, color: 'rgba(247,242,235,0.65)', whiteSpace: 'nowrap' }}>
                    10–500 {t('guests')}
                  </span>
                </div>
                <div className="info-pill shrink-0">
                  <Clock size={15} style={{ color: '#c17f3b', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, color: 'rgba(247,242,235,0.65)', whiteSpace: 'nowrap' }}>
                    48h {t('notice')}
                  </span>
                </div>
              </motion.div>

              {/* Service cards */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4">
                <div className="service-card space-y-3">
                  <ChefHat size={20} style={{ color: '#c17f3b' }} />
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 300, color: '#f7f2eb' }}>
                    {t('serviceStyle')}
                  </h4>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', lineHeight: 1.7, color: 'rgba(247,242,235,0.4)' }}>
                    {t(`offer${offerId}Style`)}
                  </p>
                </div>
                <div className="service-card space-y-3">
                  <Star size={20} style={{ color: '#c17f3b' }} fill="#c17f3b" />
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 300, color: '#f7f2eb' }}>
                    {t('premiumQuality')}
                  </h4>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', lineHeight: 1.7, color: 'rgba(247,242,235,0.4)' }}>
                    {t('qualityDesc')}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT: inclusions card ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="lg:sticky lg:top-32"
            >
              <div style={{
                background: 'rgba(247,242,235,0.04)',
                border: '1px solid rgba(193,127,59,0.18)',
                borderRadius: '28px',
                padding: '2.5rem',
                boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
              }}>

                {/* What's included header */}
                <div className="mb-6">
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', fontStyle: 'italic', letterSpacing: '0.1em', color: 'rgba(247,242,235,0.3)', marginBottom: '0.4rem' }}>
                    ما يشمله العرض
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, #c17f3b)', opacity: 0.45 }} />
                    <h3 style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.35)' }}>
                      {t('whatsIncluded')}
                    </h3>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  {offer.features.map(feature => (
                    <div key={feature} className="feature-row flex items-start gap-3">
                      <CheckCircle2 size={15} style={{ color: '#c17f3b', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7, color: 'rgba(247,242,235,0.65)' }}>
                        {t(feature)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div style={{ borderTop: '1px solid rgba(193,127,59,0.12)', paddingTop: '1.5rem' }} className="space-y-5">
                  <div>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.28)', marginBottom: '0.25rem' }}>
                      {t('startingFrom')}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 300, color: '#c17f3b', lineHeight: 1 }}>
                      {price}
                    </p>
                  </div>

                  {/* Desktop CTA */}
                  <Link href="/reservations" className="hidden lg:block" style={{ textDecoration: 'none' }}>
                    <button
                      className="cta-btn w-full flex items-center justify-center gap-2.5 rounded-full"
                      style={{
                        padding: '1.05rem 2rem',
                        fontFamily: "'Jost', sans-serif", fontSize: '10px',
                        fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#c17f3b' }} />
                      {t('inquireNow')}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
          style={{
            background: 'rgba(12,8,3,0.95)', backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(193,127,59,0.12)',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.28)' }}>
                {t('startingFrom')}
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontWeight: 300, color: '#c17f3b', lineHeight: 1 }}>
                {price}
              </p>
            </div>
            <Link href="/reservations" className="flex-1 max-w-52" style={{ textDecoration: 'none' }}>
              <button className="cta-btn w-full min-h-12 flex items-center justify-center gap-2 rounded-2xl"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {t('inquireNow')}
              </button>
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}