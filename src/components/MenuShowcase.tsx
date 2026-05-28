'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_DATA } from '@/data/menu';
import { Grid3x3, List } from 'lucide-react';
import Footer from '@/components/Footer';

const DIETARY_DISPLAY: Record<string, { label: string; border: string; color: string }> = {
  vegan:        { label: 'Vegan',        border: 'rgba(74,180,35,0.5)',   color: 'rgba(74,180,35,0.9)'   },
  'gluten-free':{ label: 'Gluten Free',  border: 'rgba(193,127,59,0.5)', color: 'rgba(193,127,59,0.9)' },
  nuts:         { label: 'Nuts',         border: 'rgba(220,100,50,0.5)', color: 'rgba(220,100,50,0.9)' },
  'dairy-free': { label: 'Dairy Free',   border: 'rgba(100,160,220,0.5)',color: 'rgba(100,160,220,0.9)'},
};

export default function MenuShowcase() {
  const t      = useTranslations('MenuExplorer');
  const locale = useLocale();
  const isRTL  = locale === 'ar';

  const [view,           setView]           = useState<'browse' | 'classic'>('browse');
  const [activeCategory, setActiveCategory] = useState(MENU_DATA[0].categoryKey);

  const activeSection = MENU_DATA.find(s => s.categoryKey === activeCategory)!;

  const menuLabel     = locale === 'de' ? 'Speisekarte'          : locale === 'ar' ? 'قائمة الطعام'     : 'Our Menu';
  const browseLabel   = locale === 'de' ? 'Durchsuchen'          : locale === 'ar' ? 'تصفح'              : 'Browse';
  const fullMenuLabel = locale === 'de' ? 'Vollständige Karte'   : locale === 'ar' ? 'القائمة الكاملة'  : 'Full Menu';

  return (
    <>
      <div style={{ backgroundColor: '#0c0803', minHeight: '100vh', color: '#f7f2eb' }} dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="pt-28 pb-10 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <span style={{
                fontFamily: "'Jost', sans-serif", fontSize: '10px',
                letterSpacing: '0.4em', textTransform: 'uppercase',
                color: '#c17f3b', fontWeight: 700, display: 'block',
              }}>
                Chef Aboud Küche
              </span>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                fontStyle: 'italic', fontWeight: 300, color: '#f7f2eb', lineHeight: 0.95,
              }}>
                {menuLabel}
              </h1>
              <p style={{
                fontSize: '13px', color: 'rgba(247,242,235,0.45)',
                maxWidth: '420px', lineHeight: 1.85, fontFamily: "'Jost', sans-serif",
              }}>
                {t('heroDescription')}
              </p>
            </div>

            {/* Browse / Classic toggle */}
            <div
              className="flex gap-1 p-1 rounded-full self-start md:self-auto"
              style={{ background: 'rgba(247,242,235,0.05)', border: '1px solid rgba(193,127,59,0.15)' }}
            >
              {([
                { key: 'browse',  label: browseLabel,   Icon: Grid3x3 },
                { key: 'classic', label: fullMenuLabel, Icon: List    },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all"
                  style={{
                    background: view === key ? 'rgba(193,127,59,0.15)' : 'transparent',
                    color:      view === key ? '#c17f3b' : 'rgba(247,242,235,0.35)',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', fontFamily: "'Jost', sans-serif",
                    border: view === key ? '1px solid rgba(193,127,59,0.3)' : '1px solid transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === 'browse' ? (
          <>
            {/* ── Sticky Category Tabs ─────────────────────────────────── */}
            <div
              className="sticky top-16 z-40"
              style={{ backgroundColor: '#0c0803', borderBottom: '1px solid rgba(193,127,59,0.1)' }}
            >
              <div
                className="flex overflow-x-auto px-6 md:px-12 max-w-7xl mx-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
              >
                {MENU_DATA.map(section => (
                  <button
                    key={section.categoryKey}
                    onClick={() => setActiveCategory(section.categoryKey)}
                    style={{
                      fontFamily: "'Jost', sans-serif", fontSize: '9px',
                      fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: activeCategory === section.categoryKey ? '#c17f3b' : 'rgba(247,242,235,0.3)',
                      borderBottom: activeCategory === section.categoryKey ? '2px solid #c17f3b' : '2px solid transparent',
                      padding: '14px 16px', whiteSpace: 'nowrap', flexShrink: 0,
                      background: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    {t(section.categoryKey as any)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Items List ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  {/* Section title */}
                  <div className="flex items-baseline gap-4 mb-6">
                    <h2 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                      fontStyle: 'italic', fontWeight: 300, color: '#f7f2eb',
                    }}>
                      {t(activeSection.categoryKey as any)}
                    </h2>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem',
                      fontStyle: 'italic', color: 'rgba(193,127,59,0.55)',
                    }}>
                      {t(activeSection.arabicLabelKey as any)}
                    </span>
                  </div>
                  <div className="mb-8 h-px" style={{ background: 'linear-gradient(to right, rgba(193,127,59,0.4), rgba(193,127,59,0.05), transparent)' }} />

                  <div className="space-y-3">
                    {activeSection.items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex gap-4 md:gap-6 p-4 md:p-5 rounded-2xl group"
                        style={{
                          background: 'rgba(247,242,235,0.025)',
                          border: '1px solid rgba(193,127,59,0.08)',
                          transition: 'border-color 0.2s ease, background 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'rgba(193,127,59,0.22)';
                          el.style.background   = 'rgba(247,242,235,0.04)';
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'rgba(193,127,59,0.08)';
                          el.style.background   = 'rgba(247,242,235,0.025)';
                        }}
                      >
                        {/* Text — Left (or Right in RTL) */}
                        <div className={`flex-1 flex flex-col gap-2 min-w-0 ${isRTL ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h3 style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                                fontStyle: 'italic', fontWeight: 400, color: '#f7f2eb', lineHeight: 1.2,
                              }}>
                                {t(item.nameKey as any)}
                              </h3>
                              <p style={{
                                fontFamily: "'Jost', sans-serif", fontSize: '9px',
                                letterSpacing: '0.12em', color: 'rgba(193,127,59,0.6)',
                                textTransform: 'uppercase', marginTop: '2px',
                              }}>
                                {t(item.arabicNameKey as any)}
                              </p>
                            </div>
                          </div>

                          <p style={{
                            fontSize: '12px', color: 'rgba(247,242,235,0.38)',
                            lineHeight: 1.7, fontFamily: "'Jost', sans-serif",
                          }}>
                            {t(item.descriptionKey as any)}
                          </p>

                          {item.dietaryTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {item.dietaryTags.map(tag => (
                                <span key={tag} style={{
                                  fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em',
                                  textTransform: 'uppercase', padding: '2px 7px', borderRadius: '9999px',
                                  border: `1px solid ${DIETARY_DISPLAY[tag]?.border || 'rgba(247,242,235,0.2)'}`,
                                  color: DIETARY_DISPLAY[tag]?.color || 'rgba(247,242,235,0.4)',
                                  fontFamily: "'Jost', sans-serif",
                                }}>
                                  {DIETARY_DISPLAY[tag]?.label || tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Image — Right (or Left in RTL) */}
                        <div
                          className={`shrink-0 rounded-xl overflow-hidden transition-all duration-500 group-hover:rounded-full ${isRTL ? 'order-1' : 'order-2'}`}
                          style={{
                            width: 'clamp(72px, 12vw, 112px)',
                            height: 'clamp(72px, 12vw, 112px)',
                            border: '1px solid rgba(193,127,59,0.12)',
                          }}
                        >
                          <img
                            src={item.image}
                            alt={t(item.nameKey as any)}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* ── Classic / Full Menu View ─────────────────────────────── */
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 pb-24">

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.55em', textTransform: 'uppercase', color: '#c17f3b', fontWeight: 700, marginBottom: '1rem' }}>
                Chef Aboud Küche — Berlin
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', fontStyle: 'italic', fontWeight: 300, color: '#f7f2eb', lineHeight: 1, marginBottom: '1.25rem' }}>
                {menuLabel}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ height: '1px', width: '48px', background: 'rgba(193,127,59,0.4)' }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#c17f3b', opacity: 0.5 }} />
                <div style={{ height: '1px', width: '48px', background: 'rgba(193,127,59,0.4)' }} />
              </div>
            </div>

            {MENU_DATA.map((section, sIdx) => (
              <div key={section.categoryKey} style={{ marginBottom: '4rem' }}>

                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(193,127,59,0.5)', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                      {String(sIdx + 1).padStart(2, '0')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontStyle: 'italic', fontWeight: 300, color: '#f7f2eb', margin: 0 }}>
                        {t(section.categoryKey as any)}
                      </h3>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(193,127,59,0.4)' }}>
                        {t(section.arabicLabelKey as any)}
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(193,127,59,0.25), transparent)' }} />
                </div>

                {/* Two-column item grid */}
                <div className="grid md:grid-cols-2" style={{ gap: '1px', background: 'rgba(193,127,59,0.08)', border: '1px solid rgba(193,127,59,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                  {section.items.map(item => (
                    <div
                      key={item.id}
                      style={{ padding: '1.25rem 1.5rem', background: '#0c0803', display: 'flex', flexDirection: 'column', gap: '0.35rem', transition: 'background 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(247,242,235,0.025)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0c0803'; }}
                    >
                      {/* Name row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 400, color: '#f7f2eb', lineHeight: 1.2 }}>
                            {t(item.nameKey as any)}
                          </span>
                          {item.isChefsChoice && (
                            <span style={{ marginLeft: '8px', fontFamily: "'Jost', sans-serif", fontSize: '7px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c17f3b', fontWeight: 700 }}>
                              Chef's Choice
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arabic subtitle */}
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', letterSpacing: '0.1em', color: 'rgba(193,127,59,0.45)', textTransform: 'uppercase', margin: 0 }}>
                        {t(item.arabicNameKey as any)}
                      </p>

                      {/* Description */}
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', color: 'rgba(247,242,235,0.32)', lineHeight: 1.65, margin: 0 }}>
                        {t(item.descriptionKey as any)}
                      </p>

                      {/* Dietary tags */}
                      {item.dietaryTags.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {item.dietaryTags.map(tag => (
                            <span key={tag} style={{
                              fontFamily: "'Jost', sans-serif", fontSize: '7px', fontWeight: 700,
                              letterSpacing: '0.1em', textTransform: 'uppercase',
                              padding: '2px 6px', borderRadius: '9999px',
                              border: `1px solid ${DIETARY_DISPLAY[tag]?.border || 'rgba(247,242,235,0.2)'}`,
                              color: DIETARY_DISPLAY[tag]?.color || 'rgba(247,242,235,0.4)',
                            }}>
                              {DIETARY_DISPLAY[tag]?.label || tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer note */}
            <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(193,127,59,0.1)' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(247,242,235,0.22)' }}>
                {locale === 'de' ? 'Bitte informieren Sie uns über Allergien oder Unverträglichkeiten.' : locale === 'ar' ? 'يرجى إخبارنا بأي حساسية أو عدم تحمل غذائي.' : 'Please inform us of any allergies or dietary requirements.'}
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

