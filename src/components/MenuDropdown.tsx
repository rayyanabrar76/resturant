'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ChevronDown, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { MENU_DATA } from '@/data/menu';

export default function MenuDropdown({ label }: { label: string }) {
  const t = useTranslations('menuDropdown');   // generic dropdown labels
  const m = useTranslations('MenuExplorer');   // real section + dish names
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(MENU_DATA[0]);
  const [activeItem, setActiveItem] = useState(MENU_DATA[0].items[0]);

  const selectSection = (section: typeof MENU_DATA[number]) => {
    setActiveSection(section);
    setActiveItem(section.items[0]);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link href="/menu" className="flex items-center gap-1.5 py-2 group">
        <span
          className="text-[10px] font-semibold tracking-[0.22em] uppercase transition-colors"
          style={{
            fontFamily: "'Jost', sans-serif",
            color: isOpen ? 'var(--color-gold-dark)' : 'rgba(250,250,249,0.6)',
          }}
        >
          {label}
        </span>
        <ChevronDown size={10} className={`transition-transform text-gold-dark ${isOpen ? 'rotate-180' : ''}`} />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Invisible bridge so the dropdown survives the gap on hover */}
            <div className="absolute top-full left-0 w-full h-6" />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-[calc(100%+15px)] -left-75 w-212.5 z-110 overflow-hidden"
              style={{
                backgroundImage: "url('/images/islamic-circle1.png')",
                backgroundSize: '400px 400px',
                backgroundPosition: 'bottom right',
                backgroundColor: 'var(--color-brand-dark)',
                borderRadius: '28px',
                border: '1px solid rgba(184,145,48,0.3)',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.9)',
              }}
            >
              <div className="absolute inset-0 bg-brand-dark/90 pointer-events-none" />

              <div className="relative z-10 flex h-120" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* ── Sections sidebar ── */}
                <div className="w-55 border-r border-white/5 p-6 flex flex-col gap-2">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold-dark mb-6 font-bold opacity-70">
                    {t('categoriesLabel')}
                  </p>
                  {MENU_DATA.map((section) => {
                    const active = activeSection.categoryKey === section.categoryKey;
                    return (
                      <button
                        key={section.categoryKey}
                        onMouseEnter={() => selectSection(section)}
                        className={`flex flex-col p-4 rounded-xl transition-all ${isRTL ? 'text-right' : 'text-left'} ${
                          active
                            ? 'bg-gold-dark/10 border border-gold-dark/30 shadow-[0_0_20px_rgba(184,145,48,0.08)]'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span className="text-brand-light text-[15px] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {m(section.categoryKey)}
                        </span>
                        <span className="text-gold-dark/60 text-[10px] uppercase tracking-tighter">
                          {m(section.arabicLabelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Items list — each opens its dish modal on the menu page ── */}
                <div className="flex-1 p-8 bg-white/1 overflow-y-auto custom-scrollbar">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold-dark mb-6 font-bold opacity-70">
                    {t('popularChoices')}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {activeSection.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/menu?item=${item.id}` as any}
                          onClick={() => setIsOpen(false)}
                          onMouseEnter={() => setActiveItem(item)}
                          className={`group/item flex items-center gap-4 p-3 rounded-2xl transition-all border ${
                            activeItem.id === item.id
                              ? 'bg-gold-dark/10 border-gold-dark/30'
                              : 'border-transparent hover:bg-white/5'
                          } ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-brand-dark">
                            <Image src={item.image} alt={m(item.nameKey)} fill unoptimized className="object-cover" />
                          </div>
                          <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className="text-brand-light text-[14px] truncate" style={{ fontFamily: "'Jost', sans-serif" }}>
                              {m(item.nameKey)}
                            </p>
                            <p className="text-gold-dark/70 text-[11px] truncate">{m(item.arabicNameKey)}</p>
                          </div>
                          <span className="text-gold-dark text-sm font-medium shrink-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            €{item.price}
                          </span>
                          <ArrowRight
                            size={13}
                            className={`text-gold-dark opacity-0 group-hover/item:opacity-100 transition-all shrink-0 ${isRTL ? 'rotate-180' : ''}`}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── Preview panel ── */}
                <div className="w-70 p-6 flex flex-col bg-gold-dark/2 border-l border-white/5">
                  <div className="flex-1">
                    <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl bg-brand-dark">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeItem.id}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="absolute inset-0"
                        >
                          <div className="absolute inset-0 bg-linear-to-t from-brand-dark via-transparent to-transparent z-10" />
                          <Image src={activeItem.image} alt={m(activeItem.nameKey)} fill unoptimized className="object-cover opacity-85" />
                        </motion.div>
                      </AnimatePresence>

                      <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-20`}>
                        <div className={`flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 mb-2 w-fit ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Star size={10} className="text-gold-dark" fill="#b89130" />
                          <span className="text-[8px] text-brand-light uppercase tracking-widest font-bold">
                            {t('premiumQuality')}
                          </span>
                        </div>
                        <p className="text-brand-light text-lg font-serif italic leading-tight">
                          {m(activeItem.nameKey)}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-brand-light/50 leading-relaxed text-center px-4 italic">
                      &quot;{t('freshIngredients')}&quot;
                    </p>
                  </div>

                  <Link
                    href="/menu"
                    onClick={() => setIsOpen(false)}
                    className={`group mt-6 flex items-center justify-center gap-3 bg-linear-to-r from-gold-dark to-[#8a6d24] py-3.5 rounded-xl text-brand-dark font-bold text-[10px] uppercase tracking-[0.2em] hover:shadow-[0_10px_30px_rgba(184,145,48,0.3)] transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {t('fullExperience')}
                    <ArrowRight
                      size={14}
                      className={`transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
                    />
                  </Link>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
