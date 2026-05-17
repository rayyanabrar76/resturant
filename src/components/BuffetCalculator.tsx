'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { MOCK_MENU, type MenuItem } from '@/components/MenuExplorer';
import {
  Plus, Minus, Users, Receipt, Calendar,
  ChevronRight, ChevronLeft, Check, Utensils, X, ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════════════ */

const MENU_ITEMS: MenuItem[] = MOCK_MENU.flatMap((s) => s.items);

const STATION_NUMERALS: Record<string, string> = {
  sectionStarters:   'I',
  sectionPlates:     'II',
  sectionSandwiches: 'III',
};

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════════════════════════ */

function Counter({ value, className, style }: { value: string; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.span key={value} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }} className={className} style={style}>
      {value}
    </motion.span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CATERING CALENDAR
══════════════════════════════════════════════════════════════════════════ */

function CateringCalendar({ selected, onSelect, locale }: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  locale: string;
}) {
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const year  = view.getFullYear();
  const month = view.getMonth();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth  = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let dd = 1; dd <= daysInMonth; dd++) cells.push(dd);

  const monthLabel = view.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const weekdays   = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(247,242,235,0.05)', border: '1px solid rgba(247,242,235,0.08)' }}>
      <div className="flex items-center justify-between mb-3">
        <button type="button" aria-label="Previous month" onClick={() => setView(new Date(year, month - 1, 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/45 hover:text-gold hover:bg-white/5 transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="font-serif text-sm capitalize" style={{ color: '#f7f2eb' }}>{monthLabel}</span>
        <button type="button" aria-label="Next month" onClick={() => setView(new Date(year, month + 1, 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/45 hover:text-gold hover:bg-white/5 transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[8px] uppercase tracking-wider font-bold"
            style={{ color: 'rgba(247,242,235,0.3)' }}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dd, i) => {
          if (dd === null) return <div key={`e${i}`} />;
          const date    = new Date(year, month, dd);
          const past    = date < today;
          const sel     = selected != null && same(date, selected);
          const isToday = same(date, today);
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onSelect(date)}
              className="aspect-square rounded-lg text-[11px] font-bold flex items-center justify-center transition-colors"
              style={{
                background: sel ? '#c17f3b' : 'transparent',
                color: sel ? '#0c0803' : past ? 'rgba(247,242,235,0.16)' : '#f7f2eb',
                border: isToday && !sel ? '1px solid rgba(193,127,59,0.45)' : '1px solid transparent',
                cursor: past ? 'not-allowed' : 'pointer',
              }}
            >
              {dd}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DISH CARD — vertical product card (image · name · tag · desc · price+qty)
══════════════════════════════════════════════════════════════════════════ */

function DishRow({
  item, qty, onInc, onDec, name, desc, formatVal, isRTL, isSelected, t,
  stationIndex, itemIndex,
}: {
  item: typeof MENU_ITEMS[number];
  qty: number; onInc: () => void; onDec: () => void;
  name: string; desc: string; formatVal: (n: number) => string;
  isRTL: boolean; isSelected: boolean;
  t: ReturnType<typeof useTranslations>;
  stationIndex: number; itemIndex: number;
}) {
  const dietary = item.dietaryTags?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stationIndex * 0.05 + itemIndex * 0.04, duration: 0.3 }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="group relative flex flex-col rounded-2xl overflow-hidden h-full transition-all duration-300"
      style={{
        background: 'rgba(247,242,235,0.035)',
        border: `1px solid ${isSelected ? 'rgba(193,127,59,0.5)' : 'rgba(247,242,235,0.08)'}`,
        boxShadow: isSelected ? '0 12px 34px rgba(193,127,59,0.14)' : 'none',
      }}
    >
      {isSelected && (
        <span className="absolute top-0 bottom-0 z-10" style={{ width: '3px', background: '#c17f3b', insetInlineStart: 0 }} />
      )}

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '5 / 4' }}>
        <img
          src={item.image}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.isChefsChoice && (
          <span
            className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} text-[8px] uppercase tracking-wider font-bold px-2 py-1 rounded-full`}
            style={{ background: 'rgba(12,8,3,0.85)', color: '#c17f3b', border: '1px solid rgba(193,127,59,0.35)' }}
          >
            {t('tagChefsPick')}
          </span>
        )}
      </div>

      <div className={`flex flex-col flex-1 p-4 sm:p-5 gap-2.5 ${isRTL ? 'text-right' : ''}`}>
        <h4 className="font-serif leading-snug" style={{ color: '#f7f2eb', fontSize: '1.05rem' }}>
          {name}
        </h4>

        {dietary && (
          <span
            className="self-start text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md"
            style={{
              background: 'rgba(122,170,90,0.15)',
              color: '#9ccb78',
              border: '1px solid rgba(122,170,90,0.3)',
            }}
          >
            {dietary.replace('-', ' ')}
          </span>
        )}

        {desc && (
          <p
            className="text-[11.5px] leading-relaxed"
            style={{
              color: 'rgba(247,242,235,0.45)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {desc}
          </p>
        )}

        <div className={`flex items-end justify-between gap-3 mt-auto pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="font-serif font-bold" style={{ color: '#f7f2eb', fontSize: '1.2rem', lineHeight: 1 }}>
              {formatVal(item.price)}
            </p>
            <p className="text-[8px] uppercase tracking-wide mt-1" style={{ color: 'rgba(247,242,235,0.32)' }}>
              {t('inclVat')}
            </p>
          </div>

          {qty === 0 ? (
            <button
              onClick={onInc}
              aria-label={t('addDishLabel', { dish: name })}
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 hover:brightness-110"
              style={{ background: '#c17f3b', color: '#0c0803' }}
            >
              <Plus size={18} strokeWidth={2.75} />
            </button>
          ) : (
            <div
              className="flex items-center gap-2 rounded-xl shrink-0 px-1.5 py-1"
              style={{ background: 'rgba(193,127,59,0.12)', border: '1px solid rgba(193,127,59,0.4)' }}
            >
              <button onClick={onDec} aria-label={t('removeDishLabel', { dish: name })}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:bg-gold hover:text-stone-950 active:scale-90 transition-all">
                <Minus size={13} />
              </button>
              <span className="font-serif font-bold text-white w-7 text-center tabular-nums text-sm select-none">{qty}</span>
              <button onClick={onInc} aria-label={t('addDishLabel', { dish: name })}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:bg-gold hover:text-stone-950 active:scale-90 transition-all">
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STATION BLOCK
══════════════════════════════════════════════════════════════════════════ */

function StationBlock({
  categoryKey, numeral, items, selections, onInc, onDec, dishName, catLabel,
  formatVal, isRTL, t, stationIndex,
}: {
  categoryKey: string;
  numeral: string;
  items: typeof MENU_ITEMS[number][];
  selections: Record<string, number>;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  dishName: (key: string) => string;
  catLabel: (key: string) => string;
  formatVal: (n: number) => string;
  isRTL: boolean;
  t: ReturnType<typeof useTranslations>;
  stationIndex: number;
}) {
  const T = {
    cream:    '#f7f2eb',
    creamMid: 'rgba(247,242,235,0.55)',
    creamLow: 'rgba(247,242,235,0.3)',
    gold:     '#c17f3b',
    borderSub:'rgba(247,242,235,0.08)',
  };

  const selectedCount = items.filter(i => (selections[i.id] || 0) > 0).length;

  return (
    <motion.div
      id={`station-${categoryKey}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stationIndex * 0.12, duration: 0.4 }}
      className="space-y-3 scroll-mt-32"
    >
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="flex items-end justify-between gap-4 pb-4"
        style={{ borderBottom: '1px solid rgba(247,242,235,0.07)' }}
      >
        <div className={`flex items-end gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span
            className="font-serif leading-none select-none shrink-0"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              color: 'rgba(193,127,59,0.12)',
              lineHeight: 0.85,
              letterSpacing: '-0.02em',
            }}
          >
            {numeral}
          </span>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold mb-0.5" style={{ color: T.gold }}>
              {t('stationLabel')} {numeral}
            </p>
            <h3
              className="font-serif italic"
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.875rem)', color: T.cream, lineHeight: 1.1 }}
            >
              {catLabel(categoryKey)}
            </h3>
          </div>
        </div>

        <AnimatePresence>
          {selectedCount > 0 ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
              style={{ background: 'rgba(193,127,59,0.12)', border: '1px solid rgba(193,127,59,0.25)' }}
            >
              <Check size={9} style={{ color: T.gold }} />
              <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: T.gold }}>
                {selectedCount} {selectedCount === 1 ? t('selectedOne') : t('selectedMany')}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(247,242,235,0.04)', border: '1px solid rgba(247,242,235,0.07)' }}
            >
              <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: T.creamLow }}>
                {t('noneSelected')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {items.map((item, idx) => (
          <DishRow
            key={item.id}
            item={item}
            qty={selections[item.id] || 0}
            onInc={() => onInc(item.id)}
            onDec={() => onDec(item.id)}
            name={dishName(item.nameKey)}
            desc={dishName(item.descriptionKey)}
            formatVal={formatVal}
            isRTL={isRTL}
            isSelected={(selections[item.id] || 0) > 0}
            t={t}
            stationIndex={stationIndex}
            itemIndex={idx}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MOBILE SUMMARY DRAWER
══════════════════════════════════════════════════════════════════════════ */

function SummaryDrawer({ open, onClose, guests, setGuests, selections, totalPrice,
  avgPerPerson, priceTier, totalDishCount, formatVal, onBook, isBooking, isRTL, t, dishName,
  eventDate, setEventDate, locale,
}: {
  open: boolean; onClose: () => void; guests: number; setGuests: (n: number) => void;
  selections: Record<string, number>; totalPrice: number; avgPerPerson: number;
  priceTier: { label: string; color: string } | null; totalDishCount: number;
  formatVal: (n: number) => string; onBook: () => void; isBooking: boolean; isRTL: boolean;
  t: ReturnType<typeof useTranslations>; dishName: (key: string) => string;
  eventDate: Date | null; setEventDate: (d: Date) => void; locale: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 lg:hidden backdrop-blur-sm"
            onClick={onClose} aria-hidden="true" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog" aria-modal="true" aria-label={t('summaryTitle')}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden text-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            style={{ background: '#130e07', borderTop: '1px solid rgba(193,127,59,0.15)' }}
          >
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className={`flex items-center justify-between px-5 pt-1 pb-3 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{ borderBottom: '1px solid rgba(247,242,235,0.07)' }}>
              <div className="flex items-center gap-2">
                <Receipt className="text-gold" size={16} />
                <h3 className="text-base font-serif">{t('summaryTitle')}</h3>
              </div>
              <button onClick={onClose} aria-label={t('closeLabel')}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all">
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{ scrollbarWidth: 'thin' }}>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: 'rgba(247,242,235,0.4)' }}>
                  {t('guestsLabel')}
                </label>
                <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                  style={{ background: 'rgba(247,242,235,0.05)' }}>
                  <button onClick={() => setGuests(Math.max(1, guests - 5))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold hover:text-stone-950 active:scale-90 transition-all"
                    style={{ background: 'rgba(247,242,235,0.08)' }}>
                    <Minus size={13} />
                  </button>
                  <div className="text-center">
                    <input type="number" min="1" max="500" value={guests}
                      onChange={e => setGuests(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                      className="bg-transparent text-white text-2xl font-serif font-bold w-16 text-center focus:outline-none tabular-nums" />
                    <p className="text-[9px] uppercase tracking-widest font-bold -mt-1" style={{ color: 'rgba(247,242,235,0.3)' }}>
                      {t('guestUnit')}
                    </p>
                  </div>
                  <button onClick={() => setGuests(Math.min(500, guests + 5))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold hover:text-stone-950 active:scale-90 transition-all"
                    style={{ background: 'rgba(247,242,235,0.08)' }}>
                    <Plus size={13} />
                  </button>
                </div>
                <input type="range" min="10" max="500" step="5" value={guests}
                  onChange={e => setGuests(parseInt(e.target.value))}
                  className="w-full accent-gold rounded-lg appearance-none h-1.5 cursor-pointer"
                  style={{ background: 'rgba(247,242,235,0.1)' }} />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5"
                  style={{ color: 'rgba(247,242,235,0.4)' }}>
                  <Calendar size={10} /> {t('eventDate')}
                </label>
                <CateringCalendar selected={eventDate} onSelect={setEventDate} locale={locale} />
              </div>

              {totalDishCount > 0 && (
                <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: 'rgba(247,242,235,0.05)' }}>
                  <p className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5" style={{ color: 'rgba(247,242,235,0.4)' }}>
                    <Utensils size={9} /> {t('selectedDishesLabel')}
                  </p>
                  {MENU_ITEMS.filter(i => (selections[i.id] || 0) > 0).map(item => (
                    <div key={item.id} className={`flex justify-between text-[11px] pb-1 last:border-0 ${isRTL ? 'flex-row-reverse' : ''}`}
                      style={{ borderBottom: '1px solid rgba(247,242,235,0.06)', color: 'rgba(247,242,235,0.55)' }}>
                      <span className="truncate max-w-42">{dishName(item.nameKey)}</span>
                      <span className="font-bold text-white ml-2 shrink-0">×{selections[item.id]}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 pt-2" style={{ borderTop: '1px solid rgba(247,242,235,0.08)' }}>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: 'rgba(247,242,235,0.4)' }}>{t('totalLabel')}</p>
                  <Counter value={formatVal(totalPrice)} className="block text-3xl font-serif text-white" />
                </div>
                <AnimatePresence>
                  {avgPerPerson > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-xl px-4 py-3 space-y-2" style={{ background: 'rgba(247,242,235,0.05)' }}>
                      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <p className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1" style={{ color: 'rgba(247,242,235,0.4)' }}>
                          <Users size={9} /> {t('perPersonLabel')}
                        </p>
                        <Counter value={`~ ${formatVal(avgPerPerson)}`} className="text-base font-serif text-gold font-bold" />
                      </div>
                      {priceTier && <p className={`text-[9px] uppercase tracking-widest font-bold ${priceTier.color}`}>{priceTier.label}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="px-5 pt-3 pb-2 shrink-0" style={{ borderTop: '1px solid rgba(247,242,235,0.08)' }}>
              <button onClick={onBook} disabled={totalPrice === 0 || isBooking}
                className="w-full min-h-13 bg-gold text-stone-950 rounded-2xl font-bold uppercase tracking-widest text-[10px]
                  hover:bg-white active:scale-[0.98] transition-all disabled:opacity-20 shadow-lg shadow-gold/20
                  flex items-center justify-center gap-2">
                {isBooking ? <span className="animate-pulse">…</span>
                  : <>{t('bookButton')} {isRTL ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}</>}
              </button>
              <p className="text-[9px] text-center uppercase tracking-tighter italic mt-2" style={{ color: 'rgba(247,242,235,0.25)' }}>
                {t('disclaimer')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */

export default function BuffetCalculator() {
  const t      = useTranslations('Catering');
  const m      = useTranslations('Menu');
  const mt     = useTranslations('MenuExplorer');
  const locale = useLocale();
  const router = useRouter();
  const { cart, addToCart, updateQty } = useCart();

  const symbol = m('currencySymbol');
  const pos    = m('currencyPos');
  const isRTL  = locale === 'ar';

  const formatVal = useCallback((num: number) => {
    const val = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return pos === 'prefix' ? `${symbol}${val}` : `${val} ${symbol}`;
  }, [pos, symbol]);

  const dishName = useCallback(
    (key: string) => { try { return mt(key); } catch { return key; } }, [mt]);

  const catLabel = useCallback(
    (key: string) => { try { return mt(key); } catch { return key; } }, [mt]);

  const [guests,      setGuests]      = useState(20);
  const [isBooking,   setIsBooking]   = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [eventDate,   setEventDate]   = useState<Date | null>(null);
  const [cookStyle,   setCookStyle]   = useState<'vegan' | 'veg' | 'meat'>('meat');
  const [mealType,    setMealType]    = useState<'buffet' | 'hot'>('buffet');

  const selections = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((c) => { map[c.id] = c.qty; });
    return map;
  }, [cart]);

  const handleInc = useCallback((id: string) => {
    const item = MENU_ITEMS.find((i) => i.id === id);
    if (!item) return;
    if (cart.some((c) => c.id === id)) updateQty(id, 1);
    else addToCart({ id: item.id, nameKey: mt(item.nameKey), price: item.price, qty: 1, img: item.image });
  }, [cart, updateQty, addToCart, mt]);

  const handleDec = useCallback((id: string) => updateQty(id, -1), [updateQty]);

  const totalDishCount = useMemo(() => Object.values(selections).reduce((a, b) => a + b, 0), [selections]);
  const totalPrice     = useMemo(() => MENU_ITEMS.reduce((sum, item) => sum + item.price * (selections[item.id] || 0), 0), [selections]);
  const avgPerPerson   = useMemo(() => (guests > 0 && totalPrice > 0 ? totalPrice / guests : 0), [totalPrice, guests]);

  const mealSizeStep = useMemo(() => {
    if (avgPerPerson < 8)  return 0;
    if (avgPerPerson < 15) return 1;
    if (avgPerPerson < 25) return 2;
    return 3;
  }, [avgPerPerson]);

  const priceTier = useMemo(() => {
    if (avgPerPerson === 0) return null;
    if (avgPerPerson < 10) return { label: t('tierBudget'),  color: 'text-green-400' };
    if (avgPerPerson < 20) return { label: t('tierValue'),   color: 'text-amber-400' };
    return                        { label: t('tierPremium'), color: 'text-gold'      };
  }, [avgPerPerson, t]);

  const groupedByCategory = useMemo(() => {
    const veganOnly = cookStyle !== 'meat';
    const map = new Map<string, typeof MENU_ITEMS[number][]>();
    for (const item of MENU_ITEMS) {
      if (veganOnly && !item.dietaryTags?.includes('vegan')) continue;
      if (!map.has(item.categoryKey)) map.set(item.categoryKey, []);
      map.get(item.categoryKey)!.push(item);
    }
    return Array.from(map.entries());
  }, [cookStyle]);

  const stationsWithSelection = useMemo(
    () => groupedByCategory.filter(([, items]) => items.some(i => (selections[i.id] || 0) > 0)).length,
    [groupedByCategory, selections]);

  const handleBooking = useCallback(() => {
    if (totalPrice === 0) return;
    setIsBooking(true);
    const dateParam = eventDate
      ? `&date=${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      : '';
    router.push(`/checkout?type=catering${dateParam}` as any);
  }, [totalPrice, router, eventDate]);

  const T = {
    cream:     '#f7f2eb',
    creamMid:  'rgba(247,242,235,0.55)',
    creamLow:  'rgba(247,242,235,0.3)',
    creamFaint:'rgba(247,242,235,0.08)',
    gold:      '#c17f3b',
    surface:   'rgba(247,242,235,0.04)',
    border:    'rgba(193,127,59,0.15)',
    borderSub: 'rgba(247,242,235,0.08)',
  };

  /* ── slider fill gradient ── */
  const sliderPct = `${((guests - 10) / 490) * 100}%`;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative"
      style={{ backgroundColor: '#0c0803' }}
    >
      {/* Noise grain */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.03, mixBlendMode: 'overlay',
      }} />

      <div className="relative z-10">

        {/* ── Full-width section header ── */}
        <div className={`px-4 sm:px-8 pt-4 pb-8 space-y-1.5 ${isRTL ? 'text-right' : ''}`}>
          <span style={{ color: T.gold, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.35em', fontWeight: 700 }}>
            {t('customLabel')}
          </span>
          <h2 className="font-serif italic text-2xl sm:text-4xl" style={{ color: T.cream }}>{t('customTitle')}</h2>
          <p className="text-xs sm:text-sm max-w-xl leading-relaxed" style={{ color: T.creamLow }}>{t('customSubtitle')}</p>
        </div>

        {/* ══════════════════════════════════════════════════════
            2-COLUMN LAYOUT
            Left  : configurator wizard + category tabs + stations
            Right : sticky 380px order panel
        ══════════════════════════════════════════════════════ */}
        <div
          className="lg:grid lg:items-start"
          style={{ gridTemplateColumns: '1fr 380px' }}
        >

          {/* ════════════ LEFT COLUMN ════════════ */}
          <div className="min-w-0">

            {/* Configurator wizard */}
            <div
              className="mx-4 sm:mx-8 mb-8 rounded-3xl p-6 sm:p-8"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}
            >
              <div className="grid md:grid-cols-3 gap-7 md:gap-8">

                {/* Step 1 — cooking style */}
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color: T.gold }}>
                    {t('configStep')} 1
                  </p>
                  <h4 className="font-serif italic text-lg" style={{ color: T.cream }}>{t('configCookTitle')}</h4>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'vegan' as const, label: t('cookVegan') },
                      { id: 'veg'   as const, label: t('cookVegetarian') },
                      { id: 'meat'  as const, label: t('cookMeat') },
                    ]).map((opt) => {
                      const active = cookStyle === opt.id;
                      return (
                        <button key={opt.id} type="button" onClick={() => setCookStyle(opt.id)}
                          className="w-full text-start px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-colors"
                          style={{
                            background: active ? 'rgba(193,127,59,0.14)' : T.surface,
                            border: `1px solid ${active ? 'rgba(193,127,59,0.5)' : T.borderSub}`,
                            color: active ? T.gold : T.creamMid,
                          }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 — guest count */}
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color: T.gold }}>
                    {t('configStep')} 2
                  </p>
                  <h4 className="font-serif italic text-lg" style={{ color: T.cream }}>{t('configGuestsTitle')}</h4>
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}
                    style={{ background: T.surface, border: `1px solid ${T.borderSub}` }}>
                    <button type="button" onClick={() => setGuests(Math.max(1, guests - 5))}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white/65 hover:bg-gold hover:text-stone-950 active:scale-90 transition-all"
                      style={{ background: 'rgba(247,242,235,0.06)' }}>
                      <Minus size={14} />
                    </button>
                    <div className="text-center">
                      <input type="number" min="1" max="500" value={guests}
                        onChange={(e) => setGuests(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                        className="bg-transparent text-2xl font-serif font-bold w-16 text-center focus:outline-none tabular-nums"
                        style={{ color: T.cream }} />
                      <p className="text-[8px] uppercase tracking-widest font-bold -mt-1" style={{ color: T.creamLow }}>
                        {t('guestUnit')}
                      </p>
                    </div>
                    <button type="button" onClick={() => setGuests(Math.min(500, guests + 5))}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white/65 hover:bg-gold hover:text-stone-950 active:scale-90 transition-all"
                      style={{ background: 'rgba(247,242,235,0.06)' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Step 3 — meal type */}
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color: T.gold }}>
                    {t('configStep')} 3
                  </p>
                  <h4 className="font-serif italic text-lg" style={{ color: T.cream }}>{t('configMealTitle')}</h4>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'buffet' as const, label: t('mealBuffet') },
                      { id: 'hot'    as const, label: t('mealHot') },
                    ]).map((opt) => {
                      const active = mealType === opt.id;
                      return (
                        <button key={opt.id} type="button" onClick={() => setMealType(opt.id)}
                          className="w-full text-start px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-colors"
                          style={{
                            background: active ? 'rgba(193,127,59,0.14)' : T.surface,
                            border: `1px solid ${active ? 'rgba(193,127,59,0.5)' : T.borderSub}`,
                            color: active ? T.gold : T.creamMid,
                          }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Category tabs — sticky under header */}
            <div
              className="sticky z-30 px-4 sm:px-8 py-3"
              style={{
                top: '68px',
                background: 'rgba(12,8,3,0.94)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(247,242,235,0.07)',
                borderTop: '1px solid rgba(247,242,235,0.04)',
              }}
            >
              <div className={`flex gap-2 overflow-x-auto scrollbar-none ${isRTL ? 'flex-row-reverse' : ''}`}>
                {groupedByCategory.map(([catKey, catItems]) => {
                  const count = catItems.reduce((s, i) => s + (selections[i.id] || 0), 0);
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() =>
                        document.getElementById(`station-${catKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.18em] font-bold transition-colors hover:text-white"
                      style={{
                        background: count > 0 ? 'rgba(193,127,59,0.12)' : 'rgba(247,242,235,0.05)',
                        border: `1px solid ${count > 0 ? 'rgba(193,127,59,0.4)' : 'rgba(247,242,235,0.1)'}`,
                        color: count > 0 ? T.gold : 'rgba(247,242,235,0.65)',
                      }}
                    >
                      {catLabel(catKey)}
                      {count > 0 && (
                        <span style={{ background: T.gold, color: '#0c0803', borderRadius: '9999px', padding: '1px 7px', fontSize: '9px', fontWeight: 700 }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Station progress bar */}
            <div className={`px-4 sm:px-8 py-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}
                style={{ color: stationsWithSelection > 0 ? T.gold : T.creamLow }}>
                <ChefHat size={10} />
                <span>{stationsWithSelection} / {groupedByCategory.length}</span>
              </div>
              <div className={`flex flex-1 gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {groupedByCategory.map(([catKey, catItems], idx) => {
                  const hasAny = catItems.some(i => (selections[i.id] || 0) > 0);
                  return (
                    <motion.div key={catKey} className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(247,242,235,0.1)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: T.gold }}
                        animate={{ width: hasAny ? '100%' : '0%' }}
                        transition={{ duration: 0.4, delay: 0.05 * idx }} />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Station blocks */}
            <div className="px-4 sm:px-8 space-y-10 sm:space-y-14 pb-8">
              {groupedByCategory.map(([catKey, catItems], stationIdx) => (
                <StationBlock
                  key={catKey}
                  categoryKey={catKey}
                  numeral={STATION_NUMERALS[catKey] ?? String(stationIdx + 1)}
                  items={catItems}
                  selections={selections}
                  onInc={handleInc}
                  onDec={handleDec}
                  dishName={dishName}
                  catLabel={catLabel}
                  formatVal={formatVal}
                  isRTL={isRTL}
                  t={t}
                  stationIndex={stationIdx}
                />
              ))}
              {/* Spacer for mobile FAB */}
              <div className="h-24 lg:hidden" aria-hidden="true" />
            </div>
          </div>

          {/* ════════════ RIGHT COLUMN — Sticky order panel ════════════ */}
          <div
            className="hidden lg:flex lg:flex-col sticky overflow-hidden"
            style={{
              top: '68px',
              height: 'calc(100vh - 68px)',
              background: '#130e07',
              borderLeft: `1px solid ${T.border}`,
            }}
          >
            {/* Panel header */}
            <div
              className="shrink-0 px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${T.borderSub}` }}
            >
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: T.creamLow }}>
                  {t('summaryTitle')}
                </p>
                <p className="font-serif text-lg leading-tight" style={{ color: T.cream }}>
                  {t('guestsLabel')}:{' '}
                  <span style={{ color: T.gold }}>{guests}</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(193,127,59,0.1)' }}>
                <Receipt style={{ color: T.gold }} size={17} />
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarWidth: 'thin' }}>

              {/* Guest slider */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5"
                  style={{ color: T.creamLow }}>
                  <Users size={9} style={{ color: T.gold }} /> {t('guestsLabel')}
                </label>
                <input
                  type="range" min="10" max="500" step="5" value={guests}
                  onChange={e => setGuests(parseInt(e.target.value))}
                  className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${T.gold} ${sliderPct}, rgba(247,242,235,0.1) ${sliderPct})`,
                    accentColor: T.gold,
                  }}
                />
                <div className="flex justify-between text-[9px] font-bold" style={{ color: 'rgba(247,242,235,0.22)' }}>
                  <span>{t('guestRangeMin')}</span><span>{t('guestRangeMid')}</span><span>{t('guestRangeMax')}</span>
                </div>
              </div>

              {/* Meal-size meter */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: T.creamLow }}>
                  {t('mealSizeLabel')}
                </p>
                <div className={`flex gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                      style={{ background: i <= mealSizeStep && avgPerPerson > 0 ? T.gold : 'rgba(247,242,235,0.1)' }} />
                  ))}
                </div>
                <div className={`flex justify-between text-[8px] uppercase tracking-wider font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {[t('sizeSnack'), t('sizeLight'), t('sizeFull'), t('sizeLavish')].map((label, i) => (
                    <span key={label} style={{ color: avgPerPerson > 0 && i === mealSizeStep ? T.gold : 'rgba(247,242,235,0.3)' }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Event date calendar */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5"
                  style={{ color: T.creamLow }}>
                  <Calendar size={9} style={{ color: T.gold }} /> {t('eventDate')}
                  {eventDate && (
                    <span className="ml-auto font-serif font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(193,127,59,0.12)', color: T.gold, fontSize: '10px' }}>
                      {eventDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </label>
                <CateringCalendar selected={eventDate} onSelect={setEventDate} locale={locale} />
              </div>

              {/* Compact selected dish list */}
              <AnimatePresence>
                {totalDishCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <p className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2"
                      style={{ color: T.creamLow }}>
                      <Utensils size={9} /> {t('selectedDishesLabel')}
                    </p>
                    {MENU_ITEMS.filter(i => (selections[i.id] || 0) > 0).map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-xl p-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}
                        style={{ background: 'rgba(247,242,235,0.04)', border: `1px solid ${T.borderSub}` }}
                      >
                        {/* Thumbnail */}
                        <img
                          src={item.image}
                          alt={dishName(item.nameKey)}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                          loading="lazy"
                        />
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold leading-snug truncate" style={{ color: T.cream }}>
                            {dishName(item.nameKey)}
                          </p>
                          {item.dietaryTags?.[0] && (
                            <p className="text-[8px] uppercase tracking-wide font-bold mt-0.5" style={{ color: '#9ccb78' }}>
                              {item.dietaryTags[0].replace('-', ' ')}
                            </p>
                          )}
                          <p className="text-[11px] font-serif font-bold mt-0.5" style={{ color: T.gold }}>
                            {formatVal(item.price * selections[item.id])}
                          </p>
                        </div>
                        {/* Qty stepper */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleDec(item.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:bg-gold/20 active:scale-90 transition-all"
                            style={{ background: 'rgba(247,242,235,0.06)' }}>
                            <Minus size={10} />
                          </button>
                          <span className="text-[11px] font-bold text-white w-5 text-center tabular-nums">
                            {selections[item.id]}
                          </span>
                          <button onClick={() => handleInc(item.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:bg-gold/20 active:scale-90 transition-all"
                            style={{ background: 'rgba(247,242,235,0.06)' }}>
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {totalDishCount === 0 && (
                <div className="rounded-2xl p-6 text-center" style={{ background: T.surface, border: `1px dashed ${T.borderSub}` }}>
                  <Utensils size={20} className="mx-auto mb-2" style={{ color: 'rgba(193,127,59,0.3)' }} />
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(247,242,235,0.2)' }}>
                    {t('summaryEmptyHint')}
                  </p>
                </div>
              )}

              {/* Per-person breakdown */}
              <AnimatePresence>
                {avgPerPerson > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                    style={{ background: T.surface }}
                  >
                    <p className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5" style={{ color: T.creamLow }}>
                      <Users size={9} /> {t('perPersonLabel')}
                    </p>
                    <Counter value={`~ ${formatVal(avgPerPerson)}`} className="text-sm font-serif font-bold" style={{ color: T.gold }} />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Panel footer — total + CTA */}
            <div
              className="shrink-0 px-6 py-4 space-y-3"
              style={{ borderTop: `1px solid ${T.borderSub}`, background: 'rgba(12,8,3,0.5)' }}
            >
              <div className={`flex items-end justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: T.creamLow }}>{t('totalLabel')}</p>
                  <p className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(247,242,235,0.2)' }}>{t('inclVat')}</p>
                </div>
                <Counter value={formatVal(totalPrice)} className="text-3xl font-serif text-white" />
              </div>

              <button
                onClick={handleBooking}
                disabled={totalPrice === 0 || isBooking}
                className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px]
                  active:scale-95 transition-all disabled:opacity-20 shadow-lg flex items-center justify-center gap-2"
                style={{ background: T.gold, color: '#0c0803', boxShadow: `0 8px 24px rgba(193,127,59,0.25)` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f2eb'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.gold; }}
              >
                {isBooking
                  ? <span className="animate-pulse">…</span>
                  : <>{t('bookButton')} {isRTL ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}</>}
              </button>

              <p className="text-[9px] text-center uppercase tracking-tighter italic" style={{ color: 'rgba(247,242,235,0.18)' }}>
                {t('disclaimer')}
              </p>
            </div>
          </div>

        </div>{/* end 2-col grid */}
      </div>{/* end relative z-10 */}

      {/* ── Mobile FAB ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setSummaryOpen(true)}
          aria-label={t('openSummaryLabel')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl shadow-2xl active:scale-[0.98] transition-all duration-300 min-h-14"
          style={{ background: '#0c0803', border: `1px solid ${T.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', color: T.cream }}
        >
          <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(193,127,59,0.15)' }}>
              <Receipt size={13} style={{ color: T.gold }} />
            </div>
            <div className={isRTL ? 'text-right' : 'text-start'}>
              <p className="text-[10px] uppercase tracking-widest font-bold leading-none">{t('summaryTitle')}</p>
              <p className="text-[9px] font-medium mt-0.5" style={{ color: T.creamLow }}>
                {totalDishCount > 0 ? t('fabSummaryDetail', { count: totalDishCount, guests }) : t('guestsLabel')}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="font-serif text-sm font-bold">{totalPrice > 0 ? formatVal(totalPrice) : '—'}</span>
            {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </div>
        </button>
      </div>

      <SummaryDrawer
        open={summaryOpen} onClose={() => setSummaryOpen(false)}
        guests={guests} setGuests={setGuests} selections={selections}
        totalPrice={totalPrice} avgPerPerson={avgPerPerson} priceTier={priceTier}
        totalDishCount={totalDishCount} formatVal={formatVal}
        onBook={handleBooking} isBooking={isBooking} isRTL={isRTL} t={t} dishName={dishName}
        eventDate={eventDate} setEventDate={setEventDate} locale={locale}
      />
    </div>
  );
}
