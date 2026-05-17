'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import {
  Wine, X, Leaf, Wheat, Nut, Star, Plus,
  Sparkles, Flame, Salad, Clock3, MapPin,
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type DietaryTag = 'vegan' | 'gluten-free' | 'nuts' | 'dairy-free';

export interface MenuItem {
  id: string;
  nameKey: string;
  arabicNameKey: string;
  descriptionKey: string;
  price: number;
  dietaryTags: DietaryTag[];
  categoryKey: string;
  isChefsChoice?: boolean;
  isHighMargin?: boolean;
  image: string;
  availability: { isAvailable: boolean; startTime?: string; endTime?: string };
  nutrition?: { calories: number; protein: number; carbs: number };
}

export interface MenuSection {
  categoryKey: string;
  arabicLabelKey: string;
  items: MenuItem[];
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const generateJSONLD = (items: MenuItem[], t: ReturnType<typeof useTranslations>) => ({
  '@context': 'https://schema.org/',
  '@type': 'Menu',
  hasMenuItem: items.map((item) => ({
    '@type': 'MenuItem',
    name: t(item.nameKey),
    description: t(item.descriptionKey),
    offers: { '@type': 'Offer', price: item.price, priceCurrency: 'EUR' },
  })),
});

const organizeBentoGrid = (items: MenuItem[]): MenuItem[] => {
  const priority = items.filter((i) => i.isChefsChoice || i.isHighMargin);
  const standard = items.filter((i) => !i.isChefsChoice && !i.isHighMargin);
  const result = [...standard];
  if (priority.length > 0) {
    result.splice(1, 0, priority[0]);
    if (priority.length > 1) result.push(...priority.slice(1));
  }
  return result;
};

const getTagIcon = (tag: DietaryTag) => {
  switch (tag) {
    case 'vegan':       return <Leaf size={12} />;
    case 'gluten-free': return <Wheat size={12} />;
    case 'nuts':        return <Nut size={12} />;
    case 'dairy-free':  return <Salad size={12} />;
    default:            return null;
  }
};

const getTagLabel = (tag: DietaryTag, t: ReturnType<typeof useTranslations>) => {
  switch (tag) {
    case 'vegan':       return t('tagVegan');
    case 'gluten-free': return t('tagGlutenFree');
    case 'nuts':        return t('tagNuts');
    case 'dairy-free':  return t('tagDairyFree');
    default:            return tag;
  }
};

const getPairingInsight = (item: MenuItem, t: ReturnType<typeof useTranslations>) => {
  if (item.nutrition && item.nutrition.protein > 25) return t('pairingHintProtein');
  return t('pairingHintLight');
};

const floatingBlobs = [
  'top-10 left-[-80px] w-72 h-72',
  'top-[35%] right-[-110px] w-96 h-96',
  'bottom-[-120px] left-[18%] w-80 h-80',
];

// ─── SECTION COMPONENT ────────────────────────────────────────────────────────

function MenuSectionBlock({
  section, onSelect, onAdd, t,
}: {
  section: MenuSection;
  onSelect: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const items = organizeBentoGrid(section.items);

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-4 relative">
      <div className="absolute inset-x-6 top-10 h-px bg-linear-to-r from-transparent via-[#c17f3b]/20 to-transparent opacity-60" />

      <div className="flex items-end gap-4 mb-4 relative z-10">
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2.25rem, 4vw, 3.05rem)',
            fontWeight: 300, fontStyle: 'italic', color: '#f7f2eb',
            lineHeight: 0.95, textShadow: '0 0 30px rgba(193,127,59,0.06)',
          }}>
            {t(section.categoryKey)}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span style={{ width: 18, height: 1, display: 'inline-block', background: 'rgba(193,127,59,0.6)' }} />
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.35)' }}>
              {t('curatedSelection')}
            </span>
          </div>
        </div>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontStyle: 'italic', color: '#c17f3b', opacity: 0.78, paddingBottom: '5px' }}>
          {t(section.arabicLabelKey)}
        </span>
      </div>

      <div className="mb-8 h-px" style={{ background: 'linear-gradient(to right, rgba(193,127,59,0.55), rgba(193,127,59,0.12), rgba(193,127,59,0.02))' }} />

      <motion.div
        initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[280px]"
      >
        {items.map((item, idx) => {
          const featured = idx === 1;
          return (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, y: 26, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1 } }}
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onSelect(item)}
              className={`group relative overflow-hidden cursor-pointer ${featured ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}
              style={{
                borderRadius: '24px',
                border: '1px solid rgba(193,127,59,0.18)',
                background: 'radial-gradient(circle at top left, rgba(193,127,59,0.08), transparent 50%), #14110d',
                boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
              }}
            >
              <motion.img
                src={item.image} alt={t(item.nameKey)}
                loading="lazy" decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.74 }}
                initial={{ scale: 1.05 }} animate={{ scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                whileHover={{ scale: 1.12 }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,5,2,0.98) 0%, rgba(8,5,2,0.62) 32%, rgba(8,5,2,0.05) 100%)' }} />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: 0.16, background: 'linear-gradient(135deg, rgba(193,127,59,0.16) 0%, transparent 55%, rgba(193,127,59,0.08) 100%)' }}
              />

              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {item.isChefsChoice && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(12,8,3,0.9)', border: '1px solid rgba(193,127,59,0.22)' }}>
                    <Star size={10} fill="#c17f3b" className="text-[#c17f3b]" />
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#c17f3b' }}>
                      {t('chefsSelection')}
                    </span>
                  </div>
                )}
                {item.isHighMargin && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(46,30,12,0.92)', border: '1px solid rgba(193,127,59,0.3)' }}>
                    <Flame size={10} className="text-[#f7a654]" />
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#f7a654' }}>
                      {t('hotItem')}
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 p-6 lg:p-8 text-[#f7f2eb] w-full z-10">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: featured ? '2.25rem' : '1.52rem',
                      fontWeight: 400, fontStyle: 'italic', lineHeight: 1.06,
                      marginBottom: '6px', maxWidth: featured ? '14ch' : '18ch',
                      textShadow: '0 10px 25px rgba(0,0,0,0.35)',
                    }}>
                      {t(item.nameKey)}
                    </h3>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(193,127,59,0.78)', textTransform: 'uppercase' }}>
                      {t(item.arabicNameKey)}
                    </p>
                  </div>
                  <div className="shrink-0 px-3 py-2 rounded-2xl"
                    style={{ backgroundColor: 'rgba(12,8,3,0.88)', border: '1px solid rgba(193,127,59,0.18)' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: featured ? '1.8rem' : '1.4rem', fontWeight: 300, color: '#f7f2eb' }}>
                      €{item.price}
                    </span>
                  </div>
                </div>
                <AnimatePresence>
                  {featured && (
                    <motion.p
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.5 }}
                      className="mt-3 line-clamp-3"
                      style={{ fontSize: '13px', color: 'rgba(247,242,235,0.58)', maxWidth: '440px', lineHeight: 1.65 }}
                    >
                      {t(item.descriptionKey)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Add this dish to the catering / event order */}
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(item); }}
                aria-label={`Add ${t(item.nameKey)} to catering order`}
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
                style={{ backgroundColor: '#c17f3b', border: '1px solid rgba(247,242,235,0.25)', boxShadow: '0 6px 20px rgba(193,127,59,0.45)' }}
              >
                <Plus size={18} color="#0c0803" strokeWidth={2.75} />
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MenuExplorer({ sections }: { sections: MenuSection[] }) {
  const t = useTranslations('MenuExplorer');
  const { addToCart } = useCart();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const allItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // Add a menu dish to the shared catering order, then take the guest to
  // the catering page where it appears in the Event Summary.
  const handleAdd = (item: MenuItem) => {
    addToCart({ id: item.id, nameKey: t(item.nameKey), price: item.price, qty: 1, img: item.image });
    router.push('/catering');
  };

  const searchParams = useSearchParams();
  const router       = useRouter();

  // Open a dish modal when arriving via /menu?item=<id> (e.g. from the
  // header menu dropdown).
  useEffect(() => {
    const itemId = searchParams.get('item');
    if (!itemId) return;
    const found = allItems.find((i) => i.id === itemId);
    if (found) setSelectedItem(found);
  }, [searchParams, allItems]);

  // Close the modal and drop the ?item= param so the same dish can be
  // reopened from the dropdown later.
  const closeModal = useCallback(() => {
    setSelectedItem(null);
    if (searchParams.get('item')) router.replace('/menu');
  }, [searchParams, router]);

  // Lock background scroll while the dish modal is open.
  useEffect(() => {
    document.body.style.overflow = selectedItem ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedItem]);

  const footerHours = [
    [t('monFri'),   t('hoursMonFri')],
    [t('saturday'), t('hoursSaturday')],
    [t('sunday'),   t('hoursSunday')],
  ] as const;

  const footerContacts = [
    [t('reservations'),    t('emailReservations')],
    [t('cateringContact'), t('emailCatering')],
    [t('locationLabel'),   t('location')],
  ] as const;

  return (
    <div
      className="min-h-screen pt-14 text-[#f7f2eb] font-sans selection:bg-[#c17f3b]/20 relative overflow-x-hidden"
      style={{ backgroundColor: '#0c0803' }}
    >
      {/* Background effects */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{ backgroundImage: "url('/images/islamic-circle1.png')", backgroundSize: '620px 620px', backgroundPosition: 'center' }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top,rgba(193,127,59,0.16),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_25%)]" />
      {/* Static decorative blobs — animating a blurred surface re-rasterizes
          the blur every frame and causes severe jank, so these stay still. */}
      {floatingBlobs.map((cls, idx) => (
        <div
          key={idx}
          className={`fixed ${cls} rounded-full blur-3xl pointer-events-none z-0 opacity-20`}
          style={{ background: 'rgba(193,127,59,0.12)' }}
        />
      ))}

      <LayoutGroup>
        {/* ── Hero ── */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-10 md:pt-18 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="rounded-[28px] border border-[#c17f3b]/15 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(193,127,59,0.04) 40%, rgba(255,255,255,0.015) 100%)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.25)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,127,59,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_30%)]" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-0">
              <div className="p-7 sm:p-10 md:p-12 lg:p-14">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c17f3b]/20 bg-black/45">
                    <Sparkles size={13} className="text-[#c17f3b]" />
                    <span style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c17f3b' }}>
                      {t('liveMenuBadge')}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/45 text-white/55">
                    <Clock3 size={12} />
                    <span style={{ fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase' }}>
                      {t('updatedToday')}
                    </span>
                  </span>

                </div>

                <h1 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(3rem, 6vw, 5.2rem)',
                  lineHeight: 0.95, fontStyle: 'italic', fontWeight: 300,
                  color: '#f7f2eb', maxWidth: '12ch',
                  textShadow: '0 15px 50px rgba(0,0,0,0.35)',
                }}>
                  {t('restaurantName')}
                </h1>
                <p className="mt-5 max-w-2xl" style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', lineHeight: 1.9, color: 'rgba(247,242,235,0.58)' }}>
                  {t('heroDescription')}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <div className="px-4 py-3 rounded-2xl border border-[#c17f3b]/12 bg-black/45">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#c17f3b]" />
                      <span style={{ fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.5)' }}>
                        {t('location')}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl border border-[#c17f3b]/12 bg-black/45">
                    <div className="flex items-center gap-2">
                      <Wine size={13} className="text-[#c17f3b]" />
                      <span style={{ fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.5)' }}>
                        {t('sommelierHints')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-50 lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-[#c17f3b]/12">
                <img
                  src={sections[0]?.items?.[0]?.image || ''}
                  alt={t('featuredDishAlt')}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.82, transform: 'scale(1.04)' }}
                />
                <div className="absolute inset-0 bg-linear-to-tr from-[#0c0803] via-[#0c0803]/35 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(12,8,3,0.42)_100%)]" />
                <div className="absolute bottom-5 right-5 rounded-2xl px-4 py-3 border border-[#c17f3b]/18 bg-black/60">
                  <div className="flex items-center gap-2">
                    <Star size={13} fill="#c17f3b" className="text-[#c17f3b]" />
                    <span style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c17f3b' }}>
                      {t('signatureStyle')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Menu Sections ── */}
        <div className="relative z-10">
          {sections.map((section) => (
            <MenuSectionBlock
              key={section.categoryKey}
              section={section}
              onSelect={setSelectedItem}
              onAdd={handleAdd}
              t={t}
            />
          ))}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mt-10">
          <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(193,127,59,0.14), transparent)' }} />
        </div>

        {/* ── Footer ── */}
        <footer className="relative z-10 mt-20 pb-16" style={{ borderTop: '1px solid rgba(193,127,59,0.1)' }}>
          <div className="px-4 sm:px-6 lg:px-8 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 300, fontStyle: 'italic', color: '#f7f2eb', marginBottom: '12px' }}>
                  {t('restaurantName')}
                </p>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', letterSpacing: '0.08em', color: 'rgba(247,242,235,0.35)', lineHeight: 1.8 }}>
                  {t('footerTagline')}
                </p>
              </div>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c17f3b', marginBottom: '16px' }}>
                  {t('hoursLabel')}
                </p>
                {footerHours.map(([day, time]) => (
                  <div key={day} className="flex justify-between mb-2">
                    <span style={{ fontSize: '12px', color: 'rgba(247,242,235,0.45)', fontFamily: "'Jost', sans-serif" }}>{day}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(247,242,235,0.7)',  fontFamily: "'Jost', sans-serif" }}>{time}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c17f3b', marginBottom: '16px' }}>
                  {t('contactLabel')}
                </p>
                {footerContacts.map(([label, value]) => (
                  <div key={label} className="mb-3">
                    <span style={{ fontSize: '9px', fontFamily: "'Jost', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.25)' }}>{label}</span>
                    <p style={{ fontSize: '12px', color: 'rgba(247,242,235,0.6)', fontFamily: "'Jost', sans-serif", marginTop: '2px' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-6 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: '1px solid rgba(193,127,59,0.08)' }}>
              <p style={{ fontSize: '11px', color: 'rgba(247,242,235,0.2)', fontFamily: "'Jost', sans-serif" }}>
                © {new Date().getFullYear()} {t('restaurantName')}. {t('copyright')}
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', fontStyle: 'italic', color: 'rgba(193,127,59,0.4)' }}>
                {t('restaurantNameArabic')}
              </p>
            </div>
          </div>
        </footer>

        {/* ── Item Modal ── */}
        <AnimatePresence>
          {selectedItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={closeModal}
                className="fixed inset-0"
                style={{ zIndex: 200, backgroundColor: 'rgba(12,8,3,0.88)', backdropFilter: 'blur(16px)' }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1,    y: 0 }}
                exit={{   opacity: 0, scale: 0.98,  y: 12 }}
                transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
                className="fixed inset-0 m-auto overflow-hidden flex flex-col md:flex-row"
                style={{
                  zIndex: 210,
                  width: '95vw', maxWidth: '980px',
                  height: 'fit-content', maxHeight: '90vh',
                  borderRadius: '30px',
                  backgroundColor: '#14110d',
                  border: '1px solid rgba(193,127,59,0.25)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.9)',
                }}
              >
                {/* Image side */}
                <div className="w-full md:w-1/2 h-72 md:h-auto relative shrink-0 overflow-hidden">
                  <motion.img
                    src={selectedItem.image}
                    className="w-full h-full object-cover"
                    alt={t(selectedItem.nameKey)}
                    initial={{ scale: 1.04 }} animate={{ scale: 1 }}
                    transition={{ duration: 0.7 }}
                    style={{ opacity: 0.88 }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 48%, rgba(20,17,13,0.8) 100%)' }} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,127,59,0.12),transparent_35%)]" />

                  <button
                    aria-label={t('closeModal')}
                    onClick={closeModal}
                    className="absolute top-5 left-5 p-2.5 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(12,8,3,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(193,127,59,0.25)', color: '#f7f2eb' }}
                  >
                    <X size={18} />
                  </button>

                  <motion.div
                    className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {selectedItem.dietaryTags.slice(0, 3).map((tag) => (
                      <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                        style={{ backgroundColor: 'rgba(12,8,3,0.72)', border: '1px solid rgba(193,127,59,0.18)', backdropFilter: 'blur(10px)', color: 'rgba(193,127,59,0.85)' }}>
                        {getTagIcon(tag)}
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                          {getTagLabel(tag, t)}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Content side */}
                <div className="p-7 md:p-10 md:w-1/2 flex flex-col justify-between overflow-y-auto" style={{ color: '#f7f2eb' }}>
                  <section>
                    <div className="mb-6">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        {selectedItem.isChefsChoice ? (
                          <div className="flex items-center gap-1.5">
                            <Star size={10} fill="#c17f3b" className="text-[#c17f3b]" />
                            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c17f3b' }}>
                              {t('chefsSelection')}
                            </span>
                          </div>
                        ) : <div className="h-4" />}
                        <div className="flex items-center gap-2 rounded-full border border-[#c17f3b]/15 bg-[#c17f3b]/5 px-3 py-1.5">
                          <Clock3 size={11} className="text-[#c17f3b]" />
                          <span style={{ fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.56)' }}>
                            {t('inStock')}
                          </span>
                        </div>
                      </div>

                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.06, color: '#f7f2eb' }}>
                        {t(selectedItem.nameKey)}
                      </h2>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic', color: 'rgba(193,127,59,0.65)', marginTop: '4px' }}>
                        {t(selectedItem.arabicNameKey)}
                      </p>
                    </div>

                    <div className="mb-6 h-px" style={{ background: 'linear-gradient(to right, rgba(193,127,59,0.35), transparent)' }} />

                    <p className="mb-8 leading-relaxed" style={{ fontSize: '14px', color: 'rgba(247,242,235,0.66)', lineHeight: 1.9 }}>
                      {t(selectedItem.descriptionKey)}
                    </p>

                    {selectedItem.nutrition && (
                      <div className="grid grid-cols-3 gap-3 mb-6" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {[
                          [t('calories'), selectedItem.nutrition.calories],
                          [t('protein'),  `${selectedItem.nutrition.protein}g`],
                          [t('carbs'),    `${selectedItem.nutrition.carbs}g`],
                        ].map(([label, value]) => (
                          <div key={String(label)} className="rounded-2xl p-3 border border-[#c17f3b]/12 bg-[#c17f3b]/5">
                            <p style={{ fontSize: '8px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.35)' }}>{label}</p>
                            <p style={{ marginTop: 6, fontSize: '18px', color: '#f7f2eb', fontFamily: "'Cormorant Garamond', serif" }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedItem.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {selectedItem.dietaryTags.map((tag) => (
                          <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                            style={{ backgroundColor: 'rgba(193,127,59,0.08)', border: '1px solid rgba(193,127,59,0.2)', color: 'rgba(193,127,59,0.8)' }}>
                            {getTagIcon(tag)}
                            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                              {getTagLabel(tag, t)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-5 rounded-2xl" style={{ backgroundColor: 'rgba(193,127,59,0.05)', border: '1px solid rgba(193,127,59,0.14)' }}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <Wine size={14} style={{ color: 'rgba(193,127,59,0.5)' }} />
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(193,127,59,0.5)' }}>
                          {t('sommeliersInsight')}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.02rem', fontStyle: 'italic', color: 'rgba(247,242,235,0.74)', lineHeight: 1.75 }}>
                        "{getPairingInsight(selectedItem, t)}"
                      </p>
                    </div>
                  </section>

                  {/* ── CTA ── */}
                  <div className="mt-8 flex flex-col gap-3">
                    {/* Price row */}
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.35)' }}>
                        Price
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: '#c17f3b', lineHeight: 1 }}>
                        €{selectedItem.price}
                      </span>
                    </div>

                    {/* Add this dish to the catering / event order */}
                    <button
                      onClick={() => handleAdd(selectedItem)}
                      className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-colors"
                      style={{
                        background: '#c17f3b',
                        color: '#0c0803',
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
                      }}
                    >
                      <Plus size={16} strokeWidth={2.75} />
                      {t('addToSelection')}
                    </button>

                    <button
                      onClick={closeModal}
                      className="w-full py-3 rounded-2xl transition-colors"
                      style={{ fontFamily: "'Jost', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.3)', border: '1px solid rgba(247,242,235,0.08)' }}
                    >
                      {t('backToMenu')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </LayoutGroup>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJSONLD(allItems, t)) }}
      />
    </div>
  );
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

export const MOCK_MENU: MenuSection[] = [
  {
    categoryKey: 'sectionStarters',
    arabicLabelKey: 'sectionStartersArabic',
    items: [
      { id: 's1', nameKey: 'itemS1Name', arabicNameKey: 'itemS1ArabicName', descriptionKey: 'itemS1Desc', price: 9,  dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionStarters', isChefsChoice: true, image: 'https://immigrantstable.com/wp-content/uploads/2024/08/Canned-Chickpea-Hummus-Recipe-11.jpg', availability: { isAvailable: true }, nutrition: { calories: 220, protein: 10, carbs: 28 } },
      { id: 's2', nameKey: 'itemS2Name', arabicNameKey: 'itemS2ArabicName', descriptionKey: 'itemS2Desc', price: 8,  dietaryTags: ['vegan'],                 categoryKey: 'sectionStarters', image: 'https://www.loveandlemons.com/wp-content/uploads/2022/08/tabbouleh-1.jpg', availability: { isAvailable: true }, nutrition: { calories: 160, protein: 5,  carbs: 22 } },
      { id: 's3', nameKey: 'itemS3Name', arabicNameKey: 'itemS3ArabicName', descriptionKey: 'itemS3Desc', price: 9,  dietaryTags: ['vegan'],                 categoryKey: 'sectionStarters', image: 'https://www.lastingredient.com/wp-content/uploads/2019/04/fattoush-salad2-819x1024.jpg', availability: { isAvailable: true }, nutrition: { calories: 190, protein: 4,  carbs: 30 } },
      { id: 'st1',  nameKey: 'st1Name',  arabicNameKey: 'st1Ar',  descriptionKey: 'st1Desc',  price: 7.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionStarters', image: 'https://www.themediterraneandish.com/wp-content/uploads/2024/05/TMD-Hummus-Leads-02-Vertical.jpg', availability: { isAvailable: true } },
      { id: 'st2',  nameKey: 'st2Name',  arabicNameKey: 'st2Ar',  descriptionKey: 'st2Desc',  price: 7.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'st3',  nameKey: 'st3Name',  arabicNameKey: 'st3Ar',  descriptionKey: 'st3Desc',  price: 7.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'st4',  nameKey: 'st4Name',  arabicNameKey: 'st4Ar',  descriptionKey: 'st4Desc',  price: 5.5, dietaryTags: ['vegan'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'st5',  nameKey: 'st5Name',  arabicNameKey: 'st5Ar',  descriptionKey: 'st5Desc',  price: 9.9, dietaryTags: ['vegan'], categoryKey: 'sectionStarters', image: 'https://www.loveandlemons.com/wp-content/uploads/2022/08/tabbouleh-1.jpg', availability: { isAvailable: true } },
      { id: 'st6',  nameKey: 'st6Name',  arabicNameKey: 'st6Ar',  descriptionKey: 'st6Desc',  price: 9.9, dietaryTags: ['vegan'], categoryKey: 'sectionStarters', image: 'https://www.lastingredient.com/wp-content/uploads/2019/04/fattoush-salad2-819x1024.jpg', availability: { isAvailable: true } },
      { id: 'st7',  nameKey: 'st7Name',  arabicNameKey: 'st7Ar',  descriptionKey: 'st7Desc',  price: 6.5, dietaryTags: ['nuts'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=400&auto=format', availability: { isAvailable: true } },
      { id: 'st8',  nameKey: 'st8Name',  arabicNameKey: 'st8Ar',  descriptionKey: 'st8Desc',  price: 5,   dietaryTags: [], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=400&auto=format', availability: { isAvailable: true } },
      { id: 'st9',  nameKey: 'st9Name',  arabicNameKey: 'st9Ar',  descriptionKey: 'st9Desc',  price: 4.5, dietaryTags: ['nuts'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=400&auto=format', availability: { isAvailable: true } },
      { id: 'st10', nameKey: 'st10Name', arabicNameKey: 'st10Ar', descriptionKey: 'st10Desc', price: 4.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'st11', nameKey: 'st11Name', arabicNameKey: 'st11Ar', descriptionKey: 'st11Desc', price: 4.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'st12', nameKey: 'st12Name', arabicNameKey: 'st12Ar', descriptionKey: 'st12Desc', price: 3,   dietaryTags: ['gluten-free'], categoryKey: 'sectionStarters', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
    ],
  },
  {
    categoryKey: 'sectionPlates',
    arabicLabelKey: 'sectionPlatesArabic',
    items: [
      { id: 'p1', nameKey: 'itemP1Name', arabicNameKey: 'itemP1ArabicName', descriptionKey: 'itemP1Desc', price: 18, dietaryTags: ['nuts'],                  categoryKey: 'sectionPlates', isChefsChoice: true, isHighMargin: true, image: 'https://www.hungrypaprikas.com/wp-content/uploads/2024/01/Kibbeh-Bil-Sanieh-29.jpg', availability: { isAvailable: true }, nutrition: { calories: 580, protein: 34, carbs: 42 } },
      { id: 'p2', nameKey: 'itemP2Name', arabicNameKey: 'itemP2ArabicName', descriptionKey: 'itemP2Desc', price: 15, dietaryTags: ['gluten-free'],            categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true }, nutrition: { calories: 420, protein: 28, carbs: 18 } },
      { id: 'p3', nameKey: 'itemP3Name', arabicNameKey: 'itemP3ArabicName', descriptionKey: 'itemP3Desc', price: 16, dietaryTags: ['dairy-free'],             categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true }, nutrition: { calories: 510, protein: 38, carbs: 32 } },
      { id: 'pl1', nameKey: 'pl1Name', arabicNameKey: 'pl1Ar', descriptionKey: 'pl1Desc', price: 19, dietaryTags: [], categoryKey: 'sectionPlates', isHighMargin: true, image: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl2', nameKey: 'pl2Name', arabicNameKey: 'pl2Ar', descriptionKey: 'pl2Desc', price: 15, dietaryTags: [], categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl3', nameKey: 'pl3Name', arabicNameKey: 'pl3Ar', descriptionKey: 'pl3Desc', price: 15, dietaryTags: ['gluten-free'], categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl4', nameKey: 'pl4Name', arabicNameKey: 'pl4Ar', descriptionKey: 'pl4Desc', price: 13, dietaryTags: [], categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl5', nameKey: 'pl5Name', arabicNameKey: 'pl5Ar', descriptionKey: 'pl5Desc', price: 14, dietaryTags: [], categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl6', nameKey: 'pl6Name', arabicNameKey: 'pl6Ar', descriptionKey: 'pl6Desc', price: 14, dietaryTags: [], categoryKey: 'sectionPlates', isChefsChoice: true, image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl7', nameKey: 'pl7Name', arabicNameKey: 'pl7Ar', descriptionKey: 'pl7Desc', price: 11, dietaryTags: ['vegan'], categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl8', nameKey: 'pl8Name', arabicNameKey: 'pl8Ar', descriptionKey: 'pl8Desc', price: 11, dietaryTags: ['vegan'], categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'pl9', nameKey: 'pl9Name', arabicNameKey: 'pl9Ar', descriptionKey: 'pl9Desc', price: 12, dietaryTags: [], categoryKey: 'sectionPlates', image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
    ],
  },
  {
    categoryKey: 'sectionSandwiches',
    arabicLabelKey: 'sectionSandwichesArabic',
    items: [
      { id: 'w1', nameKey: 'itemW1Name', arabicNameKey: 'itemW1ArabicName', descriptionKey: 'itemW1Desc', price: 10, dietaryTags: ['vegan'],                  categoryKey: 'sectionSandwiches', isChefsChoice: true, image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true }, nutrition: { calories: 390, protein: 14, carbs: 48 } },
      { id: 'w2', nameKey: 'itemW2Name', arabicNameKey: 'itemW2ArabicName', descriptionKey: 'itemW2Desc', price: 12, dietaryTags: ['dairy-free'],             categoryKey: 'sectionSandwiches', isHighMargin: true, image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true }, nutrition: { calories: 460, protein: 32, carbs: 44 } },
      { id: 'w3', nameKey: 'itemW3Name', arabicNameKey: 'itemW3ArabicName', descriptionKey: 'itemW3Desc', price: 11, dietaryTags: [],                        categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true }, nutrition: { calories: 430, protein: 26, carbs: 38 } },
      { id: 'sw1',  nameKey: 'sw1Name',  arabicNameKey: 'sw1Ar',  descriptionKey: 'sw1Desc',  price: 6.5, dietaryTags: ['vegan'], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw2',  nameKey: 'sw2Name',  arabicNameKey: 'sw2Ar',  descriptionKey: 'sw2Desc',  price: 7.5, dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw3',  nameKey: 'sw3Name',  arabicNameKey: 'sw3Ar',  descriptionKey: 'sw3Desc',  price: 6.5, dietaryTags: ['vegan'], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw4',  nameKey: 'sw4Name',  arabicNameKey: 'sw4Ar',  descriptionKey: 'sw4Desc',  price: 6.5, dietaryTags: ['vegan'], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw5',  nameKey: 'sw5Name',  arabicNameKey: 'sw5Ar',  descriptionKey: 'sw5Desc',  price: 7.5, dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw6',  nameKey: 'sw6Name',  arabicNameKey: 'sw6Ar',  descriptionKey: 'sw6Desc',  price: 7,   dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw7',  nameKey: 'sw7Name',  arabicNameKey: 'sw7Ar',  descriptionKey: 'sw7Desc',  price: 7.5, dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw8',  nameKey: 'sw8Name',  arabicNameKey: 'sw8Ar',  descriptionKey: 'sw8Desc',  price: 7,   dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw9',  nameKey: 'sw9Name',  arabicNameKey: 'sw9Ar',  descriptionKey: 'sw9Desc',  price: 7,   dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw10', nameKey: 'sw10Name', arabicNameKey: 'sw10Ar', descriptionKey: 'sw10Desc', price: 8,   dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw11', nameKey: 'sw11Name', arabicNameKey: 'sw11Ar', descriptionKey: 'sw11Desc', price: 8,   dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
      { id: 'sw12', nameKey: 'sw12Name', arabicNameKey: 'sw12Ar', descriptionKey: 'sw12Desc', price: 8,   dietaryTags: [], categoryKey: 'sectionSandwiches', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=800&auto=format&fit=crop', availability: { isAvailable: true } },
    ],
  },
];