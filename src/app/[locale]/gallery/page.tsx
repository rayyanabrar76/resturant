'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, X, ChevronLeft, ChevronRight,
  Camera, Star, Utensils, PartyPopper, LayoutGrid
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────── */
const GALLERY = [
  { id: 1,  category: 'food',     featured: true,  span: 'tall',   src: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=2069', title: 'Saffron Risotto',    desc: 'Slow-cooked arborio, aged parmesan, gold leaf finish'         },
  { id: 2,  category: 'interior', featured: false, span: 'wide',   src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070', title: 'Main Dining Hall',   desc: 'Seating for 80 guests, candlelit evenings'                    },
  { id: 3,  category: 'events',   featured: false, span: 'normal', src: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070', title: 'Buffet Setup',       desc: 'Private events and corporate dining'                          },
  { id: 4,  category: 'food',     featured: true,  span: 'wide',   src: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?q=80&w=2070', title: 'Persian Kabab',     desc: 'Grilled over open flame, saffron marinade'                    },
  { id: 5,  category: 'interior', featured: false, span: 'normal', src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070', title: 'The Bar',           desc: 'Curated cocktails and rare spirits'                           },
  { id: 6,  category: 'events',   featured: true,  span: 'tall',   src: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=2070', title: 'Private Event',     desc: 'Bespoke dining experiences for special occasions'             },
  { id: 7,  category: 'food',     featured: false, span: 'normal', src: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=2080', title: 'Lamb Tagine',       desc: 'Slow-braised with apricots and ras el hanout'                 },
  { id: 8,  category: 'interior', featured: false, span: 'wide',   src: 'https://images.unsplash.com/photo-1550966841-3ee2964d8961?q=80&w=1974', title: 'Private Dining Room',desc: 'Intimate gatherings up to 12 guests'                          },
  { id: 9,  category: 'food',     featured: false, span: 'normal', src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=2080', title: 'Mezze Platter',     desc: 'House-made hummus, baba ganoush, warm flatbread'              },
  { id: 10, category: 'events',   featured: false, span: 'normal', src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070', title: 'Anniversary Dinner',desc: "Tailored menus for life's milestones"                         },
  { id: 11, category: 'food',     featured: false, span: 'normal', src: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=2070', title: "Chef's Special",    desc: 'Seasonal tasting menu, 7 courses'                             },
  { id: 12, category: 'interior', featured: false, span: 'normal', src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=2070', title: 'Garden Terrace',    desc: 'Al fresco dining under the stars'                             },
];

const CATS = [
  { key: 'all',      label: 'All',      icon: LayoutGrid  },
  { key: 'food',     label: 'Cuisine',  icon: Utensils    },
  { key: 'interior', label: 'Ambiance', icon: Camera      },
  { key: 'events',   label: 'Events',   icon: PartyPopper },
];

function getSpanClass(span: string) {
  if (span === 'tall') return 'row-span-2';
  if (span === 'wide') return 'col-span-2';
  return '';
}

/* ─────────────────────────────────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────────────────────────────────── */
function Lightbox({
  images, currentIndex, onClose, onPrev, onNext, onJump,
}: {
  images: typeof GALLERY;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}) {
  const img = images[currentIndex];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onPrev();
      if (e.key === 'ArrowRight')  onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-100 bg-black/96 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full
          border border-white/15 flex items-center justify-center
          text-white/60 hover:text-white hover:border-white/30 transition-all z-10"
      >
        <X size={16} />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-[9px] uppercase tracking-[0.4em] font-bold">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev */}
      <button
        onClick={e => { e.stopPropagation(); onPrev(); }}
        className="absolute left-2 sm:left-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full
          border border-white/15 flex items-center justify-center
          text-white/60 hover:text-white hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10
          transition-all z-10"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Next */}
      <button
        onClick={e => { e.stopPropagation(); onNext(); }}
        className="absolute right-2 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full
          border border-white/15 flex items-center justify-center
          text-white/60 hover:text-white hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10
          transition-all z-10"
      >
        <ChevronRight size={18} />
      </button>

      {/* Image + caption */}
      <div
        className="relative w-full px-14 sm:px-20 md:px-24 max-w-5xl flex flex-col items-center gap-4 sm:gap-6"
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <img
              src={img.src}
              alt={img.title}
              className="w-full max-h-[55vh] sm:max-h-[65vh] md:max-h-[70vh] object-contain rounded-xl sm:rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`caption-${img.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="text-center space-y-0.5"
          >
            <p className="text-[#C9A84C] text-[8px] sm:text-[9px] uppercase tracking-[0.4em] font-bold">{img.category}</p>
            <h3 className="font-serif italic text-lg sm:text-2xl text-white">{img.title}</h3>
            <p className="text-stone-500 text-xs sm:text-sm font-light">{img.desc}</p>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnail strip */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {images.map((im, i) => (
            <button
              key={im.id}
              onClick={() => onJump(i)}
              className={`shrink-0 w-10 h-7 sm:w-14 sm:h-10 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all duration-200
                ${i === currentIndex ? 'border-[#C9A84C] opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}
            >
              <img src={im.src} alt={im.title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────── */
export default function GalleryPage() {
  const t      = useTranslations('Gallery');
  const locale = useLocale();
  const isRTL  = locale === 'ar';

  const [filter,   setFilter]   = useState('all');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === 'all' ? GALLERY : GALLERY.filter(g => g.category === filter);

  const openLightbox  = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);
  const prevImg = useCallback(() =>
    setLightbox(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null),
    [filtered.length]
  );
  const nextImg = useCallback(() =>
    setLightbox(i => i !== null ? (i + 1) % filtered.length : null),
    [filtered.length]
  );
  const jumpImg = useCallback((i: number) => setLightbox(i), []);

  return (
    <main
      className="min-h-screen bg-[#0D0C0A] w-full overflow-x-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-176 h-176 bg-[#C9A84C]/4 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-152 h-128 bg-stone-800/30 rounded-full blur-[120px]" />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative pt-28 sm:pt-32 pb-10 sm:pb-16 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        {/* Oversized bg text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-serif italic text-[clamp(5rem,18vw,18rem)] text-white/2 leading-none whitespace-nowrap">
            Gallery
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-8"
        >
          <div className="space-y-2 sm:space-y-4">
            <p className="text-[#C9A84C] text-[9px] sm:text-[10px] uppercase tracking-[0.5em] font-bold">
              {t('subtitle')}
            </p>
            <h1 className="font-serif italic text-4xl sm:text-6xl md:text-8xl text-white leading-none">
              {t('title')}
            </h1>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm font-light max-w-xs leading-relaxed md:text-right">
            A visual journey through our kitchen, our space, and the moments that make dining with us unforgettable.
          </p>
        </motion.div>
      </div>

      {/* ── FEATURED FILM STRIP ───────────────────────────────────────── */}
      <div className="relative mb-10 sm:mb-16 overflow-hidden">
        <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 md:px-12 overflow-x-auto scrollbar-none pb-2">
          {GALLERY.filter(g => g.featured).map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                const idx = filtered.findIndex(f => f.id === img.id);
                if (idx !== -1) openLightbox(idx);
              }}
              className="group shrink-0 relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-white/8
                w-56 h-36 sm:w-72 sm:h-44"
            >
              <img src={img.src} alt={img.title} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Star size={8} className="text-[#C9A84C] fill-[#C9A84C]" />
                  <span className="text-[#C9A84C] text-[7px] sm:text-[8px] uppercase tracking-[0.3em] font-bold">Featured</span>
                </div>
                <p className="font-serif italic text-white text-base sm:text-lg leading-tight">{img.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="absolute top-0 right-0 bottom-2 w-16 sm:w-24 bg-linear-to-l from-[#0D0C0A] to-transparent pointer-events-none" />
      </div>

      {/* ── FILTERS ───────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto mb-6 sm:mb-10">
        {/*
          Mobile: scroll horizontally, no wrap
          Desktop: wrap
        */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {CATS.map(({ key, label, icon: Icon }) => {
            const count  = key === 'all' ? GALLERY.length : GALLERY.filter(g => g.category === key).length;
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`
                  group shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
                  border text-[10px] font-bold uppercase tracking-widest
                  transition-all duration-300 min-h-9
                  ${active
                    ? 'bg-[#C9A84C] border-[#C9A84C] text-stone-950 shadow-[0_4px_20px_rgba(201,168,76,0.3)]'
                    : 'border-white/10 text-stone-500 hover:border-white/25 hover:text-white bg-white/5'}
                `}
              >
                <Icon size={10} strokeWidth={2} />
                {label}
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold
                  ${active ? 'bg-stone-950/20 text-stone-950' : 'bg-white/10 text-stone-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BENTO GRID ────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-24">
        <motion.div
          layout
          className="
            grid gap-2 sm:gap-3 md:gap-4
            grid-cols-2 auto-rows-[140px]
            sm:grid-cols-2 sm:auto-rows-[180px]
            md:grid-cols-3 md:auto-rows-[200px]
            lg:grid-cols-4 lg:auto-rows-[220px]
          "
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((img, i) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.35, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => openLightbox(i)}
                className={`
                  group relative overflow-hidden rounded-2xl sm:rounded-3xl
                  cursor-pointer bg-stone-900 border border-white/5
                  ${getSpanClass(img.span)}
                `}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent
                  opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Featured badge */}
                {img.featured && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1
                    bg-[#C9A84C] text-stone-950 px-2 py-0.5 rounded-full">
                    <Star size={7} fill="currentColor" strokeWidth={0} />
                    <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest">Featured</span>
                  </div>
                )}

                {/* Expand icon — desktop hover only */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full
                  bg-black/40 backdrop-blur-sm flex items-center justify-center
                  text-white/0 group-hover:text-white/80
                  border border-white/0 group-hover:border-white/20
                  transition-all duration-300">
                  <Maximize2 size={11} />
                </div>

                {/* Info — always visible on mobile, hover on desktop */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4
                  sm:translate-y-2 sm:group-hover:translate-y-0
                  transition-transform duration-300">
                  <h3 className="font-serif italic text-white text-sm sm:text-lg leading-tight line-clamp-1">
                    {img.title}
                  </h3>
                  <p className="text-stone-400 text-[10px] mt-0.5
                    hidden sm:block sm:opacity-0 sm:group-hover:opacity-100
                    transition-opacity duration-300 line-clamp-1">
                    {img.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24 text-stone-600 space-y-2">
            <Camera size={28} className="mx-auto opacity-30" />
            <p className="font-serif italic text-xl text-stone-700">Nothing to show</p>
            <p className="text-[10px] uppercase tracking-widest">Try a different category</p>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            images={filtered}
            currentIndex={lightbox}
            onClose={closeLightbox}
            onPrev={prevImg}
            onNext={nextImg}
            onJump={jumpImg}
          />
        )}
      </AnimatePresence>
    </main>
  );
}