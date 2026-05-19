'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { MENU_DATA } from '@/data/menu';

const allItems = MENU_DATA.flatMap(s => s.items);
const featured = [
  ...allItems.filter(i => i.isChefsChoice),
  ...allItems.filter(i => i.isHighMargin && !i.isChefsChoice),
].slice(0, 8);

export default function FeaturedDishes() {
  const t = useTranslations('MenuExplorer');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <>
      <style jsx global>{`
        .lev-card::before, .lev-card::after {
          content: ''; position: absolute; width: 20px; height: 20px;
          border-color: rgba(196,148,72,0.4); border-style: solid;
          z-index: 10; pointer-events: none; transition: opacity 0.4s ease; opacity: 0;
        }
        .lev-card::before { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
        .lev-card::after  { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
        .lev-card:hover::before, .lev-card:hover::after { opacity: 1; }
        .lev-img { transition: transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94); }
        .lev-card:hover .lev-img { transform: scale(1.08); }
        .lev-btn-primary {
          background-color: #c49448; color: #0c0803; padding: 14px 36px;
          border-radius: 9999px; font-family: 'Jost', sans-serif;
          font-weight: 700; font-size: 12px; letter-spacing: 0.1em;
          text-transform: uppercase; transition: all 0.3s ease;
          display: flex; align-items: center; gap: 10px; border: none; cursor: pointer;
        }
        .lev-btn-primary:hover { background-color: #f7f2eb; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(196,148,72,0.3); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .lev-view-details {
          position: absolute; inset: 0; display: flex; align-items: center;
          justify-content: center; opacity: 0; transition: opacity 0.25s ease;
          z-index: 10;
        }
        .lev-card:hover .lev-view-details { opacity: 1; }
      `}</style>

      <div dir={isRTL ? 'rtl' : 'ltr'} className="relative" style={{ backgroundColor: '#0c0803' }}>
        <div className="relative z-10 flex overflow-x-auto pb-10 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible px-4">
          {featured.map((item) => (
            <Link
              key={item.id}
              href={`/menu/${item.id}` as any}
              className={[
                'lev-card group snap-center block relative',
                'min-w-[70vw] md:min-w-0',
                isRTL ? 'ml-4 last:ml-0' : 'mr-4 last:mr-0',
                'md:mr-0 md:ml-0',
              ].join(' ')}
              style={{ textDecoration: 'none' }}
            >
              <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-4 shadow-2xl">
                <img
                  src={item.image}
                  alt={t(item.nameKey as any)}
                  className="lev-img w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0c0803]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-3 left-0 right-0 px-3 flex items-center z-10">
                  <span className="text-white/80 text-[11px] font-light italic font-serif">
                    {t(item.arabicNameKey as any)}
                  </span>
                </div>

                {/* View details label on hover */}
                <div className="lev-view-details">
                  <span style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#f7f2eb',
                    background: 'rgba(12,8,3,0.65)',
                    border: '1px solid rgba(196,148,72,0.5)',
                    borderRadius: '9999px',
                    padding: '7px 18px',
                    backdropFilter: 'blur(6px)',
                  }}>
                    {locale === 'de' ? 'Details ansehen' : locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </span>
                </div>
              </div>

              <div className={`flex justify-between items-start px-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 500, color: '#f7f2eb', fontSize: '1.2rem', lineHeight: 1.1, marginBottom: 0 }}>
                    {t(item.nameKey as any)}
                  </h4>
                  <div style={{ width: 24, height: 1, background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, #c49448, transparent)`, margin: '4px 0 6px' }} />
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(196,148,72,0.85)' }}>
                    {t('curatedSelection')}
                  </p>
                </div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: '#c49448', fontSize: '1rem', marginTop: '4px' }}>
                  €{item.price}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-12 pb-16">
          <Link href="/menu">
            <button className="lev-btn-primary group">
              <span>{t('liveMenuBadge')}</span>
              <ArrowRight size={16} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
