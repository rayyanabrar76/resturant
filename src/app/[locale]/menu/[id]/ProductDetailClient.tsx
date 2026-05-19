'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, ChevronLeft, ChevronRight, ArrowRight, Star, Plus } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { MENU_DATA } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { getTagIcon, getTagLabel } from '@/components/ItemModal';

export default function ProductDetailClient({ id }: { id: string }) {
  const t = useTranslations('MenuExplorer');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { addToCart } = useCart();
  const router = useRouter();

  const item = MENU_DATA.flatMap(s => s.items).find(i => i.id === id);

  if (!item) {
    return (
      <section className="bg-[#0c0803] min-h-screen pt-32 pb-20 px-6 text-[#f7f2eb] flex flex-col items-center justify-center gap-6">
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontStyle: 'italic', color: 'rgba(247,242,235,0.35)' }}>
          Dish not found
        </p>
        <Link
          href="/menu"
          style={{ fontFamily: "'Jost', sans-serif", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c17f3b', textDecoration: 'none' }}
        >
          ← Back to menu
        </Link>
      </section>
    );
  }

  const images = [item.image, ...(item.images ?? [])];

  return (
    <section className="bg-[#0c0803] min-h-screen pt-32 pb-20 px-6 text-[#f7f2eb]">
      <div className="max-w-7xl mx-auto">

        {/* Back link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 mb-12 hover:text-[#c17f3b] transition-colors group"
          style={{ color: 'rgba(247,242,235,0.35)', textDecoration: 'none' }}
        >
          {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            {t('backToMenu')}
          </span>
        </Link>

        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* ── Image ── */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative aspect-4/5 rounded-[40px] overflow-hidden shadow-2xl"
            style={{ border: '1px solid rgba(193,127,59,0.2)' }}
          >
            <img
              src={images[0]}
              alt={t(item.nameKey as any)}
              className="w-full h-full object-cover"
              style={{ opacity: 0.88 }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0c0803] via-transparent to-transparent opacity-50" />

            {/* Chef's choice badge */}
            {item.isChefsChoice && (
              <div
                className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} flex items-center gap-2 px-4 py-2 rounded-full`}
                style={{ backgroundColor: 'rgba(12,8,3,0.78)', backdropFilter: 'blur(12px)', border: '1px solid rgba(193,127,59,0.3)' }}
              >
                <Star size={10} fill="#c17f3b" style={{ color: '#c17f3b' }} />
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c17f3b' }}>
                  {t('chefsSelection')}
                </span>
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div
                className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto"
                style={{ scrollbarWidth: 'none' }}
              >
                {images.slice(1).map((src, i) => (
                  <div key={i} className="shrink-0 w-14 h-14 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(193,127,59,0.2)' }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Content ── */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            dir={isRTL ? 'rtl' : 'ltr'}
            className={isRTL ? 'text-right' : 'text-left'}
          >
            {/* Arabic name */}
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic', direction: 'rtl', color: 'rgba(193,127,59,0.6)', marginBottom: '10px' }}>
              {t(item.arabicNameKey as any)}
            </p>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
              fontWeight: 300, fontStyle: 'italic', lineHeight: 1.04,
              color: '#f7f2eb', marginBottom: '20px',
            }}>
              {t(item.nameKey as any)}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', fontWeight: 300, color: '#c17f3b', lineHeight: 1 }}>
                €{item.price.toFixed(2)}
              </span>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.28)' }}>
                incl. VAT
              </span>
            </div>

            {/* Dietary tags */}
            {item.dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {item.dietaryTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(122,170,90,0.1)', border: '1px solid rgba(122,170,90,0.25)', color: '#9ccb78', fontSize: '12px', fontFamily: "'Jost', sans-serif" }}
                  >
                    {getTagIcon(tag)}
                    {getTagLabel(tag, t)}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, rgba(193,127,59,0.4), transparent)`, marginBottom: '28px' }} />

            {/* Description */}
            <p style={{ fontSize: '15px', lineHeight: 1.95, color: 'rgba(247,242,235,0.58)', marginBottom: '36px', fontFamily: "'Jost', sans-serif" }}>
              {t(item.descriptionKey as any)}
            </p>

            {/* Nutrition */}
            {item.nutrition && (
              <div className="grid grid-cols-3 gap-3 mb-10">
                {([
                  [t('calories'), item.nutrition.calories],
                  [t('protein'),  `${item.nutrition.protein}g`],
                  [t('carbs'),    `${item.nutrition.carbs}g`],
                ] as [string, string | number][]).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(193,127,59,0.05)', border: '1px solid rgba(193,127,59,0.14)' }}
                  >
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.28)', marginBottom: '8px' }}>
                      {label}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: '#f7f2eb', lineHeight: 1 }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add to cart CTA */}
            <button
              onClick={() => { addToCart({ id: item.id, nameKey: t(item.nameKey as any), price: item.price, qty: 1, img: item.image }); router.push('/catering'); }}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl mb-4"
              style={{
                background: '#c17f3b', color: '#0c0803',
                fontFamily: "'Jost', sans-serif", fontSize: '11px',
                fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer',
              }}
            >
              <Plus size={16} strokeWidth={2.75} />
              {t('addToSelection')}
            </button>

            {/* Catering link */}
            <Link
              href="/catering"
              className={`inline-flex items-center gap-3 w-full justify-center py-4 rounded-2xl group transition-colors`}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(247,242,235,0.4)', textDecoration: 'none',
                border: '1px solid rgba(247,242,235,0.08)',
              }}
            >
              {isRTL ? 'اطلب لمناسبتك' : 'Available for Catering & Events'}
              <ArrowRight size={13} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-6 mt-10 pt-8" style={{ borderTop: '1px solid rgba(247,242,235,0.07)' }}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ShieldCheck size={18} style={{ color: '#c17f3b', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.3)' }}>
                  Authentic Ingredients
                </span>
              </div>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Truck size={18} style={{ color: '#c17f3b', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.3)' }}>
                  Premium Packaging
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
