'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';

const StarIcon = ({ size = 12, color = '#c17f3b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <polygon points="10,2 11.8,7.2 17,8 12.8,11.5 14,17 10,14 6,17 7.2,11.5 3,8 8.2,7.2" fill="none" stroke={color} strokeWidth="1" />
  </svg>
);

const SLIDE_SRCS = ['/videos/hero2.mp4', '/videos/hero2.mp4', '/videos/hero-catering.mp4'];

const RECIPE_IMGS = [
  'https://immigrantstable.com/wp-content/uploads/2024/08/Canned-Chickpea-Hummus-Recipe-11.jpg',
  'https://www.loveandlemons.com/wp-content/uploads/2022/08/tabbouleh-1.jpg',
  'https://www.lastingredient.com/wp-content/uploads/2019/04/fattoush-salad2-819x1024.jpg',
  'https://www.hungrypaprikas.com/wp-content/uploads/2024/01/Kibbeh-Bil-Sanieh-29.jpg',
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600',
];

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [current, setCurrent] = useState(0);

  const SLIDES = t.raw('slides') as { ar: string; en: string }[];
  const RECIPES = (t.raw('recipes') as { en: string; ar: string; slug: string }[]).map((r, i) => ({
    ...r,
    img: RECIPE_IMGS[i],
  }));

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % SLIDES.length), 8000);
    return () => clearInterval(timer);
  }, [SLIDES.length]);

  return (
    <section className="bg-[#0c0803] text-[#f7f2eb] overflow-hidden pt-24 w-full">
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marqueeScrollRTL {
          0% { transform: translateX(0); }
          100% { transform: translateX(33.33%); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: ${isRTL ? 'marqueeScrollRTL' : 'marqueeScroll'} 25s linear infinite;
        }
        .pause-on-hover:hover .marquee-container { animation-play-state: paused; }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0px rgba(193, 127, 59, 0.4); }
          100% { box-shadow: 0 0 0 15px rgba(193, 127, 59, 0); }
        }
        .live-dot { animation: pulse-glow 2s infinite; }
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .slow-spin { animation: slowSpin 20s linear infinite; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-serif-italic { font-family: 'Cormorant Garamond', serif; font-style: italic; }
        .font-sans-caps { font-family: 'Jost', sans-serif; text-transform: uppercase; letter-spacing: 0.1em; }
      `}</style>

      <div className="w-full px-2 lg:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 mb-0 items-stretch">

          {/* ── VIDEO BOX ── */}
          <div className="lg:col-span-8 relative h-72 lg:h-96 rounded-[30px] overflow-hidden border border-white/5 bg-black">
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full live-dot" />
              <span className="font-sans-caps text-[8px] font-bold tracking-[0.2em] text-white">
                {t('liveKitchen')}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                <video
                  src={SLIDE_SRCS[current]}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0c0803] via-transparent to-transparent opacity-80" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <motion.div
                initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-serif-italic text-[#c17f3b] text-lg mb-1">{SLIDES[current].ar}</p>
                <h1 className="font-serif-italic text-3xl lg:text-5xl italic leading-tight text-white">
                  {SLIDES[current].en}
                </h1>
              </motion.div>
            </div>
          </div>

          {/* ── SIGNATURE CARD ── */}
          <div className="lg:col-span-4 relative group h-72 lg:h-96 rounded-[30px] overflow-hidden border border-[#c17f3b]/20 bg-[#14110d]">

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="slow-spin opacity-10 w-full h-full">
                <img src="/images/islamic-circle3.png" alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(193,127,59,0.06) 0%, rgba(20,17,13,0.7) 70%)' }}
            />

            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 20% 20%, rgba(193,127,59,0.05) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 80%, rgba(193,127,59,0.05) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 20%, rgba(193,127,59,0.05) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0"
            />

            <div className="relative z-10 h-full p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-[#c17f3b] fill-[#c17f3b]/20" />
                    <span className="font-sans-caps text-[9px] text-[#c17f3b] font-bold tracking-[0.3em]">
                      {t('signature')}
                    </span>
                  </div>
                  <Globe size={14} className="text-white/10" style={{ animation: 'slowSpin 10s linear infinite' }} />
                </div>

                <h2 className={`font-serif text-2xl lg:text-3xl leading-snug text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('craftingMemories')}{' '}
                  <span className="italic font-serif-italic text-[#c17f3b]">{t('memories')}</span>
                  <br />
                  {t('onePlate')}
                </h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-[18px] font-serif text-[#c17f3b]">{t('fresh')}</span>
                    <span className="text-[7px] font-sans-caps text-white/30 tracking-widest uppercase">
                      {t('ingredientBase')}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className={`flex flex-col ${isRTL ? 'items-start' : 'items-end'}`}>
                    <span className="text-[18px] font-serif text-[#c17f3b]">{t('handmade')}</span>
                    <span className="text-[7px] font-sans-caps text-white/30 tracking-widest uppercase">
                      {t('everySingleMorning')}
                    </span>
                  </div>
                </div>

                <Link href="/menu">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#d18f4b' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between w-full p-4 rounded-2xl bg-[#c17f3b] text-[#0c0803] font-bold overflow-hidden relative group"
                  >
                    <span className="relative z-10 font-sans-caps text-[10px] uppercase tracking-[0.2em]">
                      {t('exploreMenu')}
                    </span>
                    <ArrowRight
                      size={18}
                      className={`relative z-10 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
                    />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── MARQUEE ── */}
        <div className="relative pause-on-hover w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="marquee-container pt-6 pb-12">
            {[...RECIPES, ...RECIPES, ...RECIPES].map((recipe, i) => (
              <Link key={i} href={`/menu/${recipe.slug}`} className="w-48 lg:w-64 mx-3 group cursor-pointer shrink-0">
                <div className="w-full aspect-4/5 overflow-hidden rounded-3xl mb-4 border border-white/5 bg-[#1a150f] relative">
                  <motion.img
                    src={recipe.img}
                    className="w-full h-full object-cover transition-all duration-700"
                    whileHover={{ scale: 1.08 }}
                    alt={recipe.en}
                  />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-sans-caps font-bold text-white tracking-widest">
                        {t('viewDetails')}
                      </span>
                      <StarIcon size={12} color="white" />
                    </div>
                  </div>
                </div>
                <div className={`px-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-sans-caps text-[8px] font-bold text-[#c17f3b] mb-1 tracking-widest uppercase">
                    {t('chefsSelection')}
                  </p>
                  <h3 className="font-serif-italic text-lg lg:text-xl leading-tight flex items-center gap-2">
                    <span className="text-white group-hover:text-[#c17f3b] transition-colors">{recipe.en}</span>
                    <span className="text-white/20 text-xs italic">/ {recipe.ar}</span>
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}