'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

const IMAGES = [
  'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200',
];

export default function CateringTeaser() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  return (
    <div className="overflow-hidden">
      <section className="relative w-full bg-[#c17f3b] flex flex-col lg:flex-row lg:min-h-[90vh] lg:items-center">

        {/* ── IMAGE STACK ── */}
        {/* Mobile: fixed height at top; Desktop: absolute left half */}
        <div className="relative w-full h-[55vw] max-h-105 lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 lg:h-auto lg:max-h-none">
          <div className="relative w-full h-full" style={{ perspective: '1000px' }}>

            {/* Background stacked cards */}
            {[2, 1].map((offset) => {
              const index = (current + offset) % IMAGES.length;
              return (
                <div
                  key={index}
                  className="absolute rounded-2xl lg:rounded-3xl overflow-hidden"
                  style={{
                    inset: '12px',
                    transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.04}) translateZ(${-offset * 40}px)`,
                    zIndex: 10 - offset,
                    opacity: 1 - offset * 0.25,
                  }}
                >
                  <img src={IMAGES[index]} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              );
            })}

            {/* Active front card */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                initial={{
                  opacity: 0,
                  scale: 0.87,
                  y: direction > 0 ? 50 : -50,
                  rotateX: direction > 0 ? 8 : -8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
                exit={{
                  opacity: 0,
                  scale: 1.05,
                  y: direction > 0 ? -35 : 35,
                  rotateX: direction > 0 ? -4 : 4,
                  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
                className="absolute rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl"
                style={{ inset: '12px', zIndex: 20, transformStyle: 'preserve-3d' }}
              >
                <motion.img
                  src={IMAGES[current]}
                  className="w-full h-full object-cover"
                  alt="catering"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1, transition: { duration: 0.7 } }}
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-[#c17f3b]" />

                {/* Counter badge */}
                <div className="absolute top-4 right-4 lg:top-5 lg:right-5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-white text-[9px] lg:text-[10px] font-bold tracking-widest">
                    {String(current + 1).padStart(2, '0')} / {String(IMAGES.length).padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-5 h-2 bg-[#c17f3b]'
                      : 'w-2 h-2 bg-white/50 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        {/* Mobile: stacked below image; Desktop: right half */}
        <div className="w-full lg:container lg:mx-auto lg:px-6 relative z-10">
          <div className="lg:grid lg:grid-cols-2" dir="ltr">
            <div className="hidden lg:block" />

            <div
              className="px-6 pt-8 pb-14 lg:pl-20 lg:py-20"
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
              <div className={`space-y-5 flex flex-col ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}>

                {/* Label */}
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 lg:w-12 bg-[#0c0803]" />
                  <span className="text-[#0c0803] uppercase tracking-[0.5em] text-[9px] lg:text-[10px] font-black">
                    {t('exclusiveEvents')}
                  </span>
                </div>

                {/* Headline — scaled down on mobile */}
                <h2 className="font-serif text-[#0c0803] text-5xl sm:text-6xl md:text-7xl lg:text-9xl leading-[0.88] italic">
                  {t('cateringTitle1')} <br />
                  <span className="text-white not-italic ml-6 sm:ml-10 lg:ml-16">
                    {t('cateringTitle2')}
                  </span>
                </h2>

                {/* Description */}
                <p className="text-[#0c0803]/90 text-base sm:text-lg lg:text-2xl font-serif max-w-sm lg:max-w-md leading-relaxed pt-2">
                  {t('eventDesc')}
                </p>

                {/* CTA */}
                <div className="pt-6 lg:pt-10">
                  <Link
                    href="/catering"
                    className={`inline-flex items-center gap-4 lg:gap-6 group ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className="bg-[#0c0803] text-[#c17f3b] px-7 py-4 lg:px-10 lg:py-5 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-widest group-hover:bg-white group-hover:text-[#0c0803] transition-colors duration-500">
                      {t('planBuffet')}
                    </span>
                    <div className="p-3 lg:p-4 rounded-full border border-[#0c0803]/20 group-hover:border-[#0c0803] group-hover:translate-x-2 transition-all duration-500">
                      <ArrowRight size={20} className={`text-[#0c0803] ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}