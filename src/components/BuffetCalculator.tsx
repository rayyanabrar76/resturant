'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import {
  Plus, Minus, Info, Users, Receipt,
  ChevronRight, ChevronLeft, Check, Utensils, Sparkles, X, ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════════════ */

const MENU_ITEMS = [
  { id: 1, translationKey: 'hummus',    categoryKey: 'catStarters', price: 12.00, image: 'https://www.themediterraneandish.com/wp-content/uploads/2024/05/TMD-Hummus-Leads-02-Vertical.jpg', tagKey: 'tagChefsPick' },
  { id: 2, translationKey: 'tabbouleh', categoryKey: 'catStarters', price: 11.00, image: 'https://www.loveandlemons.com/wp-content/uploads/2022/08/tabbouleh-1.jpg', tagKey: 'tagPopular'   },
  { id: 3, translationKey: 'fattoush',  categoryKey: 'catStarters', price: 11.00, image: 'https://www.lastingredient.com/wp-content/uploads/2019/04/fattoush-salad2-819x1024.jpg', tagKey: null           },
  { id: 4, translationKey: 'shawarma',  categoryKey: 'catMains',    price: 24.00, image: 'https://palestineinadish.com/wp-content/uploads/2023/07/Shawarma-sandwishes-wrapped-1538x2048.jpg', tagKey: 'tagPopular'   },
  { id: 5, translationKey: 'kibbeh',    categoryKey: 'catMains',    price: 18.00, image: 'https://www.hungrypaprikas.com/wp-content/uploads/2024/01/Kibbeh-Bil-Sanieh-29.jpg', tagKey: 'tagNew'       },
  { id: 6, translationKey: 'mansaf',    categoryKey: 'catMains',    price: 32.00, image: 'https://butfirstchai.com/wp-content/uploads/2022/08/jordanian-mansaf-recipe.jpg', tagKey: 'tagChefsPick' },
  { id: 7, translationKey: 'knafeh',    categoryKey: 'catDesserts', price: 10.00, image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=400&auto=format', tagKey: 'tagPopular'   },
  { id: 8, translationKey: 'baklava',   categoryKey: 'catDesserts', price:  9.00, image: 'https://kalejunkie.com/wp-content/uploads/2023/02/KALEJUNKIE-HOMEMADE-BAKLAVA-1.jpg', tagKey: null           },
] as const;

const PREDEFINED_OFFERS = [
  { key: 'offer1', price: 400,  highlight: false, badgeKey: null,               dishes: ['hummus', 'tabbouleh', 'knafeh'],                              minGuests: 10,  maxGuests: 30  },
  { key: 'offer2', price: 700,  highlight: true,  badgeKey: 'badgeMostPopular', dishes: ['hummus', 'shawarma', 'tabbouleh', 'fattoush'],                minGuests: 25,  maxGuests: 80  },
  { key: 'offer3', price: 1100, highlight: false, badgeKey: 'badgePremium',     dishes: ['hummus', 'shawarma', 'mansaf', 'kibbeh', 'knafeh', 'baklava'], minGuests: 50, maxGuests: 500 },
] as const;

/* Station number labels — Roman numerals give an upscale feel */
const STATION_NUMERALS: Record<string, string> = {
  catStarters: 'I',
  catMains:    'II',
  catDesserts: 'III',
};

/* ══════════════════════════════════════════════════════════════════════════
   QTY CONTROL
══════════════════════════════════════════════════════════════════════════ */

function QtyControl({ qty, onInc, onDec, addLabel, removeLabel }: {
  qty: number; onInc: () => void; onDec: () => void;
  addLabel: string; removeLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onDec} aria-label={removeLabel}
        className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center
          hover:bg-gold hover:border-gold hover:text-stone-950 active:scale-90
          transition-all duration-150 shrink-0 text-white/60">
        <Minus size={12} />
      </button>
      <span className="font-serif font-bold text-white w-6 text-center tabular-nums text-sm select-none">{qty}</span>
      <button onClick={onInc} aria-label={addLabel}
        className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center
          hover:bg-gold hover:border-gold hover:text-stone-950 active:scale-90
          transition-all duration-150 shrink-0 text-white/60">
        <Plus size={12} />
      </button>
    </div>
  );
}

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
   STATION ROW — single dish as a wide horizontal card
