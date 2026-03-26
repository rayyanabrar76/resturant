'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ChevronDown, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

const IMAGES = {
  sandwiches: {
    preview: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&auto=format&fit=crop',
    subfolders: [
      'https://images.unsplash.com/photo-1547050605-2f3000632a9e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1633345245711-6b6c0717bc42?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop',
    ],
  },
  plates: {
    preview: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    subfolders: [
      'https://images.unsplash.com/photo-1544124499-58912cbddada?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593001874117-c99c5ed9918a?q=80&w=800&auto=format&fit=crop',
    ],
  },
  starters: {
    preview: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop',
    subfolders: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    ],
  },
};

export default function MenuDropdown({ label }: { label: string }) {
  const t = useTranslations('menuDropdown');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const categories = t.raw('categories') as {
    id: string;
    label: string;
    arabic: string;
    subfolders: { name: string; items: string[] }[];
  }[];

  const categoriesWithImages = categories.map((cat) => ({
    ...cat,
    previewImage: IMAGES[cat.id as keyof typeof IMAGES].preview,
    subfolders: cat.subfolders.map((sub, i) => ({
      ...sub,
      image: IMAGES[cat.id as keyof typeof IMAGES].subfolders[i],
    })),
  }));

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(categoriesWithImages[0]);
  const [activeImage, setActiveImage] = useState(categoriesWithImages[0].previewImage);

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

                {/* Categories sidebar */}
                <div className="w-55 border-r border-white/5 p-6 flex flex-col gap-2">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold-dark mb-6 font-bold opacity-70">
                    {t('categoriesLabel')}
                  </p>
                  {categoriesWithImages.map((cat) => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => {
                        setActiveTab(cat);
                        setActiveImage(cat.previewImage);
                      }}
                      className={`flex flex-col p-4 rounded-xl transition-all ${isRTL ? 'text-right' : 'text-left'} ${
                        activeTab.id === cat.id
                          ? 'bg-gold-dark/10 border border-gold-dark/30 shadow-[0_0_20px_rgba(184,145,48,0.08)]'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-brand-light text-[15px] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {cat.label}
                      </span>
                      <span className="text-gold-dark/60 text-[10px] uppercase tracking-tighter">
                        {cat.arabic}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Items list */}
                <div className="flex-1 p-8 bg-white/1 overflow-y-auto custom-scrollbar mask-fade-bottom">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold-dark mb-6 font-bold opacity-70">
                    {t('popularChoices')}
                  </p>
                  <div className="grid grid-cols-1 gap-8 pb-16">
                    {activeTab.subfolders.map((sub, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setActiveImage(sub.image)}
                        className="group/sub"
                      >
                        <h4 className={`text-gold-dark text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="w-4 h-px bg-gold-dark/40" />
                          {sub.name}
                        </h4>
                        <ul className="grid grid-cols-1 gap-3">
                          {sub.items.map((item, i) => (
                            <li
                              key={i}
                              className={`text-brand-light/70 text-[14px] hover:text-brand-light cursor-pointer transition-colors flex items-center justify-between group/item ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              <span style={{ fontFamily: "'Jost', sans-serif" }}>{item}</span>
                              <ArrowRight
                                size={12}
                                className={`opacity-0 group-hover/item:opacity-100 transition-all text-gold-dark ${
                                  isRTL
                                    ? 'rotate-180 translate-x-2 group-hover/item:translate-x-0'
                                    : '-translate-x-2 group-hover/item:translate-x-0'
                                }`}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview panel */}
                <div className="w-70 p-6 flex flex-col bg-gold-dark/2 border-l border-white/5">
                  <div className="flex-1">
                    <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl bg-brand-dark">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeImage}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="absolute inset-0"
                        >
                          <div className="absolute inset-0 bg-linear-to-t from-brand-dark via-transparent to-transparent z-10" />
                          <div className="w-full h-full flex items-center justify-center">
                            <Image
                              src={activeImage}
                              alt="Menu Preview"
                              fill
                              className="object-cover opacity-80"
                              unoptimized
                            />
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-20`}>
                        <div className={`flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 mb-2 w-fit ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Star size={10} className="text-gold-dark" fill="#b89130" />
                          <span className="text-[8px] text-brand-light uppercase tracking-widest font-bold">
                            {t('premiumQuality')}
                          </span>
                        </div>
                        <p className="text-brand-light text-lg font-serif italic leading-none">
                          {t('tasteOfLevant')}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-brand-light/50 leading-relaxed text-center px-4 italic">
                      "{t('freshIngredients')}"
                    </p>
                  </div>

                  <Link
                    href="/menu"
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