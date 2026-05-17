'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { MOCK_MENU, type MenuItem } from '@/components/MenuExplorer';
import { Receipt, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══ DATA ═══════════════════════════════════════════════════════════════════ */

const MENU_ITEMS: MenuItem[] = MOCK_MENU.flatMap(s => s.items);

/* ── Chef Aboud Küche dark palette ── */
const C = {
  bg:         '#0c0803',
  panel:      '#130e07',
  surface:    'rgba(247,242,235,0.04)',
  border:     'rgba(247,242,235,0.09)',
  text:       '#f7f2eb',
  muted:      'rgba(247,242,235,0.45)',
  gold:       '#c17f3b',
  goldDark:   '#a86d2f',
  goldBg:     'rgba(193,127,59,0.12)',
  goldBorder: 'rgba(193,127,59,0.3)',
  tagBg:      'rgba(122,170,90,0.15)',
  tagText:    '#9ccb78',
  red:        'rgba(220,75,65,0.85)',
};

/* ══ CALENDAR ════════════════════════════════════════════════════════════════ */

function CateringCalendar({ selected, onSelect, locale }: {
  selected: Date | null; onSelect: (d: Date) => void; locale: string;
}) {
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const year = view.getFullYear();
  const month = view.getMonth();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const monthLabel = view.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const DOWS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, borderRadius: '8px', padding: '0.4rem 0.65rem', marginBottom: '0.65rem' }}>
        <button type="button" onClick={() => setView(new Date(year, month - 1, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontFamily: 'inherit', fontSize: '0.85rem', padding: '2px 5px', borderRadius: '4px' }}>
          ◄
        </button>
        <span style={{ fontSize: '0.83rem', fontWeight: 600, color: C.text, textTransform: 'capitalize' }}>{monthLabel}</span>
        <button type="button" onClick={() => setView(new Date(year, month + 1, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontFamily: 'inherit', fontSize: '0.85rem', padding: '2px 5px', borderRadius: '4px' }}>
          ►
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {DOWS.map(w => (
          <div key={w} style={{ textAlign: 'center', fontSize: '0.66rem', fontWeight: 600, color: C.muted, padding: '3px 0 5px' }}>{w}</div>
        ))}
        {cells.map((dd, i) => {
          if (dd === null) return <div key={`e${i}`} />;
          const date    = new Date(year, month, dd);
          const past    = date < today;
          const sel     = selected != null && same(date, selected);
          const isToday = same(date, today);
          return (
            <button key={i} type="button" disabled={past}
              onClick={() => !past && onSelect(date)}
              style={{
                textAlign: 'center', fontSize: '0.73rem', padding: '5px 2px',
                borderRadius: '6px', border: 'none', lineHeight: 1.4,
                cursor: past ? 'default' : 'pointer',
                background: sel ? C.gold : isToday ? C.goldBg : 'transparent',
                color: sel ? '#0c0803' : past ? 'rgba(247,242,235,0.18)' : C.text,
                fontWeight: sel || isToday ? 700 : 400,
                outline: isToday && !sel ? `1px solid ${C.goldBorder}` : 'none',
                fontFamily: 'inherit',
              }}>
              {dd}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ══ MOBILE DRAWER ═══════════════════════════════════════════════════════════ */

function MobileDrawer({ open, onClose, panelState, setPanelState, selectedItems,
  totalPrice, totalDishCount, formatVal, dishName, handleInc, handleDec, removeItem,
  selections, guests, setGuests, mealSize, setMealSize, eventDate, setEventDate,
  locale, onBook, isBooking, t, catLabel,
}: {
  open: boolean; onClose: () => void;
  panelState: 'cart' | 'cal'; setPanelState: (s: 'cart' | 'cal') => void;
  selectedItems: MenuItem[]; totalPrice: number; totalDishCount: number;
  formatVal: (n: number) => string; dishName: (k: string) => string;
  handleInc: (id: string) => void; handleDec: (id: string) => void; removeItem: (id: string) => void;
  selections: Record<string, number>;
  guests: number; setGuests: (n: number) => void;
  mealSize: number; setMealSize: (n: number) => void;
  eventDate: Date | null; setEventDate: (d: Date) => void; locale: string;
  onBook: () => void; isBooking: boolean;
  t: ReturnType<typeof useTranslations>;
  catLabel: (k: string) => string;
}) {
  const mealSliderPct = `${(mealSize / 3) * 100}%`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 50, backdropFilter: 'blur(4px)' }}
            onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
              background: C.panel, borderTop: `1px solid ${C.goldBorder}`,
              borderRadius: '20px 20px 0 0', maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '9999px', background: 'rgba(247,242,235,0.18)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.2rem 0.7rem', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '0.88rem', fontFamily: 'Georgia, serif', color: C.text }}>{t('summaryTitle')}</span>
              <button onClick={onClose} style={{ background: C.surface, border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.text, fontFamily: 'inherit' }}>
                <X size={13} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {panelState === 'cart' ? (
                <>
                  {/* slider */}
                  <div style={{ padding: '0.9rem 1.2rem', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      {[t('sizeSnack'), t('sizeLight'), t('sizeFull'), t('sizeLavish')].map(l => (
                        <span key={l} style={{ fontSize: '0.65rem', color: C.muted, flex: 1, textAlign: 'center' }}>{l}</span>
                      ))}
                    </div>
                    <input type="range" min="0" max="3" step="1" value={mealSize}
                      onChange={e => setMealSize(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: C.gold, background: `linear-gradient(to right, ${C.gold} ${mealSliderPct}, rgba(247,242,235,0.12) ${mealSliderPct})`, height: '4px', borderRadius: '4px', outline: 'none', cursor: 'pointer', WebkitAppearance: 'none' }} />
                  </div>
                  {/* cart items */}
                  {MOCK_MENU.map(section => {
                    const sItems = section.items.filter(i => (selections[i.id] || 0) > 0);
                    if (!sItems.length) return null;
                    return (
                      <React.Fragment key={section.categoryKey}>
                        <div style={{ padding: '0.65rem 1.2rem 0.35rem', fontSize: '0.77rem', fontWeight: 700, color: C.text, borderBottom: `2px solid ${C.gold}`, letterSpacing: '0.02em' }}>
                          {catLabel(section.categoryKey)}
                        </div>
                        {sItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1.2rem', borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ width: '54px', height: '54px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={item.image} alt={dishName(item.nameKey)} loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {dishName(item.nameKey)}
                                {item.dietaryTags?.[0] && <span style={{ fontWeight: 400, color: C.muted, fontSize: '0.76rem' }}> • {item.dietaryTags[0]}</span>}
                              </div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: C.text, marginTop: '2px' }}>{formatVal(item.price)}</div>
                            </div>
                            <button onClick={() => removeItem(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: '0.95rem', padding: '2px 4px', flexShrink: 0, lineHeight: 1, fontFamily: 'inherit', borderRadius: '4px' }}>
                              ✕
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <button onClick={() => handleDec(item.id)}
                                style={{ width: '24px', height: '24px', border: `1px solid ${C.border}`, borderRadius: '50%', background: 'transparent', fontSize: '0.9rem', color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
                              <span style={{ fontSize: '0.84rem', fontWeight: 500, minWidth: '18px', textAlign: 'center', color: C.text }}>{selections[item.id]}</span>
                              <button onClick={() => handleInc(item.id)}
                                style={{ width: '24px', height: '24px', border: `1px solid ${C.border}`, borderRadius: '50%', background: 'transparent', fontSize: '0.9rem', color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </>
              ) : (
                <>
                  <button onClick={() => setPanelState('cart')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.85rem 1.2rem', borderBottom: `1px solid ${C.border}`, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: C.gold, fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit', textAlign: 'left' }}>
                    ← {locale === 'de' ? 'Zurück zur Bestellung' : locale === 'ar' ? 'العودة للطلب' : 'Back to order'}
                  </button>
                  <div style={{ padding: '1rem 1.2rem' }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: C.text, marginBottom: '0.75rem' }}>
                      {locale === 'de' ? 'Wann möchtest du dein Catering?' : locale === 'ar' ? 'متى تريد خدمة الضيافة؟' : 'When would you like your catering?'}
                    </p>
                    <CateringCalendar selected={eventDate} onSelect={setEventDate} locale={locale} />
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: '0.7rem 1.2rem 0.25rem', borderTop: `1px solid ${C.border}` }}>
              {panelState === 'cart' ? (
                <>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: C.text, marginBottom: '2px' }}>{formatVal(totalPrice)}</div>
                  <p style={{ fontSize: '0.7rem', color: C.muted, marginBottom: '0.75rem' }}>{t('inclVat')}</p>
                  <button onClick={() => setPanelState('cal')}
                    style={{ width: '100%', padding: '0.9rem', background: C.gold, color: '#0c0803', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.79rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {locale === 'de' ? 'Bestelldetails ergänzen' : locale === 'ar' ? 'إضافة تفاصيل الطلب' : 'Add Order Details'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: C.text }}>{formatVal(totalPrice)}</span>
                    <span style={{ fontSize: '0.7rem', color: C.muted, alignSelf: 'flex-end' }}>{t('inclVat')}</span>
                  </div>
                  <button onClick={onBook} disabled={totalPrice === 0 || isBooking}
                    style={{ width: '100%', padding: '0.9rem', background: totalPrice === 0 ? C.goldBg : C.gold, color: '#0c0803', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.79rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: totalPrice === 0 ? 'not-allowed' : 'pointer' }}>
                    {isBooking ? '…' : t('bookButton')}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ══ MAIN COMPONENT ══════════════════════════════════════════════════════════ */

export default function BuffetCalculator() {
  const t      = useTranslations('Catering');
  const m      = useTranslations('Menu');
  const mt     = useTranslations('MenuExplorer');
  const locale = useLocale();
  const router = useRouter();
  const { cart, addToCart, updateQty } = useCart();
  const isRTL  = locale === 'ar';

  const symbol = m('currencySymbol');
  const pos    = m('currencyPos');

  const formatVal = useCallback((num: number) => {
    const val = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return pos === 'prefix' ? `${symbol}${val}` : `${val} ${symbol}`;
  }, [pos, symbol]);

  const dishName = useCallback(
    (key: string) => { try { return mt(key); } catch { return key; } }, [mt]);
  const catLabel = useCallback(
    (key: string) => { try { return mt(key); } catch { return key; } }, [mt]);

  /* ── State ── */
  const [panelState, setPanelState] = useState<'cart' | 'cal'>('cart');
  const [cookStyle,  setCookStyle]  = useState<'vegan' | 'veg' | 'meat'>('veg');
  const [guests,     setGuests]     = useState(25);
  const [mealType,   setMealType]   = useState<'buffet' | 'hot'>('buffet');
  const [mealSize,   setMealSize]   = useState(1);
  const [eventDate,  setEventDate]  = useState<Date | null>(null);
  const [isBooking,  setIsBooking]  = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ── Cart ── */
  const selections = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(c => { map[c.id] = c.qty; });
    return map;
  }, [cart]);

  const handleInc = useCallback((id: string) => {
    const item = MENU_ITEMS.find(i => i.id === id);
    if (!item) return;
    if (cart.some(c => c.id === id)) updateQty(id, 1);
    else addToCart({ id: item.id, nameKey: mt(item.nameKey), price: item.price, qty: 1, img: item.image });
  }, [cart, updateQty, addToCart, mt]);

  const handleDec    = useCallback((id: string) => updateQty(id, -1), [updateQty]);
  const removeItem   = useCallback((id: string) => updateQty(id, -(selections[id] ?? 0)), [updateQty, selections]);

  const totalDishCount = useMemo(() => Object.values(selections).reduce((a, b) => a + b, 0), [selections]);
  const totalPrice     = useMemo(() => MENU_ITEMS.reduce((s, i) => s + i.price * (selections[i.id] || 0), 0), [selections]);
  const selectedItems  = useMemo(() => MENU_ITEMS.filter(i => (selections[i.id] || 0) > 0), [selections]);

  const handleBooking = useCallback(() => {
    if (totalPrice === 0) return;
    setIsBooking(true);
    const dp = eventDate
      ? `&date=${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      : '';
    router.push(`/checkout?type=catering${dp}` as any);
  }, [totalPrice, router, eventDate]);

  /* ── slider fill ── */
  const sliderPct = `${(mealSize / 3) * 100}%`;

  /* ── section counts for tab badges ── */
  const sectionCount = (catKey: string) =>
    MOCK_MENU.find(s => s.categoryKey === catKey)?.items
      .reduce((s, i) => s + (selections[i.id] || 0), 0) ?? 0;

  /* ──────────────── RENDER ──────────────── */

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: C.bg }}>

      {/* ══ CATEGORY TABS ═══════════════════════════════════════════════════ */}
      <div style={{
        background: 'rgba(19,14,7,0.96)', borderBottom: `1px solid ${C.border}`,
        overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none',
        position: 'sticky', top: '68px', zIndex: 30, backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'inline-flex', padding: '0 1.75rem' }}>
          {MOCK_MENU.map(section => {
            const cnt = sectionCount(section.categoryKey);
            return (
              <button
                key={section.categoryKey}
                style={{
                  padding: '0.8rem 1rem', fontSize: '0.7rem', fontWeight: 600,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: C.muted, cursor: 'pointer', border: 'none',
                  borderBottom: '2px solid transparent',
                  background: 'none', whiteSpace: 'nowrap', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.muted; }}
              >
                {catLabel(section.categoryKey)}{cnt > 0 ? ` (${cnt})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ MAIN 2-COL LAYOUT ════════════════════════════════════════════════ */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 370px', minHeight: 'calc(100vh - 112px)' }}
        className="max-lg:grid-cols-1!"
      >

        {/* ════════ LEFT: CONFIGURATOR (always visible) ════════ */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '600px' }}>

          {/* food background */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: `
              linear-gradient(120deg, rgba(12,8,3,0.97) 0%, rgba(12,8,3,0.83) 52%, rgba(12,8,3,0.36) 100%),
              url('https://images.unsplash.com/photo-1547592180-85f173990554?w=1000&q=80') center/cover no-repeat
            `,
          }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '3.2rem 3rem', maxWidth: '530px' }}>

            {/* Q1 — cook style */}
            <div style={{ marginBottom: '2.4rem' }}>
              <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.45rem,3vw,1.85rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.15, color: C.text }}>
                {t('configCookTitle')}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                {([
                  { id: 'vegan' as const, label: t('cookVegan') },
                  { id: 'veg'   as const, label: t('cookVegetarian') },
                  { id: 'meat'  as const, label: t('cookMeat'), full: true },
                ]).map(opt => {
                  const on = cookStyle === opt.id;
                  return (
                    <button key={opt.id} type="button" onClick={() => setCookStyle(opt.id)}
                      style={{
                        padding: '0.5rem 1.25rem',
                        width: opt.full ? '100%' : 'auto',
                        textAlign: opt.full ? 'left' : 'center',
                        border: `1.5px solid ${on ? C.gold : 'rgba(247,242,235,0.28)'}`,
                        borderRadius: opt.full ? '10px' : '40px',
                        background: on ? C.gold : 'transparent',
                        fontFamily: 'inherit', fontSize: '0.86rem',
                        color: on ? '#0c0803' : C.text,
                        cursor: 'pointer', transition: 'all 0.18s',
                      }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q2 — guest count */}
            <div style={{ marginBottom: '2.4rem' }}>
              <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.45rem,3vw,1.85rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.15, color: C.text }}>
                {t('configGuestsTitle')}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))}
                  style={{ width: '44px', height: '44px', border: `1.5px solid rgba(247,242,235,0.28)`, background: 'transparent', fontSize: '1.3rem', fontWeight: 300, color: C.text, cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.gold; (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = '#0c0803'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,242,235,0.28)'; (e.currentTarget as HTMLElement).style.color = C.text; }}>
                  −
                </button>
                <span style={{ width: '52px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 500, color: C.text }}>{guests}</span>
                <button type="button" onClick={() => setGuests(Math.min(500, guests + 1))}
                  style={{ width: '44px', height: '44px', border: `1.5px solid rgba(247,242,235,0.28)`, background: 'transparent', fontSize: '1.3rem', fontWeight: 300, color: C.text, cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.gold; (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = '#0c0803'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,242,235,0.28)'; (e.currentTarget as HTMLElement).style.color = C.text; }}>
                  +
                </button>
              </div>
            </div>

            {/* Q3 — meal type */}
            <div style={{ marginBottom: '2.4rem' }}>
              <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.45rem,3vw,1.85rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.15, color: C.text }}>
                {t('configMealTitle')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {([
                  { id: 'buffet' as const, label: t('mealBuffet') },
                  { id: 'hot'   as const, label: t('mealHot') },
                ]).map(opt => {
                  const on = mealType === opt.id;
                  return (
                    <button key={opt.id} type="button" onClick={() => setMealType(opt.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '0.5rem 1.25rem',
                        border: `1.5px solid ${on ? C.gold : 'rgba(247,242,235,0.28)'}`,
                        borderRadius: '10px', background: on ? C.gold : 'transparent',
                        fontFamily: 'inherit', fontSize: '0.86rem',
                        color: on ? '#0c0803' : C.text,
                        cursor: 'pointer', transition: 'all 0.18s',
                      }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ════════ RIGHT: ORDER PANEL ════════ */}
        <aside
          className="max-lg:hidden"
          style={{
            background: C.panel, borderLeft: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column',
            position: 'sticky', top: '68px',
            height: 'calc(100vh - 68px)', overflow: 'hidden',
          }}
        >

          {/* ═══ STATE 1: CART ═══ */}
          {panelState === 'cart' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

              {/* person count header */}
              <div style={{ padding: '1.1rem 1.4rem 0.9rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <p style={{ fontSize: '0.88rem', color: C.muted }}>
                  {locale === 'de' ? 'Für' : locale === 'ar' ? 'لـ' : 'For'}{' '}
                  <strong style={{ color: C.text }}>{guests} {t('guestUnit')}</strong>
                  <button
                    onClick={() => {}}
                    style={{ color: C.gold, fontSize: '0.8rem', marginLeft: '5px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                    ({locale === 'de' ? 'ändern' : locale === 'ar' ? 'تغيير' : 'change'})
                  </button>
                </p>
              </div>

              {/* summary bar — "X selected" + ansehen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.4rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                {selectedItems[0] ? (
                  <div style={{ width: '44px', height: '44px', borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={selectedItems[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '9px', background: C.surface, flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: C.text }}>
                  {totalDishCount} {locale === 'de' ? 'gewählte Produkte' : locale === 'ar' ? 'منتجات مختارة' : 'selected items'}
                </span>
                <button
                  onClick={() => setPanelState('cal')}
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>
                  {locale === 'de' ? 'ansehen' : locale === 'ar' ? 'عرض' : 'view'}
                </button>
              </div>

              {/* meal-size slider */}
              <div style={{ padding: '1rem 1.4rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  {[t('sizeSnack'), t('sizeLight'), t('sizeFull'), t('sizeLavish')].map(label => (
                    <span key={label} style={{ fontSize: '0.67rem', color: C.muted, textAlign: 'center', flex: 1, lineHeight: 1.3 }}>{label}</span>
                  ))}
                </div>
                <input
                  type="range" min="0" max="3" step="1" value={mealSize}
                  onChange={e => setMealSize(parseInt(e.target.value))}
                  style={{
                    width: '100%', WebkitAppearance: 'none', height: '4px', borderRadius: '4px',
                    background: `linear-gradient(to right, ${C.gold} ${sliderPct}, rgba(247,242,235,0.12) ${sliderPct})`,
                    outline: 'none', cursor: 'pointer', accentColor: C.gold,
                  }}
                />
              </div>

              {/* scrollable cart items */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {totalDishCount === 0 ? (
                  <div style={{ padding: '2.5rem 1.4rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: C.muted }}>
                      {t('summaryEmptyHint')}
                    </p>
                    <a href={`/${locale}/menu`}
                      style={{ display: 'inline-block', marginTop: '0.9rem', fontSize: '0.78rem', fontWeight: 500, color: C.gold, textDecoration: 'none', border: `1px solid ${C.goldBorder}`, padding: '0.4rem 1rem', borderRadius: '20px' }}>
                      {locale === 'de' ? 'Zum Menü →' : locale === 'ar' ? 'إلى القائمة →' : 'Browse menu →'}
                    </a>
                  </div>
                ) : (
                  MOCK_MENU.map(section => {
                    const sItems = section.items.filter(i => (selections[i.id] || 0) > 0);
                    if (!sItems.length) return null;
                    return (
                      <React.Fragment key={section.categoryKey}>
                        {/* category heading with gold underline */}
                        <div style={{
                          padding: '0.7rem 1.4rem 0.35rem',
                          fontSize: '0.78rem', fontWeight: 700, color: C.text,
                          borderBottom: `2px solid ${C.gold}`,
                          letterSpacing: '0.02em',
                        }}>
                          {catLabel(section.categoryKey)}
                        </div>

                        {sItems.map(item => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.7rem',
                              padding: '0.8rem 1.4rem', borderBottom: `1px solid ${C.border}`,
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.goldBg; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            {/* thumb */}
                            <div style={{ width: '62px', height: '62px', borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={item.image} alt={dishName(item.nameKey)} loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            {/* info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.84rem', fontWeight: 500, marginBottom: '2px', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {dishName(item.nameKey)}
                                {item.dietaryTags?.[0] && (
                                  <span style={{ fontWeight: 400, color: C.muted, fontSize: '0.78rem' }}>
                                    {' '}• {item.dietaryTags[0]}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 500, marginTop: '2px', color: C.text }}>
                                {formatVal(item.price)}
                              </div>
                            </div>

                            {/* red X remove */}
                            <button
                              onClick={() => removeItem(item.id)}
                              title="Remove"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: C.red, fontSize: '1rem', padding: '2px 4px',
                                flexShrink: 0, lineHeight: 1, fontFamily: 'inherit',
                                borderRadius: '4px', transition: 'background 0.15s',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,75,65,0.12)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                            >
                              ✕
                            </button>

                            {/* qty control */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <button onClick={() => handleDec(item.id)}
                                style={{ width: '26px', height: '26px', border: `1px solid ${C.border}`, borderRadius: '50%', background: 'transparent', fontSize: '0.95rem', color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontFamily: 'inherit', transition: 'all 0.15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = C.gold; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.text; }}>
                                −
                              </button>
                              <span style={{ fontSize: '0.86rem', fontWeight: 500, minWidth: '20px', textAlign: 'center', color: C.text }}>
                                {selections[item.id]}
                              </span>
                              <button onClick={() => handleInc(item.id)}
                                style={{ width: '26px', height: '26px', border: `1px solid ${C.border}`, borderRadius: '50%', background: 'transparent', fontSize: '0.95rem', color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontFamily: 'inherit', transition: 'all 0.15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = C.gold; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.text; }}>
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* cart footer */}
              <div style={{ padding: '1rem 1.4rem', borderTop: `1px solid ${C.border}`, background: C.panel, flexShrink: 0 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '3px', color: C.text }}>
                  {formatVal(totalPrice)}
                </div>
                <p style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.85rem' }}>
                  {t('inclVat')}
                </p>
                <button
                  onClick={() => setPanelState('cal')}
                  style={{
                    width: '100%', padding: '0.9rem', background: C.gold,
                    color: '#0c0803', border: 'none', borderRadius: '8px',
                    fontFamily: 'inherit', fontSize: '0.79rem', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.goldDark; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.gold; }}
                >
                  {locale === 'de' ? 'Bestelldetails ergänzen' : locale === 'ar' ? 'إضافة تفاصيل الطلب' : 'Add Order Details'}
                </button>
              </div>
            </div>
          )}

          {/* ═══ STATE 2: CALENDAR ═══ */}
          {panelState === 'cal' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

              {/* back button */}
              <div
                onClick={() => setPanelState('cart')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.9rem 1.4rem', borderBottom: `1px solid ${C.border}`,
                  flexShrink: 0, fontSize: '0.82rem', color: C.gold,
                  cursor: 'pointer', fontWeight: 500, transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.goldBg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                ← {locale === 'de' ? 'Zurück zur Bestellung' : locale === 'ar' ? 'العودة للطلب' : 'Back to order'}
              </div>

              {/* summary row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.1rem 1.4rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                {selectedItems[0] ? (
                  <div style={{ width: '46px', height: '46px', borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={selectedItems[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: '46px', height: '46px', borderRadius: '9px', background: C.surface, flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, fontSize: '0.86rem', fontWeight: 500, color: C.text }}>
                  {totalDishCount} {locale === 'de' ? 'gewählte Produkte' : locale === 'ar' ? 'منتجات مختارة' : 'selected items'}
                </span>
                <button
                  onClick={() => setPanelState('cart')}
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {locale === 'de' ? 'ansehen' : locale === 'ar' ? 'عرض' : 'view'}
                </button>
              </div>

              {/* date row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.4rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <span style={{ fontSize: '0.83rem', color: C.muted }}>
                  {locale === 'de' ? 'Wann:' : locale === 'ar' ? 'متى:' : 'When:'}
                </span>
                <span style={{ flex: 1, fontSize: '0.87rem', fontWeight: 500, color: C.text }}>
                  {eventDate
                    ? eventDate.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
                    : (locale === 'de' ? 'noch nicht gewählt' : locale === 'ar' ? 'لم يُحدد بعد' : 'not selected')}
                </span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1rem', padding: '2px 4px', fontFamily: 'inherit' }}>
                  ✎
                </button>
              </div>

              {/* calendar (scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem 1.4rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.9rem', color: C.text }}>
                  {locale === 'de' ? 'Wann möchtest du dein Catering erhalten?' : locale === 'ar' ? 'متى تريد استلام خدمة الضيافة؟' : 'When would you like your catering?'}
                </div>
                <CateringCalendar selected={eventDate} onSelect={setEventDate} locale={locale} />
                <div style={{ display: 'flex', gap: '0.9rem', marginTop: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: C.muted }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: C.goldBg, flexShrink: 0 }} />
                    <span>{locale === 'de' ? 'Heute' : 'Today'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: C.muted }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: C.gold, flexShrink: 0 }} />
                    <span>{locale === 'de' ? 'Gewählt' : 'Selected'}</span>
                  </div>
                </div>
              </div>

              {/* calendar footer */}
              <div style={{ padding: '1rem 1.4rem', borderTop: `1px solid ${C.border}`, flexShrink: 0, background: C.panel }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', fontWeight: 600, color: C.text, marginBottom: '0.85rem' }}>
                  <span>{locale === 'de' ? 'Gebührenübersicht' : locale === 'ar' ? 'نظرة عامة على الرسوم' : 'Fee overview'}</span>
                  <span>{formatVal(0)}</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: C.text, marginBottom: '3px' }}>{formatVal(totalPrice)}</div>
                <p style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.85rem' }}>{t('inclVat')}</p>
                <button
                  onClick={handleBooking}
                  disabled={totalPrice === 0 || isBooking}
                  style={{
                    width: '100%', padding: '0.9rem',
                    background: totalPrice === 0 ? 'rgba(193,127,59,0.28)' : C.gold,
                    color: '#0c0803', border: 'none', borderRadius: '8px',
                    fontFamily: 'inherit', fontSize: '0.79rem', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: totalPrice === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (totalPrice > 0) (e.currentTarget as HTMLElement).style.background = C.goldDark; }}
                  onMouseLeave={e => { if (totalPrice > 0) (e.currentTarget as HTMLElement).style.background = C.gold; }}
                >
                  {isBooking ? '…' : t('bookButton')}
                </button>
                <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '0.5rem', textAlign: 'center' }}>
                  {t('disclaimer')}
                </p>
              </div>
            </div>
          )}

        </aside>
      </div>

      {/* ══ MOBILE FAB ══════════════════════════════════════════════════════ */}
      <div className="lg:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        padding: '0.75rem 1rem',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.85rem 1.1rem', borderRadius: '14px',
            background: C.panel, border: `1px solid ${C.goldBorder}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', color: C.text, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Receipt size={13} color={C.gold} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, lineHeight: 1 }}>{t('summaryTitle')}</p>
              <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '2px' }}>
                {totalDishCount > 0 ? `${totalDishCount} items · ${guests} ${t('guestUnit')}` : t('guestsLabel')}
              </p>
            </div>
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 600, color: C.text }}>
            {totalPrice > 0 ? formatVal(totalPrice) : '—'}
          </span>
        </button>
      </div>

      {/* ══ MOBILE DRAWER ═══════════════════════════════════════════════════ */}
      <MobileDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        panelState={panelState} setPanelState={setPanelState}
        selectedItems={selectedItems} totalPrice={totalPrice} totalDishCount={totalDishCount}
        formatVal={formatVal} dishName={dishName}
        handleInc={handleInc} handleDec={handleDec} removeItem={removeItem}
        selections={selections}
        guests={guests} setGuests={setGuests}
        mealSize={mealSize} setMealSize={setMealSize}
        eventDate={eventDate} setEventDate={setEventDate} locale={locale}
        onBook={handleBooking} isBooking={isBooking} t={t} catLabel={catLabel}
      />

    </div>
  );
}
