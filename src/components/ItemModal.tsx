'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Plus, Leaf, Wheat, Nut, Salad, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MenuItem, DietaryTag } from '@/data/menu';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getTagIcon(tag: DietaryTag) {
  switch (tag) {
    case 'vegan':       return <Leaf size={12} />;
    case 'gluten-free': return <Wheat size={12} />;
    case 'nuts':        return <Nut size={12} />;
    case 'dairy-free':  return <Salad size={12} />;
    default:            return null;
  }
}

export function getTagLabel(tag: DietaryTag, t: ReturnType<typeof useTranslations>) {
  switch (tag) {
    case 'vegan':       return t('tagVegan');
    case 'gluten-free': return t('tagGlutenFree');
    case 'nuts':        return t('tagNuts');
    case 'dairy-free':  return t('tagDairyFree');
    default:            return tag;
  }
}

export function getPairingInsight(item: MenuItem, t: ReturnType<typeof useTranslations>) {
  if (item.nutrition && item.nutrition.protein > 25) return t('pairingHintProtein');
  return t('pairingHintLight');
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
}

export default function ItemModal({ item, onClose, onAdd }: ItemModalProps) {
  const t  = useTranslations('MenuExplorer');
  const m  = useTranslations('Menu');
  const tc = useTranslations('Catering');

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => { setActiveIdx(0); }, [item?.id]);

  const imgs = item ? [item.image, ...(item.images ?? [])] : [];
  const activeImg = imgs[activeIdx] ?? imgs[0];

  const symbol = m('currencySymbol');
  const pos    = m('currencyPos');
  const fmt    = (n: number) => {
    const v = n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return pos === 'prefix' ? `${symbol}${v}` : `${v} ${symbol}`;
  };
  const name = (key: string) => { try { return t(key as any); } catch { return key; } };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{ zIndex: 200, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal — centering wrapper lets Framer animate scale without fighting translateX/Y */}
          <div
            style={{
              position: 'fixed', top: 68, left: 0, right: 0, bottom: 0, zIndex: 210,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{   opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            style={{
              pointerEvents: 'auto',
              display: 'flex', overflow: 'hidden',
              width: '92vw',
              maxWidth: '1200px',
              height: '82vh',
              minHeight: '500px',
              maxHeight: '860px',
              borderRadius: '12px',
              backgroundColor: '#14110d',
              border: '1px solid rgba(193,127,59,0.2)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.85)',
            }}
          >
            {/* ── LEFT: Gallery (45%) ── */}
            <div style={{ width: '45%', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Main image */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={activeImg}
                    alt={name(item.nameKey)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </AnimatePresence>

                {/* Right-edge fade */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 70%, rgba(20,17,13,0.6) 100%)', pointerEvents: 'none' }} />

                {/* Prev / Next arrows */}
                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveIdx(i => (i - 1 + imgs.length) % imgs.length)}
                      style={{
                        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '50%', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#f7f2eb', zIndex: 2,
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActiveIdx(i => (i + 1) % imgs.length)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '50%', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#f7f2eb', zIndex: 2,
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {imgs.length > 1 && (
                <div style={{
                  display: 'flex', gap: '4px', padding: '8px',
                  background: 'rgba(0,0,0,0.55)', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none',
                }}>
                  {imgs.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        width: '62px', height: '50px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0,
                        border: i === activeIdx ? '2px solid #c17f3b' : '2px solid transparent',
                        cursor: 'pointer', padding: 0, transition: 'border-color 0.15s',
                      }}
                    >
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Content (55%) ── */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: '#1a1510', overflow: 'hidden',
            }}>
              {/* Top bar: close button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 16px 0', flexShrink: 0 }}>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    background: 'rgba(247,242,235,0.07)', border: '1px solid rgba(247,242,235,0.12)',
                    borderRadius: '50%', width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'rgba(247,242,235,0.7)', transition: 'all 0.15s',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '12px 32px 28px' }}>

                {/* Arabic name above title */}
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1rem', fontStyle: 'italic', direction: 'rtl',
                  color: 'rgba(193,127,59,0.6)', marginBottom: '6px',
                }}>
                  {name(item.arabicNameKey)}
                </p>

                {/* Title */}
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                  fontWeight: 600, lineHeight: 1.1,
                  color: '#f7f2eb', marginBottom: '14px',
                }}>
                  {name(item.nameKey)}
                </h2>

                {/* Chef's choice */}
                {item.isChefsChoice && (
                  <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c17f3b', marginBottom: '14px' }}>
                    ★ {t('chefsSelection')}
                  </p>
                )}

                {/* Dietary tags */}
                {item.dietaryTags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
                    {item.dietaryTags.map(tag => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 12px', borderRadius: '4px',
                        background: 'rgba(122,170,90,0.15)',
                        border: '1px solid rgba(122,170,90,0.3)',
                        color: '#9ccb78', fontSize: '12px', fontWeight: 500,
                      }}>
                        {getTagIcon(tag)}
                        {getTagLabel(tag, t)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(247,242,235,0.07)', marginBottom: '22px' }} />

                {/* Description */}
                <p style={{
                  fontSize: '15px', lineHeight: 2,
                  color: 'rgba(247,242,235,0.72)', marginBottom: '28px',
                }}>
                  {name(item.descriptionKey)}
                </p>

                {/* Nutrition */}
                {item.nutrition && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
                    {([
                      [t('calories'), item.nutrition.calories],
                      [t('protein'),  `${item.nutrition.protein}g`],
                      [t('carbs'),    `${item.nutrition.carbs}g`],
                    ] as [string, string | number][]).map(([label, value]) => (
                      <div key={label} style={{
                        flex: 1, padding: '12px 14px', borderRadius: '8px',
                        background: 'rgba(193,127,59,0.06)', border: '1px solid rgba(193,127,59,0.15)',
                      }}>
                        <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.35)', marginBottom: '6px' }}>
                          {label}
                        </div>
                        <div style={{ fontSize: '18px', color: '#f7f2eb', fontFamily: "'Cormorant Garamond', serif" }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pairing insight */}
                <div style={{
                  padding: '16px 18px', borderRadius: '8px',
                  background: 'rgba(193,127,59,0.04)',
                  border: '1px solid rgba(193,127,59,0.12)',
                }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(193,127,59,0.5)', marginBottom: '8px' }}>
                    Pairing
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(247,242,235,0.5)', margin: 0 }}>
                    {getPairingInsight(item, t)}
                  </p>
                </div>
              </div>

              {/* ── Footer: price + add button ── */}
              <div style={{
                flexShrink: 0,
                borderTop: '1px solid rgba(247,242,235,0.08)',
                padding: '14px 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#14110d',
              }}>
                <div>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.75rem', fontWeight: 500,
                    color: '#f7f2eb', lineHeight: 1,
                  }}>
                    {fmt(item.price)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(247,242,235,0.4)', marginLeft: '6px' }}>
                    {tc('inclVat')}
                  </span>
                </div>

                <button
                  onClick={() => onAdd(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 22px', borderRadius: '6px',
                    background: '#c17f3b', color: '#0c0803',
                    border: 'none', cursor: 'pointer',
                    fontFamily: "'Jost', sans-serif", fontSize: '11px',
                    fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                    transition: 'background 0.15s',
                  }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  {t('addToSelection')}
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
