'use client';

import type { ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ImageGallery from '@/components/ImageGallery';
import Footer from '@/components/Footer';
import { Award, Leaf, Flame, Heart, Star } from 'lucide-react';

/* ─── Fade-in wrapper ───────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ──────────────────────────────────────────────────────────────── */
const TIMELINE = [
  {
    year: '2008',
    title: 'The Seed',
    body: 'Chef Karim Zafrani opens a 12-seat tasting room in Kreuzberg with a single menu — seven courses of Persian-European fusion.',
  },
  {
    year: '2012',
    title: 'First Star',
    body: 'Awarded our first Michelin star. The recognition brings a new dining room, but the philosophy stays intimate.',
  },
  {
    year: '2016',
    title: 'The Garden',
    body: 'We acquire a small farm outside Berlin. From this point, every herb, every flower on the plate is grown by us.',
  },
  {
    year: '2019',
    title: 'The Second Star',
    body: 'A second Michelin star. The team grows, the menu shrinks — fewer dishes, more depth, more story.',
  },
  {
    year: '2024',
    title: 'Zafran Today',
    body: 'Forty covers, a six-month waitlist, and an obsession with flavour that has never once wavered.',
  },
];

const CHEFS = [
  {
    name: 'Karim Zafrani',
    role: 'Executive Chef & Founder',
    img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800',
    bio: 'Trained in Paris and Tehran, Karim bridges Persian heritage with modern European technique. His saffron risotto has been on the menu, unchanged, since 2008.',
  },
  {
    name: 'Sofia Marchetti',
    role: 'Head Pastry Chef',
    img: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?q=80&w=800',
    bio: 'A graduate of Le Cordon Bleu, Sofia brings architectural precision to dessert. Her work is visual art you are invited to eat.',
  },
  {
    name: 'Lars Eriksson',
    role: 'Sommelier & Beverage Director',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800',
    bio: 'Lars has spent twenty years in the cellars of Burgundy and Shiraz. His pairings are never obvious, always revelatory.',
  },
];

const PILLARS = [
  {
    icon: Leaf,
    title: 'Farm-to-Table',
    body: 'Every ingredient traced to a source we trust. Our farm in Brandenburg supplies herbs, edible flowers and micro-greens year-round.',
  },
  {
    icon: Flame,
    title: 'Live Fire',
    body: 'Open-hearth cooking is at our core. Wood smoke, char, and the Maillard reaction — flavours that no oven can replicate.',
  },
  {
    icon: Heart,
    title: 'Hospitality',
    body: 'We believe a great meal is about the people around the table as much as what is on it. Every guest is hosted, never just served.',
  },
  {
    icon: Award,
    title: 'Excellence',
    body: 'Two Michelin stars earned over fifteen years of daily refinement. We hold ourselves to a standard higher than any guide.',
  },
];

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const t = useTranslations('About');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <>
      <main
        className="overflow-hidden min-h-screen text-[#f7f2eb]"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ backgroundColor: '#0c0803' }}
      >
        {/* Menu-style atmosphere layers */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-screen"
          style={{
            backgroundImage: "url('/images/islamic-circle1.png')",
            backgroundSize: '620px 620px',
            backgroundPosition: 'center',
          }}
        />
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top,rgba(193,127,59,0.16),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_25%)]" />

        {/* Decorative blobs */}
        <div
          className="fixed top-[-10%] right-[-5%] w-31.25-[125px] rounded-full blur-3xl -z-10 pointer-events-none"
          style={{ background: 'rgba(193,127,59,0.05)' }}
        />
        <div
          className="fixed bottom-[-10%] left-[-5%] w-25 h-25 rounded-full blur-3xl -z-10 pointer-events-none"
          style={{ background: 'rgba(193,127,59,0.05)' }}
        />

        {/* ══ 1. HERO ════════════════════════════════════════════════════ */}
        <section className="relative pt-40 pb-28 px-6 md:px-12 max-w-7xl mx-auto">
          {/* Ghost watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden -z-10">
            <span
              className="font-serif italic text-[clamp(6rem,20vw,18rem)] leading-none whitespace-nowrap"
              style={{ color: 'rgba(247,242,235,0.02)' }}
            >
              Zafran
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c17f3b]/20 bg-[#c17f3b]/5 text-[#c17f3b] text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c17f3b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c17f3b]" />
                </span>
                {t('badge')}
              </div>

              <h1
                className="font-serif text-6xl md:text-8xl leading-[0.88]"
                style={{ color: '#f7f2eb' }}
              >
                {t('title')} <br />
                <span className="italic" style={{ color: '#c17f3b' }}>
                  {t('titleItalic')}
                </span>
              </h1>

              <p className="font-light leading-relaxed text-lg max-w-md" style={{ color: 'rgba(247,242,235,0.58)' }}>
                {t('storyPara1')}
              </p>
            </motion.div>

            {/* Hero image composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div
                className="relative aspect-4/5 rounded-[2.5rem] overflow-hidden"
                style={{
                  boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
                  border: '1px solid rgba(193,127,59,0.16)',
                  backgroundColor: '#14110d',
                }}
              >
                <img
                  src="https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1260"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  alt="Zafran Kitchen"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,5,2,0.92),rgba(8,5,2,0.08))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,127,59,0.12),transparent_35%)]" />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-8 -left-8 bg-[#14110d] border border-[#c17f3b]/20 rounded-3xl p-6 shadow-2xl hidden xl:block backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#c17f3b]/10 flex items-center justify-center">
                    <Star size={18} className="text-[#c17f3b] fill-[#c17f3b]" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/35 font-bold">Michelin Stars</p>
                    <p className="font-serif italic text-2xl text-[#f7f2eb]">Two Stars · 2019</p>
                  </div>
                </div>
              </div>

              {/* Floating year badge */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-xl lg:flex bg-[#c17f3b]">
                <span className="font-serif italic text-[#0c0803] text-xl leading-none">15</span>
                <span className="text-[8px] uppercase tracking-widest font-bold text-[#0c0803]/70">Years</span>
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <Reveal
            delay={0.3}
            className="mt-24 grid grid-cols-3 gap-0 rounded-3xl overflow-hidden border border-[#c17f3b]/15 bg-[#14110d] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            {[
              { num: '15+', label: t('stats.years') },
              { num: '04', label: t('stats.chefs') },
              { num: '12', label: t('stats.awards') },
            ].map(({ num, label }, i) => (
              <div
                key={label}
                className={`px-8 py-10 text-center ${i < 2 ? 'border-r border-[#c17f3b]/10' : ''}`}
              >
                <p className="font-serif text-4xl md:text-5xl" style={{ color: '#c17f3b' }}>
                  {num}
                </p>
                <p className="text-[9px] uppercase tracking-[0.25em] font-bold mt-2 leading-tight" style={{ color: 'rgba(247,242,235,0.5)' }}>
                  {label}
                </p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* ══ 2. PULL QUOTE ══════════════════════════════════════════════ */}
        <Reveal>
          <section className="py-24 px-6 md:px-12 relative overflow-hidden" style={{ backgroundColor: '#14110d' }}>
            <div className="absolute top-0 right-0 w-31.25 h-full pointer-events-none" style={{ background: 'rgba(193,127,59,0.05)' }} />
            <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
              <p className="text-[9px] uppercase tracking-[0.5em] font-bold" style={{ color: '#c17f3b' }}>
                Our Philosophy
              </p>
              <blockquote className="font-serif italic text-4xl md:text-6xl leading-tight" style={{ color: '#f7f2eb' }}>
                "نحن لا نطبخ الطعام <br />
                <span style={{ color: '#c17f3b' }}>نحن نطبخ الذاكرة</span>"
              </blockquote>
              <p className="text-sm font-light" style={{ color: 'rgba(247,242,235,0.42)' }}>
                — Karim Zafrani, Founder
              </p>
            </div>
          </section>
        </Reveal>

        {/* ══ 3. STORY ═══════════════════════════════════════════════════ */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <Reveal className="space-y-8 order-2 lg:order-1">
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold" style={{ color: '#c17f3b' }}>
                Our Story
              </p>
              <h2 className="font-serif italic text-4xl md:text-5xl leading-tight" style={{ color: '#f7f2eb' }}>
                {t('storyTitle')}
              </h2>
              <div className="space-y-6 font-light leading-relaxed text-lg" style={{ color: 'rgba(247,242,235,0.58)' }}>
                <p>{t('storyPara1')}</p>
                <p>{t('storyPara2')}</p>
              </div>
              <div className="h-px w-16" style={{ background: '#c17f3b' }} />
              <p className="text-sm font-light italic" style={{ color: 'rgba(247,242,235,0.42)' }}>
                "Every dish is a love letter to the ingredients." — The Zafran kitchen code
              </p>
            </Reveal>

            <Reveal delay={0.15} className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="aspect-3/4 rounded-3xl overflow-hidden"
                  style={{ boxShadow: '0 18px 60px rgba(0,0,0,0.28)', border: '1px solid rgba(193,127,59,0.16)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800"
                    alt="Kitchen"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="space-y-4 pt-10">
                  <div
                    className="aspect-square rounded-3xl overflow-hidden"
                    style={{ boxShadow: '0 18px 60px rgba(0,0,0,0.28)', border: '1px solid rgba(193,127,59,0.16)' }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800"
                      alt="Dining"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div
                    className="aspect-square rounded-3xl overflow-hidden"
                    style={{ boxShadow: '0 18px 60px rgba(0,0,0,0.28)', border: '1px solid rgba(193,127,59,0.16)' }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800"
                      alt="Dish"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ 7. GALLERY ════════════════════════════════════════════════ */}
        <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
          <Reveal className="text-center mb-12 space-y-3">
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold" style={{ color: '#c17f3b' }}>
              {t('gallerySubtitle')}
            </p>
            <h2 className="font-serif italic text-4xl md:text-5xl" style={{ color: '#f7f2eb' }}>
              {t('galleryTitle')}
            </h2>
          </Reveal>
          <ImageGallery />
        </section>
      </main>
      <Footer />
    </>
  );
}