══════════════════════════════════════════════════════════════════════════ */

function DishRow({
  item, qty, onInc, onDec, name, catLabel, formatVal, isRTL, isSelected, t,
  stationIndex, itemIndex,
}: {
  item: typeof MENU_ITEMS[number];
  qty: number; onInc: () => void; onDec: () => void;
  name: string; catLabel: string; formatVal: (n: number) => string;
  isRTL: boolean; isSelected: boolean;
  t: ReturnType<typeof useTranslations>;
  stationIndex: number; itemIndex: number;
}) {
  const T = {
    cream:    '#f7f2eb',
    creamMid: 'rgba(247,242,235,0.55)',
    creamLow: 'rgba(247,242,235,0.3)',
    gold:     '#c17f3b',
    borderSub:'rgba(247,242,235,0.08)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: stationIndex * 0.08 + itemIndex * 0.05, duration: 0.3 }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="group relative flex items-center gap-4 sm:gap-5 rounded-2xl p-3 sm:p-4 transition-all duration-300 cursor-default"
      style={{
        background: isSelected
          ? 'linear-gradient(90deg, rgba(193,127,59,0.08) 0%, rgba(247,242,235,0.03) 100%)'
          : 'rgba(247,242,235,0.02)',
        border: `1px solid ${isSelected ? 'rgba(193,127,59,0.3)' : T.borderSub}`,
        boxShadow: isSelected ? '0 4px 20px rgba(193,127,59,0.08)' : 'none',
      }}
    >
      {/* Left: image with selected overlay */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0">
        <img
          src={item.image}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gold overlay tint when selected */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(193,127,59,0.35)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: T.gold }}>
                <Check size={12} color="#0c0803" strokeWidth={3} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center: name + tag + price */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <h4 className="font-serif text-sm sm:text-base leading-tight" style={{ color: T.cream }}>
            {name}
          </h4>
          {item.tagKey && (
            <span
              className="text-[7px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                background: item.tagKey === 'tagChefsPick'
                  ? 'rgba(193,127,59,0.2)'
                  : 'rgba(247,242,235,0.07)',
                color: item.tagKey === 'tagChefsPick' ? T.gold : T.creamMid,
                border: `1px solid ${item.tagKey === 'tagChefsPick' ? 'rgba(193,127,59,0.3)' : T.borderSub}`,
              }}
            >
              {t(item.tagKey)}
            </span>
          )}
        </div>
        <p className="text-sm font-serif font-bold" style={{ color: T.gold }}>
          {formatVal(item.price)}
          <span className="text-[9px] font-normal uppercase tracking-widest ml-1" style={{ color: T.creamLow }}>
            / dish
          </span>
        </p>
        {/* Subtotal when selected */}
        <AnimatePresence>
          {isSelected && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[10px] font-bold mt-0.5 overflow-hidden"
              style={{ color: 'rgba(193,127,59,0.7)' }}
            >
              {qty} × {formatVal(item.price)} = {formatVal(item.price * qty)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Right: qty control */}
      <div className="shrink-0">
        <QtyControl
          qty={qty}
          onInc={onInc}
          onDec={onDec}
          addLabel={t('addDishLabel', { dish: name })}
          removeLabel={t('removeDishLabel', { dish: name })}
        />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STATION BLOCK — category header + its dish rows
══════════════════════════════════════════════════════════════════════════ */

function StationBlock({
  categoryKey, numeral, items, selections, onInc, onDec, dishName, catLabel,
  formatVal, isRTL, t, stationIndex,
}: {
  categoryKey: string;
  numeral: string;
  items: typeof MENU_ITEMS[number][];
  selections: Record<number, number>;
  onInc: (id: number) => void;
  onDec: (id: number) => void;
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stationIndex * 0.12, duration: 0.4 }}
      className="space-y-3"
    >
      {/* ── Station header ── */}
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="flex items-end justify-between gap-4 pb-4"
        style={{ borderBottom: '1px solid rgba(247,242,235,0.07)' }}
      >
        <div className={`flex items-end gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Oversized roman numeral */}
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

        {/* Per-station selection pill */}
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

      {/* ── Dish rows ── */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <DishRow
            key={item.id}
            item={item}
            qty={selections[item.id] || 0}
            onInc={() => onInc(item.id)}
            onDec={() => onDec(item.id)}
            name={dishName(item.translationKey)}
            catLabel={catLabel(item.categoryKey)}
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
   MOBILE SUMMARY DRAWER  (unchanged from original)
══════════════════════════════════════════════════════════════════════════ */

function SummaryDrawer({ open, onClose, guests, setGuests, selections, totalPrice,
  avgPerPerson, priceTier, totalDishCount, formatVal, onBook, isBooking, isRTL, t, d,
}: {
  open: boolean; onClose: () => void; guests: number; setGuests: (n: number) => void;
  selections: Record<number, number>; totalPrice: number; avgPerPerson: number;
  priceTier: { label: string; color: string } | null; totalDishCount: number;
  formatVal: (n: number) => string; onBook: () => void; isBooking: boolean; isRTL: boolean;
  t: ReturnType<typeof useTranslations>; d: ReturnType<typeof useTranslations>;
}) {
  const dishName = (key: string) => { try { return d(`${key}.name`); } catch { return key; } };

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

              {totalDishCount > 0 && (
                <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: 'rgba(247,242,235,0.05)' }}>
                  <p className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5" style={{ color: 'rgba(247,242,235,0.4)' }}>
                    <Utensils size={9} /> {t('selectedDishesLabel')}
                  </p>
                  {MENU_ITEMS.filter(i => (selections[i.id] || 0) > 0).map(item => (
                    <div key={item.id} className={`flex justify-between text-[11px] pb-1 last:border-0 ${isRTL ? 'flex-row-reverse' : ''}`}
                      style={{ borderBottom: '1px solid rgba(247,242,235,0.06)', color: 'rgba(247,242,235,0.55)' }}>
                      <span className="truncate max-w-42">{dishName(item.translationKey)}</span>
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
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(247,242,235,0.1)' }}>
                        <motion.div className="h-full bg-gold rounded-full"
                          animate={{ width: `${Math.min((avgPerPerson / 30) * 100, 100)}%` }}
                          transition={{ duration: 0.4 }} />
                      </div>
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
  const d      = useTranslations('Dishes');
  const m      = useTranslations('Menu');
  const locale = useLocale();
  const router = useRouter();
  const { addToCart, clearCart } = useCart();

  const symbol = m('currencySymbol');
  const pos    = m('currencyPos');
  const isRTL  = locale === 'ar';

  const formatVal = useCallback((num: number) => {
    const val = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return pos === 'prefix' ? `${symbol}${val}` : `${val} ${symbol}`;
  }, [pos, symbol]);

  const dishName = useCallback(
    (key: string) => { try { return d(`${key}.name`); } catch { return key; } }, [d]);

  const catLabel = useCallback((key: string) => {
    if (key === 'all') return t('filterAll');
    try { return d(`${key}.name`); } catch { return key; }
  }, [d, t]);

  const [guests,      setGuests]      = useState(20);
  const [selections,  setSelections]  = useState<Record<number, number>>({});
  const [isBooking,   setIsBooking]   = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handleInc = useCallback((id: number) =>
    setSelections(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 })), []);
  const handleDec = useCallback((id: number) =>
    setSelections(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) })), []);

  const totalDishCount = useMemo(() => Object.values(selections).reduce((a, b) => a + b, 0), [selections]);
  const totalPrice     = useMemo(() => MENU_ITEMS.reduce((sum, item) => sum + item.price * (selections[item.id] || 0), 0), [selections]);
  const avgPerPerson   = useMemo(() => (guests > 0 && totalPrice > 0 ? totalPrice / guests : 0), [totalPrice, guests]);

  const priceTier = useMemo(() => {
    if (avgPerPerson === 0) return null;
    if (avgPerPerson < 10) return { label: t('tierBudget'),  color: 'text-green-400' };
    if (avgPerPerson < 20) return { label: t('tierValue'),   color: 'text-amber-400' };
    return                        { label: t('tierPremium'), color: 'text-gold'      };
  }, [avgPerPerson, t]);

  /* Group items by category, preserving original order */
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, typeof MENU_ITEMS[number][]>();
    for (const item of MENU_ITEMS) {
      if (!map.has(item.categoryKey)) map.set(item.categoryKey, []);
      map.get(item.categoryKey)!.push(item);
    }
    return Array.from(map.entries());
  }, []);

  /* Total stations that have at least one dish selected */
  const stationsWithSelection = useMemo(
    () => groupedByCategory.filter(([, items]) => items.some(i => (selections[i.id] || 0) > 0)).length,
    [groupedByCategory, selections]);

  const handleBooking = useCallback(async () => {
    if (totalPrice === 0) return;
    setIsBooking(true);
    try {
      clearCart();
      addToCart({
        id: Date.now(), nameKey: 'cateringPackageName', price: totalPrice, qty: 1,
        img: MENU_ITEMS[0].image,
        customDetails: MENU_ITEMS.filter(item => (selections[item.id] || 0) > 0)
          .map(item => ({ name: dishName(item.translationKey), qty: selections[item.id] })),
        guestCount: guests,
      });
      router.push('/checkout?type=catering');
    } catch { setIsBooking(false); }
  }, [totalPrice, clearCart, addToCart, selections, guests, dishName, router]);

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

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative space-y-16 sm:space-y-24"
      style={{ backgroundColor: '#0c0803' }}
    >
      {/* Noise grain overlay */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.03, mixBlendMode: 'overlay',
      }} />

      <div className="relative z-10 space-y-16 sm:space-y-24">

        {/* ══════════════════════════════════════════
            SECTION 1 — PREDEFINED OFFERS  (unchanged)
        ══════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className={`space-y-1.5 px-4 sm:px-0 ${isRTL ? 'text-right' : ''}`}>
            <span style={{ color: T.gold, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.35em', fontWeight: 700 }}>
              {t('offersLabel')}
            </span>
            <h2 className="font-serif italic text-2xl sm:text-4xl" style={{ color: T.cream }}>{t('offersTitle')}</h2>
            <p className="text-xs sm:text-sm max-w-xl leading-relaxed" style={{ color: T.creamLow }}>{t('offersSubtitle')}</p>
          </div>

          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 sm:px-0
            md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none pb-1">
            {PREDEFINED_OFFERS.map((offer, idx) => {
              const isHighlight = offer.highlight;
              const isPremium   = offer.key === 'offer3';
              return (
                <motion.div key={offer.key}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.35 }}
                  className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl overflow-hidden snap-start shrink-0 w-[75vw] sm:w-[68vw] md:w-auto p-5 sm:p-8"
                  style={{
                    border: `1px solid ${isHighlight ? T.border : T.borderSub}`,
                    background: isPremium
                      ? 'linear-gradient(135deg, #1a1005 0%, #0c0803 100%)'
                      : isHighlight
                        ? 'linear-gradient(135deg, rgba(193,127,59,0.12) 0%, rgba(12,8,3,0.95) 100%)'
                        : 'rgba(247,242,235,0.03)',
                    boxShadow: isHighlight ? `0 8px 40px rgba(193,127,59,0.12)` : 'none',
                  }}
                >
                  {offer.badgeKey && (
                    <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-[8px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full`}
                      style={{
                        background: isHighlight ? T.gold : 'rgba(247,242,235,0.08)',
                        color: isHighlight ? '#0c0803' : T.creamMid,
                      }}>
                      {t(offer.badgeKey)}
                    </div>
                  )}
                  <div className="space-y-3 sm:space-y-5">
                    <div className={`space-y-0.5 ${isRTL ? 'pl-14' : 'pr-14'}`}>
                      <h4 className="font-serif text-lg sm:text-2xl" style={{ color: T.cream }}>{t(`${offer.key}Title`)}</h4>
                      <p className="text-[11px] leading-relaxed" style={{ color: T.creamLow }}>{t(`${offer.key}Desc`)}</p>
                    </div>
                    <div className={`flex items-baseline gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: T.gold }}>{formatVal(offer.price)}</span>
                      <span className="text-[9px] uppercase tracking-widest" style={{ color: T.creamLow }}>{t('perEvent')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold" style={{ color: T.creamLow }}>
                      <Users size={11} />{offer.minGuests}–{offer.maxGuests} {t('guestUnit')}
                    </div>
                    <ul className="space-y-1">
                      {offer.dishes.map(dk => (
                        <li key={dk} className="flex items-center gap-1.5 text-[10px] sm:text-[11px]" style={{ color: T.creamMid }}>
                          <Check size={10} style={{ color: T.gold }} />{dishName(dk)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={`/catering/${idx + 1}` as any}>
                    <button className="mt-5 sm:mt-8 w-full min-h-11 rounded-xl sm:rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.97]"
                      style={{
                        background: isHighlight ? T.gold : 'rgba(247,242,235,0.06)',
                        color: isHighlight ? '#0c0803' : T.creamMid,
                        border: `1px solid ${isHighlight ? 'transparent' : T.borderSub}`,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.gold; (e.currentTarget as HTMLElement).style.color = '#0c0803'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isHighlight ? T.gold : 'rgba(247,242,235,0.06)'; (e.currentTarget as HTMLElement).style.color = isHighlight ? '#0c0803' : T.creamMid; }}
                    >
                      <Info size={12} /> {t('viewDetails')} {isRTL ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center gap-1.5 md:hidden" aria-hidden="true">
            {PREDEFINED_OFFERS.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: T.borderSub }} />
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: `1px solid ${T.borderSub}` }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-bold flex items-center gap-2"
              style={{ background: '#0c0803', color: T.creamLow }}>
              <Sparkles size={9} style={{ color: T.gold }} />
              {t('orBuildCustom')}
              <Sparkles size={9} style={{ color: T.gold }} />
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2 — CUSTOM BUFFET BUILDER (REDESIGNED)

            Concept: "Buffet Stations"
            • No filter tabs — all categories always visible as named stations
            • Each station has an oversized Roman-numeral marker + italic category title
            • Dishes = horizontal list cards (thumbnail | name+price | qty control)
            • Per-station "x selected" pill animates in
            • A slim progress bar across the top tracks how many stations
              have at least one dish chosen
            • Desktop: same sticky summary panel (refined)
            • Mobile: same FAB + drawer
        ══════════════════════════════════════════ */}
        <section className="space-y-6 sm:space-y-10">

          {/* Section header */}
          <div className={`space-y-1.5 px-4 sm:px-0 ${isRTL ? 'text-right' : ''}`}>
            <span style={{ color: T.gold, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.35em', fontWeight: 700 }}>
              {t('customLabel')}
            </span>
            <h2 className="font-serif italic text-2xl sm:text-4xl" style={{ color: T.cream }}>{t('customTitle')}</h2>
            <p className="text-xs sm:text-sm max-w-xl leading-relaxed" style={{ color: T.creamLow }}>{t('customSubtitle')}</p>
          </div>

          {/* ── Station progress tracker ── */}
          <div className="px-4 sm:px-0 space-y-2">
            <div className={`flex items-center justify-between text-[9px] uppercase tracking-widest font-bold ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{ color: T.creamLow }}>
              <span className="flex items-center gap-1.5">
                <ChefHat size={10} style={{ color: stationsWithSelection > 0 ? T.gold : 'inherit' }} />
                {t('stationProgressLabel')}
              </span>
              <span style={{ color: stationsWithSelection > 0 ? T.gold : 'inherit' }}>
                {stationsWithSelection} / {groupedByCategory.length}
              </span>
            </div>
            {/* Segmented bar — one segment per station */}
            <div className={`flex gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {groupedByCategory.map(([catKey, items], idx) => {
                const hasAny = items.some(i => (selections[i.id] || 0) > 0);
                return (
                  <motion.div
                    key={catKey}
                    className="flex-1 h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(247,242,235,0.1)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: T.gold }}
                      animate={{ width: hasAny ? '100%' : '0%' }}
                      transition={{ duration: 0.4, delay: 0.05 * idx }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Main 2-col grid ── */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-12 items-start">

            {/* ── LEFT: station list ── */}
            <div className="lg:col-span-2 px-4 sm:px-0 space-y-10 sm:space-y-14">
              {groupedByCategory.map(([catKey, items], stationIdx) => (
                <StationBlock
                  key={catKey}
                  categoryKey={catKey}
                  numeral={STATION_NUMERALS[catKey] ?? String(stationIdx + 1)}
                  items={items}
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

              {/* Spacer so content isn't hidden under mobile FAB */}
              <div className="h-24 lg:hidden" aria-hidden="true" />
            </div>

            {/* ── RIGHT: Desktop sticky summary (refined) ── */}
            <div className="hidden lg:block sticky top-32 rounded-[2.5rem] overflow-hidden"
              style={{
                background: '#130e07',
                border: `1px solid ${T.border}`,
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
              }}
            >
              {/* Summary header band */}
              <div className="px-8 py-5 flex items-center gap-3"
                style={{ borderBottom: `1px solid ${T.borderSub}`, background: 'rgba(193,127,59,0.05)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(193,127,59,0.1)' }}>
                  <Receipt style={{ color: T.gold }} size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-serif leading-tight" style={{ color: T.cream }}>{t('summaryTitle')}</h3>
                  <p className="text-[9px] uppercase tracking-widest font-bold mt-0.5" style={{ color: T.creamLow }}>
                    {stationsWithSelection === 0
                      ? t('summaryEmptyHint')
                      : `${stationsWithSelection} ${stationsWithSelection === 1 ? t('stationUnit') : t('stationsUnit')} ${t('configured')}`}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-7">
                {/* Guests */}
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <label className="text-[10px] uppercase font-bold flex items-center gap-1.5"
                      style={{ color: T.creamLow, letterSpacing: isRTL ? 0 : '0.2em' }}>
                      <Users size={11} style={{ color: T.gold }} /> {t('guestsLabel')}
                    </label>
                    <span className="text-sm font-serif font-bold tabular-nums px-3 py-1 rounded-full"
                      style={{ background: 'rgba(247,242,235,0.06)', color: T.cream }}>
                      {guests}
                    </span>
                  </div>
                  <input type="range" min="10" max="500" step="5" value={guests}
                    onChange={e => setGuests(parseInt(e.target.value))}
                    className="w-full accent-gold rounded-lg appearance-none h-1.5 cursor-pointer"
                    style={{ background: 'rgba(247,242,235,0.1)' }} />
                  <div className={`flex justify-between text-[9px] uppercase tracking-widest font-bold ${isRTL ? 'flex-row-reverse' : ''}`}
                    style={{ color: 'rgba(247,242,235,0.2)' }}>
                    <span>{t('guestRangeMin')}</span><span>{t('guestRangeMid')}</span><span>{t('guestRangeMax')}</span>
                  </div>
                  {/* Type-in fallback */}
                  <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                    style={{ background: 'rgba(247,242,235,0.05)' }}>
                    <Users size={14} className="shrink-0" style={{ color: T.creamLow }} />
                    <input type="number" min="1" max="500" value={guests}
                      onChange={e => setGuests(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                      className="bg-transparent text-sm font-serif w-full focus:outline-none"
                      style={{ color: T.cream, textAlign: isRTL ? 'right' : 'left' }} />
                    <span className="text-[9px] uppercase tracking-widest shrink-0" style={{ color: T.creamLow }}>{t('guestUnit')}</span>
                  </div>
                </div>

                {/* Selected dishes list */}
                <AnimatePresence>
                  {totalDishCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(247,242,235,0.04)', border: `1px solid ${T.borderSub}` }}
                    >
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2" style={{ color: T.creamLow }}>
                          <Utensils size={9} /> {t('selectedDishesLabel')}
                        </p>
                        {MENU_ITEMS.filter(i => (selections[i.id] || 0) > 0).map(item => (
                          <div key={item.id}
                            className={`flex justify-between items-center text-[11px] py-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}
                            style={{ borderBottom: `1px solid ${T.borderSub}` }}>
                            <span className="truncate" style={{ color: T.creamMid, maxWidth: '9rem' }}>
                              {dishName(item.translationKey)}
                            </span>
                            <div className={`flex items-center gap-2 shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                              <span className="font-bold" style={{ color: T.cream }}>×{selections[item.id]}</span>
                              <span className="text-[10px]" style={{ color: T.gold }}>
                                {formatVal(item.price * selections[item.id])}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Totals */}
                <div className="space-y-4 pt-5" style={{ borderTop: `1px solid ${T.borderSub}` }}>
                  <div className={`flex items-end justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: T.creamLow }}>{t('totalLabel')}</p>
                    <Counter value={formatVal(totalPrice)} className="text-4xl font-serif text-white" />
                  </div>
                  <AnimatePresence>
                    {avgPerPerson > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="rounded-2xl px-4 py-4 space-y-2"
                        style={{ background: 'rgba(247,242,235,0.05)' }}
                      >
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <p className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5" style={{ color: T.creamLow }}>
                            <Users size={10} /> {t('perPersonLabel')}
                          </p>
                          <Counter value={`~ ${formatVal(avgPerPerson)}`} className="text-xl font-serif font-bold" style={{ color: T.gold }} />
                        </div>
                        {priceTier && <p className={`text-[9px] uppercase tracking-widest font-bold ${priceTier.color}`}>{priceTier.label}</p>}
                        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(247,242,235,0.1)' }}>
                          <motion.div className="h-full rounded-full" style={{ background: T.gold }}
                            animate={{ width: `${Math.min((avgPerPerson / 30) * 100, 100)}%` }}
                            transition={{ duration: 0.4 }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Book button */}
                <button
                  onClick={handleBooking}
                  disabled={totalPrice === 0 || isBooking}
                  className="w-full py-5 rounded-full font-bold uppercase tracking-widest text-[10px]
                    active:scale-95 transition-all disabled:opacity-20 shadow-xl flex items-center justify-center gap-2"
                  style={{ background: T.gold, color: '#0c0803', boxShadow: `0 8px 32px rgba(193,127,59,0.3)` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f2eb'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.gold; }}
                >
                  {isBooking ? <span className="animate-pulse">…</span>
                    : <>{t('bookButton')} {isRTL ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}</>}
                </button>
                <p className="text-[9px] text-center uppercase tracking-tighter italic" style={{ color: 'rgba(247,242,235,0.2)' }}>
                  {t('disclaimer')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Mobile FAB ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button onClick={() => setSummaryOpen(true)} aria-label={t('openSummaryLabel')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl shadow-2xl active:scale-[0.98] transition-all duration-300 min-h-14"
          style={{ background: '#0c0803', border: `1px solid ${T.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', color: T.cream }}>
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
        onBook={handleBooking} isBooking={isBooking} isRTL={isRTL} t={t} d={d}
      />
    </div>
  );
}