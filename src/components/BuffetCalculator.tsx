'use client';

import React, {
  useState, useMemo, useCallback, useRef, useEffect,
} from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { MOCK_MENU } from '@/components/MenuExplorer';
import type { MenuItem } from '@/data/menu';
import ItemModal from '@/components/ItemModal';
import { Receipt, X, ChevronLeft, ChevronDown, Pencil, AlertTriangle, MapPin, Trash2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

/* ══ CONSTANTS ══════════════════════════════════════════════════════════════ */

const MENU_ITEMS: MenuItem[] = MOCK_MENU.flatMap(s => s.items);
const MAX_GUESTS         = 9999;
const UNDO_TIMEOUT_MS    = 3500;
const PICKUP_ADDRESS     = 'Friedhofsweg 1, 12529 Schönefeld';

// Pieces required per person at each meal-size level (snack → lavish).
// Drives the "Für X Personen" feedback under the slider.
const PIECES_PER_PERSON  = [1.5, 2.5, 4, 6] as const;
const SIZE_LABELS_KEY    = ['sizeSnack', 'sizeLight', 'sizeFull', 'sizeLavish'] as const;

/* ══ SUGGESTION BUILDER ═════════════════════════════════════════════════════ */

function buildSuggestion(
  cookStyle: CookStyle,
  guests: number,
  mealType: MealType,
): { id: string; qty: number }[] {
  const eligible = MENU_ITEMS.filter(item => {
    if (cookStyle === 'vegan') return item.dietaryTags.includes('vegan' as any);
    if (cookStyle === 'veg')   return item.dietaryTags.includes('vegan' as any) || item.dietaryTags.length === 0;
    return true;
  });
  if (!eligible.length) return [];

  // Pick one item per category, max 8 total
  const picked: MenuItem[] = [];
  for (const section of MOCK_MENU) {
    const hit = section.items.find(i => eligible.some(e => e.id === i.id));
    if (hit) picked.push(hit);
    if (picked.length >= 8) break;
  }
  if (!picked.length) picked.push(...eligible.slice(0, 5));

  // ~2–3 portions per person spread across all picked items
  const piecesPerPerson = mealType === 'buffet' ? 2.5 : 3.5;
  const qtyPerItem = Math.max(1, Math.round((guests * piecesPerPerson) / picked.length));
  return picked.map(item => ({ id: item.id, qty: qtyPerItem }));
}

const C = {
  bg:         '#0c0803',
  panel:      '#130e07',
  surface:    'rgba(247,242,235,0.04)',
  surfaceHi:  'rgba(247,242,235,0.07)',
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
  redBg:      'rgba(220,75,65,0.12)',
  success:    '#9ccb78',
} as const;

/* ══ TYPES ══════════════════════════════════════════════════════════════════ */

type CookStyle   = 'vegan' | 'veg' | 'meat';
type MealType    = 'buffet' | 'hot';
type MenuFilter  = 'all' | 'vegan' | 'vegetarian' | 'meat';
type Fulfillment = 'pickup' | 'delivery';
type PriceMode   = 'brutto' | 'netto';
type EditingRow  = 'date' | 'fulfillment' | null;

interface UndoEntry { id: string; qty: number; timer: ReturnType<typeof setTimeout>; }

/* ══ HOOKS ══════════════════════════════════════════════════════════════════ */

function useSectionCounts(selections: Record<string, number>) {
  return useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_MENU.forEach(s => {
      map[s.categoryKey] = s.items.reduce((acc, i) => acc + (selections[i.id] || 0), 0);
    });
    return map;
  }, [selections]);
}

function useElementHeight(ref: React.RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return height;
}

/* ══ UNDO TOAST ═════════════════════════════════════════════════════════════ */

interface UndoToastProps { message: string; onUndo: () => void; onDismiss: () => void; }

function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      style={{
        position: 'fixed', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: '#1e1710', border: `1px solid ${C.goldBorder}`,
        borderRadius: '10px', padding: '0.6rem 1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '0.78rem', color: C.text }}>{message}</span>
      <button onClick={onUndo}
        style={{ background: C.gold, color: '#0c0803', border: 'none', borderRadius: '6px', padding: '3px 10px', fontFamily: 'inherit', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}>
        Undo
      </button>
      <button onClick={onDismiss} aria-label="Dismiss"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, lineHeight: 1, fontFamily: 'inherit' }}>
        <X size={12} />
      </button>
    </motion.div>
  );
}

/* ══ CALENDAR ════════════════════════════════════════════════════════════════ */

interface CalendarProps {
  selected: Date | null;
  onSelect: (d: Date) => void;
  locale: string;
}

function CateringCalendar({ selected, onSelect, locale }: CalendarProps) {
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const year  = view.getFullYear();
  const month = view.getMonth();

  const cells: (number | null)[] = useMemo(() => {
    const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month]);

  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  // Demo: deterministically mark some days as "pickup-only" / "no capacity"
  // so the legend matches refueat. Replace with real availability data later.
  const dayStatus = (d: number): 'open' | 'pickupOnly' | 'soldOut' => {
    const dow = new Date(year, month, d).getDay();
    if (dow === 0 || dow === 6) return 'pickupOnly';
    if (d % 13 === 0) return 'soldOut';
    return 'open';
  };

  const monthLabel = view.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const DOWS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const navBtn = (dir: -1 | 1) => (
    <button type="button" onClick={() => setView(new Date(year, month + dir, 1))}
      aria-label={dir === -1 ? 'Previous month' : 'Next month'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontFamily: 'inherit', fontSize: '0.85rem', padding: '2px 5px', borderRadius: '4px' }}>
      {dir === -1 ? '◄' : '►'}
    </button>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, borderRadius: '8px', padding: '0.4rem 0.65rem', marginBottom: '0.65rem' }}>
        {navBtn(-1)}
        <span style={{ fontSize: '0.83rem', fontWeight: 600, color: C.text, textTransform: 'capitalize' }}>{monthLabel}</span>
        {navBtn(1)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {DOWS.map(w => (
          <div key={w} style={{ textAlign: 'center', fontSize: '0.66rem', fontWeight: 600, color: C.muted, padding: '3px 0 5px' }}>
            {w}
          </div>
        ))}
        {cells.map((dd, i) => {
          if (dd === null) return <div key={`e${i}`} />;
          const date    = new Date(year, month, dd);
          const past    = date < today;
          const sel     = selected != null && same(date, selected);
          const isToday = same(date, today);
          const status  = !past ? dayStatus(dd) : 'open';
          const soldOut    = status === 'soldOut';
          const pickupOnly = status === 'pickupOnly';
          const disabled   = past || soldOut;

          return (
            <button
              key={i} type="button" disabled={disabled}
              onClick={() => !disabled && onSelect(date)}
              aria-label={date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
              aria-pressed={sel}
              onKeyDown={e => {
                const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
                if (!move) return;
                e.preventDefault();
                const next = new Date(year, month, dd + move);
                if (next >= today) onSelect(next);
              }}
              style={{
                textAlign: 'center', fontSize: '0.73rem', padding: '5px 2px',
                borderRadius: '6px', border: 'none', lineHeight: 1.4,
                cursor: disabled ? 'default' : 'pointer',
                background: sel ? C.gold
                  : soldOut ? 'rgba(220,75,65,0.18)'
                  : pickupOnly ? 'rgba(193,127,59,0.12)'
                  : isToday ? C.goldBg
                  : 'transparent',
                color: sel ? '#0c0803'
                  : past ? 'rgba(247,242,235,0.18)'
                  : soldOut ? 'rgba(220,75,65,0.7)'
                  : C.text,
                fontWeight: sel || isToday ? 700 : 400,
                outline: isToday && !sel ? `1px solid ${C.goldBorder}` : 'none',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
            >
              {dd}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.9rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.66rem', color: C.muted }}>
          <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: 'rgba(193,127,59,0.35)' }} />
          {locale === 'de' ? 'nur Abholung' : locale === 'ar' ? 'استلام فقط' : 'pickup only'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.66rem', color: C.muted }}>
          <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: 'rgba(220,75,65,0.4)' }} />
          {locale === 'de' ? 'keine Kapazitäten' : locale === 'ar' ? 'لا توجد سعة' : 'no capacity'}
        </div>
      </div>
    </>
  );
}

/* ══ QUANTITY STEPPER ════════════════════════════════════════════════════════ */

interface StepperProps { id: string; name: string; qty: number; onInc: () => void; onDec: () => void; small?: boolean; }

function Stepper({ id, name, qty, onInc, onDec, small }: StepperProps) {
  const sz = small ? 24 : 30;
  const fs = small ? '0.8rem' : '0.9rem';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: small ? '4px' : '5px' }}>
      <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={onDec} aria-label={`Decrease ${name}`}
        style={{ width: sz, height: sz, border: `1px solid ${C.border}`, borderRadius: '50%', background: 'transparent', fontSize: fs, color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
        −
      </motion.button>
      <AnimatePresence mode="wait">
        <motion.span key={qty} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
          style={{ fontSize: small ? '0.84rem' : '0.9rem', fontWeight: 600, minWidth: small ? '18px' : '22px', textAlign: 'center', color: C.text }}>
          {qty}
        </motion.span>
      </AnimatePresence>
      <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={onInc} aria-label={`Increase ${name}`}
        style={{ width: sz, height: sz, border: `1px solid ${C.border}`, borderRadius: '50%', background: 'transparent', fontSize: fs, color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
        +
      </motion.button>
    </div>
  );
}

/* ══ PRODUCT CARD (large vertical, refueat-style) ════════════════════════════ */

interface ProductCardProps {
  item: MenuItem;
  qty: number;
  translate: (k: string) => string;
  formatVal: (n: number) => string;
  onOpen: () => void;
  onInc: () => void;
  onDec: () => void;
}

function ProductCard({ item, qty, translate, formatVal, onOpen, onInc, onDec }: ProductCardProps) {
  const inCart = qty > 0;
  return (
    <motion.div
      layout
      role="button" tabIndex={0}
      aria-label={`View ${translate(item.nameKey)}, ${formatVal(item.price)}`}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={{
        background: '#14110d',
        border: `1px solid ${inCart ? C.gold : 'rgba(247,242,235,0.07)'}`,
        borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
        boxShadow: inCart ? `0 0 0 1px ${C.gold}, 0 8px 28px rgba(0,0,0,0.35)` : '0 4px 14px rgba(0,0,0,0.22)',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
        <img src={item.image} alt="" loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,8,3,0.55) 0%, transparent 45%)' }} />
      </div>

      {/* Info */}
      <div style={{ padding: '0.9rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.35rem', fontWeight: 400, color: C.text, lineHeight: 1.15, margin: 0 }}>
          {translate(item.nameKey)}
        </h3>

        {item.dietaryTags.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {item.dietaryTags.slice(0, 2).map(tag => (
              <span key={tag} style={{ fontSize: '0.62rem', background: C.tagBg, color: C.tagText, borderRadius: '4px', padding: '2px 7px', fontFamily: "'Jost', sans-serif", fontWeight: 600 }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <p style={{ fontSize: '0.78rem', color: C.muted, lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {translate(item.descriptionKey)}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 500, color: C.text, lineHeight: 1 }}>
              {formatVal(item.price)}
            </div>
            <div style={{ fontSize: '0.62rem', color: C.muted, marginTop: '3px' }}>(inkl. MwSt.)</div>
          </div>

          {inCart ? (
            <div onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', border: `1.5px solid ${C.gold}`, borderRadius: '8px', padding: '3px 4px', background: 'rgba(193,127,59,0.05)' }}>
              <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={onDec} aria-label="Decrease"
                style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: C.text, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                −
              </motion.button>
              <span style={{ minWidth: '22px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: C.text }}>{qty}</span>
              <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={onInc} aria-label="Increase"
                style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: C.text, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                +
              </motion.button>
            </div>
          ) : (
            <motion.button type="button" whileTap={{ scale: 0.85 }}
              onClick={e => { e.stopPropagation(); onInc(); }}
              aria-label={`Add ${translate(item.nameKey)}`}
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1.5px solid rgba(247,242,235,0.22)`, background: 'transparent', color: C.text, fontSize: '1.2rem', lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.gold; (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = '#0c0803'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,242,235,0.22)'; (e.currentTarget as HTMLElement).style.color = C.text; }}>
              +
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ══ MEAL-SIZE SLIDER ════════════════════════════════════════════════════════ */

interface MealSizeProps {
  mealSize: number;
  setMealSize: (n: number) => void;
  guests: number;
  totalDishCount: number;
  t: ReturnType<typeof useTranslations>;
  locale: string;
}

function MealSizeBlock({ mealSize, setMealSize, guests, totalDishCount, t, locale }: MealSizeProps) {
  const piecesPerPerson = PIECES_PER_PERSON[mealSize];
  const peopleSupported = Math.floor(totalDishCount / piecesPerPerson);
  const fillPct         = Math.min(100, (peopleSupported / Math.max(1, guests)) * 100);

  const labels = SIZE_LABELS_KEY.map(k => t(k));
  const forText = locale === 'de' ? 'Für' : locale === 'ar' ? 'لـ' : 'For';
  const peopleText = locale === 'de' ? 'Personen' : locale === 'ar' ? 'أشخاص' : 'People';

  return (
    <div style={{ padding: '0.9rem 1.4rem', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: C.text }}>
          {forText} <strong style={{ color: peopleSupported >= guests ? C.success : C.gold, fontWeight: 700 }}>{peopleSupported} {peopleText}</strong>
          <button onClick={() => {}} style={{ marginLeft: '6px', background: 'none', border: 'none', color: C.muted, fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            ({locale === 'de' ? 'ändern' : locale === 'ar' ? 'تغيير' : 'change'})
          </button>
        </span>
      </div>

      {/* Progress + slider track */}
      <div style={{ position: 'relative', height: '6px', borderRadius: '4px', background: C.surface, marginBottom: '0.6rem', overflow: 'hidden' }}>
        <motion.div
          initial={false}
          animate={{ width: `${fillPct}%` }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          style={{ position: 'absolute', inset: 0, right: 'auto', background: peopleSupported >= guests ? C.success : C.gold, borderRadius: '4px' }}
        />
      </div>

      {/* Label row (clickable) */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {labels.map((label, idx) => {
          const active = mealSize === idx;
          return (
            <button key={idx} type="button" onClick={() => setMealSize(idx)}
              style={{
                flex: 1, textAlign: idx === 0 ? 'left' : idx === labels.length - 1 ? 'right' : 'center',
                fontSize: '0.66rem', lineHeight: 1.3,
                color: active ? C.gold : C.muted,
                fontWeight: active ? 700 : 500,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', padding: '0 2px',
                transition: 'color 0.15s',
              }}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══ MOBILE DRAWER ═══════════════════════════════════════════════════════════ */

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedItems: MenuItem[];
  totalPrice: number;
  totalDishCount: number;
  formatVal: (n: number) => string;
  translate: (k: string) => string;
  handleInc: (id: string) => void;
  handleDec: (id: string) => void;
  removeItem: (id: string) => void;
  selections: Record<string, number>;
  guests: number;
  mealSize: number;
  setMealSize: (n: number) => void;
  eventDate: Date | null;
  setEventDate: (d: Date) => void;
  locale: string;
  onBook: () => void;
  isBooking: boolean;
  t: ReturnType<typeof useTranslations>;
  catLabel: (k: string) => string;
  fulfillment: Fulfillment;
  setFulfillment: (f: Fulfillment) => void;
  pickupHour: string;
  setPickupHour: (h: string) => void;
  pickupMinute: string;
  setPickupMinute: (m: string) => void;
}

function MobileDrawer({
  open, onClose, totalPrice, totalDishCount,
  formatVal, translate, handleInc, handleDec, removeItem,
  selections, guests, mealSize, setMealSize,
  eventDate, setEventDate, locale, onBook, isBooking, t, catLabel,
  fulfillment, setFulfillment, pickupHour, setPickupHour, pickupMinute, setPickupMinute,
}: MobileDrawerProps) {
  const dragY   = useMotionValue(0);
  const opacity = useTransform(dragY, [0, 200], [1, 0]);

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
            drag="y" dragConstraints={{ top: 0 }} dragElastic={{ top: 0, bottom: 0.3 }}
            style={{ y: dragY, opacity }}
            onDragEnd={(_, info) => { if (info.offset.y > 120) onClose(); else dragY.set(0); }}
            aria-modal="true" role="dialog" aria-label="Order summary"
            className="mobile-drawer"
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '9999px', background: 'rgba(247,242,235,0.18)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.2rem 0.7rem', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '0.95rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: C.text }}>
                {t('summaryTitle')}
              </span>
              <button onClick={onClose} aria-label="Close drawer"
                style={{ background: C.surface, border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.text, fontFamily: 'inherit' }}>
                <X size={13} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
              {/* Date row */}
              <div style={{ padding: '0.85rem 1.2rem', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: '0.4rem' }}>
                  {locale === 'de' ? 'Wann?' : locale === 'ar' ? 'متى؟' : 'When?'}
                </p>
                <CateringCalendar selected={eventDate} onSelect={setEventDate} locale={locale} />
              </div>

              {/* Fulfillment row */}
              <div style={{ padding: '0.85rem 1.2rem', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: '0.4rem' }}>
                  {locale === 'de' ? 'Wie?' : locale === 'ar' ? 'كيف؟' : 'How?'}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '0.6rem' }}>
                  {([
                    { id: 'pickup' as Fulfillment, label: locale === 'de' ? 'Abholung' : locale === 'ar' ? 'استلام' : 'Pickup' },
                    { id: 'delivery' as Fulfillment, label: locale === 'de' ? 'Lieferung' : locale === 'ar' ? 'توصيل' : 'Delivery' },
                  ]).map(opt => {
                    const on = fulfillment === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={() => setFulfillment(opt.id)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', fontFamily: 'inherit', border: `1.5px solid ${on ? C.gold : C.border}`, background: on ? C.gold : 'transparent', color: on ? '#0c0803' : C.text, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {fulfillment === 'pickup' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select value={pickupHour} onChange={e => setPickupHour(e.target.value)}
                        style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: '5px 8px', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.82rem' }}>
                        {Array.from({ length: 13 }, (_, i) => 10 + i).map(h => <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>)}
                      </select>
                      <span style={{ color: C.muted }}>:</span>
                      <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)}
                        style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: '5px 8px', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.82rem' }}>
                        {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '0.5rem', lineHeight: 1.5 }}>
                      <MapPin size={11} style={{ verticalAlign: 'middle', marginRight: '4px', color: C.gold }} />
                      {PICKUP_ADDRESS}
                    </p>
                  </>
                )}
              </div>

              {/* Meal-size slider (only when cart > 0) */}
              {totalDishCount > 0 && (
                <MealSizeBlock mealSize={mealSize} setMealSize={setMealSize} guests={guests}
                  totalDishCount={totalDishCount} t={t} locale={locale} />
              )}

              {/* Cart items */}
              <AnimatePresence>
                {MOCK_MENU.map(section => {
                  const sItems = section.items.filter(i => (selections[i.id] || 0) > 0);
                  if (!sItems.length) return null;
                  return (
                    <React.Fragment key={section.categoryKey}>
                      <div style={{ padding: '0.55rem 1.2rem 0.3rem', fontSize: '0.66rem', fontWeight: 700, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', background: C.goldBg, borderBottom: `1px solid ${C.goldBorder}` }}>
                        {catLabel(section.categoryKey)}
                      </div>
                      {sItems.map(item => (
                        <motion.div key={item.id} layout
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12, height: 0, padding: 0 }}
                          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1.2rem', borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {translate(item.nameKey)}
                            </div>
                            <div style={{ fontSize: '0.76rem', fontWeight: 500, color: C.gold, marginTop: '2px' }}>
                              {formatVal(item.price * (selections[item.id] || 0))}
                            </div>
                          </div>
                          <Stepper id={item.id} name={translate(item.nameKey)} qty={selections[item.id]}
                            onInc={() => handleInc(item.id)} onDec={() => handleDec(item.id)} small />
                          <button onClick={() => removeItem(item.id)} aria-label={`Remove ${translate(item.nameKey)}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: '6px', lineHeight: 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', transition: 'background 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.redBg; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>

              {totalDishCount === 0 && (
                <div style={{ padding: '2rem 1.2rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.82rem', color: C.muted, fontStyle: 'italic' }}>
                    {locale === 'de' ? 'Wähle jetzt Produkte aus!' : locale === 'ar' ? 'اختر منتجاتك الآن!' : 'Pick your dishes now!'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '0.8rem 1.2rem 0.25rem', borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', color: C.muted }}>
                  {locale === 'de' ? 'Gebührenübersicht' : locale === 'ar' ? 'نظرة عامة على الرسوم' : 'Fee overview'}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 600, color: C.text }}>{formatVal(totalPrice)}</span>
              </div>
              <button onClick={onBook} disabled={totalPrice === 0 || isBooking}
                style={{ width: '100%', padding: '0.9rem', background: totalPrice === 0 ? C.goldBg : C.gold, color: '#0c0803', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: totalPrice === 0 ? 'not-allowed' : 'pointer' }}>
                {isBooking ? '…' : (locale === 'de' ? 'Bestelldetails ergänzen' : locale === 'ar' ? 'إكمال تفاصيل الطلب' : 'Complete order details')}
              </button>
            </div>
          </motion.div>

          <style>{`
            .mobile-drawer {
              position: fixed; bottom: 0; left: 0; right: 0; z-index: 51;
              background: ${C.panel}; border-top: 1px solid ${C.goldBorder};
              border-radius: 20px 20px 0 0; max-height: 90vh;
              display: flex; flex-direction: column;
              padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
            }
          `}</style>
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
  const { cart, addToCart, updateQty, clearCart } = useCart();
  const isRTL  = locale === 'ar';

  const symbol = m('currencySymbol');
  const pos    = m('currencyPos');

  const translate = useCallback(
    (key: string) => { try { return mt(key); } catch { return key; } },
    [mt],
  );

  const formatVal = useCallback((num: number) => {
    const val = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return pos === 'prefix' ? `${symbol}${val}` : `${val} ${symbol}`;
  }, [pos, symbol]);

  /* ── State ── */
  const [cookStyle,    setCookStyle]    = useState<CookStyle>('veg');
  const [guests,       setGuests]       = useState(25);
  const [mealType,     setMealType]     = useState<MealType>('buffet');
  const [mealSize,     setMealSize]     = useState(0); // 0 = snack, default like refueat
  const [eventDate,    setEventDate]    = useState<Date | null>(null);
  const [fulfillment,  setFulfillment]  = useState<Fulfillment>('pickup');
  const [pickupHour,   setPickupHour]   = useState('12');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [isBooking,    setIsBooking]    = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [menuFilter,   setMenuFilter]   = useState<MenuFilter>('all');
  const [priceMode,    setPriceMode]    = useState<PriceMode>('brutto');
  const [allergenOpen, setAllergenOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeSection,setActiveSection]= useState<string>(MOCK_MENU[0]?.categoryKey ?? '');
  const [editingGuests,setEditingGuests]= useState(false);
  const [guestInput,   setGuestInput]   = useState('');
  const [editingRow,   setEditingRow]   = useState<EditingRow>('date');
  const [undoEntry,    setUndoEntry]    = useState<UndoEntry | null>(null);
  // Cart items collapse behind an "ansehen" toggle like refueat — keeps the
  // sidebar quiet while the user is still browsing.
  const [showCartDetails, setShowCartDetails] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const [clearCartModal,    setClearCartModal]    = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<{ id: string; qty: number }[]>([]);

  // Default date if user never picks: next Sunday (refueat-style).
  const defaultDateLabel = useMemo(() => {
    if (eventDate) {
      return eventDate.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    return d.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [eventDate, locale]);

  const filterBarRef = useRef<HTMLDivElement>(null);
  const filterBarH   = useElementHeight(filterBarRef);

  /* ── Cart derived ── */
  const selections = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(c => { map[c.id] = c.qty; });
    return map;
  }, [cart]);

  const handleInc = useCallback((id: string) => {
    const item = MENU_ITEMS.find(i => i.id === id);
    if (!item) return;
    if (cart.some(c => c.id === id)) updateQty(id, 1);
    else addToCart({ id: item.id, nameKey: item.nameKey, price: item.price, qty: 1, img: item.image });
  }, [cart, updateQty, addToCart]);

  const handleDec = useCallback((id: string) => updateQty(id, -1), [updateQty]);

  const removeItem = useCallback((id: string) => {
    const qty = selections[id] ?? 0;
    if (!qty) return;
    if (undoEntry) clearTimeout(undoEntry.timer);
    updateQty(id, -qty);
    const timer = setTimeout(() => setUndoEntry(null), UNDO_TIMEOUT_MS);
    setUndoEntry({ id, qty, timer });
  }, [selections, updateQty, undoEntry]);

  const handleUndo = useCallback(() => {
    if (!undoEntry) return;
    clearTimeout(undoEntry.timer);
    const item = MENU_ITEMS.find(i => i.id === undoEntry.id);
    if (!item) return;
    addToCart({ id: item.id, nameKey: item.nameKey, price: item.price, qty: undoEntry.qty, img: item.image });
    setUndoEntry(null);
  }, [undoEntry, addToCart]);

  /* ── Aggregates ── */
  const totalDishCount = useMemo(() => Object.values(selections).reduce((a, b) => a + b, 0), [selections]);
  const totalPrice     = useMemo(() => MENU_ITEMS.reduce((s, i) => s + i.price * (selections[i.id] || 0), 0), [selections]);
  const selectedItems  = useMemo(() => MENU_ITEMS.filter(i => (selections[i.id] || 0) > 0), [selections]);
  const sectionCounts  = useSectionCounts(selections);

  // Brutto/Netto are visual-only for now; in DE catering, Netto is ~19% lower.
  const displayPrice = priceMode === 'netto' ? totalPrice / 1.19 : totalPrice;

  /* ── Booking ── */
  const handleBooking = useCallback(() => {
    if (totalPrice === 0) return;
    setIsBooking(true);
    const params = new URLSearchParams({ type: 'catering' });
    if (eventDate) {
      params.set('date', `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`);
    }
    params.set('fulfillment', fulfillment);
    params.set('guests', String(guests));
    params.set('mealSize', String(mealSize));
    if (fulfillment === 'pickup') params.set('time', `${pickupHour}:${pickupMinute}`);
    router.push(`/checkout?${params.toString()}` as any);
  }, [totalPrice, router, eventDate, fulfillment, guests, mealSize, pickupHour, pickupMinute]);

  /* ── Scroll-tracked active section ── */
  useEffect(() => {
    const TABS_H = 106;
    const onScroll = () => {
      const threshold = TABS_H + filterBarH + 8;
      let current = MOCK_MENU[0]?.categoryKey ?? '';
      for (const section of MOCK_MENU) {
        const el = document.getElementById(`menu-section-${section.categoryKey}`);
        if (el && el.getBoundingClientRect().top <= threshold) current = section.categoryKey;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [filterBarH]);

  /* ── Auto-collapse editing rows ── */
  useEffect(() => { if (eventDate && editingRow === 'date') setEditingRow('fulfillment'); }, [eventDate]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-expand cart details when user adds their first item ── */
  useEffect(() => {
    if (totalDishCount === 1 && !showCartDetails) setShowCartDetails(true);
    if (totalDishCount === 0) setShowCartDetails(false);
  }, [totalDishCount]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Suggestion ── */
  const applySuggestion = useCallback((items: { id: string; qty: number }[]) => {
    for (const { id, qty } of items) {
      const item = MENU_ITEMS.find(i => i.id === id);
      if (!item) continue;
      addToCart({ id: item.id, nameKey: item.nameKey, price: item.price, qty, img: item.image });
    }
    setSuggestionApplied(true);
    setClearCartModal(false);
  }, [addToCart]);

  const handleViewSuggestion = useCallback(() => {
    const suggestion = buildSuggestion(cookStyle, guests, mealType);
    if (totalDishCount > 0) {
      setPendingSuggestion(suggestion);
      setClearCartModal(true);
    } else {
      applySuggestion(suggestion);
    }
  }, [cookStyle, guests, mealType, totalDishCount, applySuggestion]);

  /* ── Filter logic ── */
  const filterItem = (item: MenuItem): boolean => {
    if (menuFilter === 'all') return true;
    if (menuFilter === 'vegan') return item.dietaryTags.includes('vegan' as any);
    if (menuFilter === 'vegetarian') return item.dietaryTags.includes('vegan' as any) || item.dietaryTags.includes('vegetarian' as any);
    if (menuFilter === 'meat') return !item.dietaryTags.includes('vegan' as any);
    return true;
  };

  /* ─────────────────── RENDER ─────────────────── */

  return (
    <>
      <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: C.bg, position: 'relative' }}>

        {/* Background decoration */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: "url('/images/islamic-circle1.png')", backgroundSize: '620px 620px', backgroundPosition: 'center' }} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(circle at top, rgba(193,127,59,0.08), transparent 35%)' }} />

        {/* ══ CATEGORY TABS ══════════════════════════════════════════════════ */}
        <nav aria-label="Menu categories"
          style={{ background: 'rgba(19,14,7,0.96)', borderBottom: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none', position: 'sticky', top: '60px', zIndex: 30, backdropFilter: 'blur(10px)', height: '46px', display: 'flex', alignItems: 'stretch' }}>
          <div style={{ display: 'inline-flex', padding: '0 1.75rem' }}>
            {MOCK_MENU.map(section => {
              const cnt    = sectionCounts[section.categoryKey] ?? 0;
              const active = activeSection === section.categoryKey;
              return (
                <button key={section.categoryKey} aria-current={active ? 'true' : undefined}
                  onClick={() => {
                    const el = document.getElementById(`menu-section-${section.categoryKey}`);
                    if (!el) return;
                    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 106 - filterBarH, behavior: 'smooth' });
                  }}
                  style={{ padding: '0.8rem 1rem', fontSize: '0.7rem', fontWeight: active ? 700 : 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: active ? C.gold : C.muted, cursor: 'pointer', border: 'none', borderBottom: `2px solid ${active ? C.gold : 'transparent'}`, background: 'none', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = C.text; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = C.muted; }}>
                  {translate(section.categoryKey)}{cnt > 0 ? ` (${cnt})` : ''}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ══ MAIN 2-COL LAYOUT ══════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px' }} className="max-lg:grid-cols-1!">

          {/* ════ LEFT: CONFIGURATOR + MENU ════ */}
          <div style={{ position: 'relative', backgroundColor: C.bg }}>

            {/* ── Configurator: rounded card, text-left / image-right ── */}
            <div style={{ padding: '1.5rem 1.5rem 0' }}>
              <div style={{
                display: 'flex',
                minHeight: '720px',
                borderRadius: '24px',
                overflow: 'hidden',
                border: `1px solid ${C.border}`,
                background: C.panel,
                boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
              }}>

                {/* LEFT half — content */}
                <div style={{
                  flex: '1 1 55%',
                  padding: '2.4rem 2.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2.75rem',
                  minWidth: 0,
                  position: 'relative',
                  zIndex: 1,
                }}>

                {suggestionApplied ? (
                  /* ── Success state ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', justifyContent: 'center', flex: 1 }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.6rem,3vw,2rem)', fontWeight: 700, lineHeight: 1.2, color: C.text }}>
                      {locale === 'de'
                        ? 'Klasse! Deine empfohlene Auswahl wurde dem Warenkorb hinzugefügt.'
                        : locale === 'ar'
                        ? 'رائع! تمت إضافة اختيارك الموصى به إلى السلة.'
                        : 'Great! Your recommended selection has been added to your cart.'}
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.65 }}>
                      {locale === 'de'
                        ? `Diese Zusammenstellung ist ideal für ein Catering mit ${cookStyle === 'vegan' ? 'veganen' : cookStyle === 'veg' ? 'vegetarischen' : 'Fleisch-'} ${mealType === 'buffet' ? 'Buffetplatten' : 'heißen Gerichten'} für ${guests} Personen.`
                        : locale === 'ar'
                        ? `هذا التشكيل مثالي لخدمة ضيافة ${cookStyle === 'vegan' ? 'نباتية' : cookStyle === 'veg' ? 'خضرية' : 'مع لحوم'} لـ ${guests} شخصًا.`
                        : `This selection is ideal for a ${cookStyle === 'vegan' ? 'vegan' : cookStyle === 'veg' ? 'vegetarian' : 'meat'} ${mealType === 'buffet' ? 'buffet platter' : 'hot dishes'} catering for ${guests} people.`}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.6 }}>
                      {locale === 'de'
                        ? 'Bitte scroll nach unten, um die ausgewählten Gerichte zu betrachten!'
                        : locale === 'ar'
                        ? 'يرجى التمرير لأسفل لمشاهدة الأطباق المختارة!'
                        : 'Please scroll down to view the selected dishes!'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: C.gold, lineHeight: 1.6 }}>
                      {locale === 'de'
                        ? 'Du hast die Möglichkeit, einzelne Produkte zu entfernen oder hinzuzufügen und die Mengen nach Bedarf anzupassen.'
                        : locale === 'ar'
                        ? 'يمكنك إزالة منتجات فردية أو إضافتها وتعديل الكميات حسب الحاجة.'
                        : 'You can remove or add individual products and adjust quantities as needed.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSuggestionApplied(false); clearCart(); }}
                      style={{
                        padding: '0.85rem 1.5rem',
                        background: C.gold,
                        color: '#0c0803',
                        border: 'none',
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        transition: 'background 0.18s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.goldDark; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.gold; }}
                    >
                      {locale === 'de' ? 'Angaben nochmal anpassen' : locale === 'ar' ? 'تعديل الإعدادات' : 'Adjust settings'}
                    </button>
                  </div>
                ) : (
                  <>
                {/* Cook style */}
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.85rem,3.2vw,2.25rem)', fontWeight: 700, lineHeight: 1.1, color: C.text, marginBottom: '1.15rem' }}>
                    {t('configCookTitle')}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }} role="group" aria-label="Cook style">
                    {([
                      { id: 'vegan' as CookStyle, label: t('cookVegan') },
                      { id: 'veg'   as CookStyle, label: t('cookVegetarian') },
                      { id: 'meat'  as CookStyle, label: t('cookMeat'), full: true },
                    ]).map(opt => {
                      const on = cookStyle === opt.id;
                      return (
                        <button key={opt.id} type="button" onClick={() => setCookStyle(opt.id)} aria-pressed={on}
                          style={{ padding: '0.65rem 1.3rem', width: opt.full ? '100%' : 'auto', textAlign: 'center', border: `1.5px solid ${on ? C.gold : 'rgba(247,242,235,0.3)'}`, borderRadius: '8px', background: on ? C.gold : 'transparent', fontFamily: 'inherit', fontSize: '0.85rem', color: on ? '#0c0803' : C.text, cursor: 'pointer', transition: 'all 0.18s' }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guests */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.85rem,3.2vw,2.25rem)', fontWeight: 700, lineHeight: 1.1, color: C.text }}>
                    {t('configGuestsTitle')}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label="Decrease guests"
                      style={{ width: '46px', height: '46px', border: `1.5px solid rgba(247,242,235,0.3)`, background: 'transparent', fontSize: '1.4rem', color: C.text, cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.gold; (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = '#0c0803'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,242,235,0.3)'; (e.currentTarget as HTMLElement).style.color = C.text; }}>
                      −
                    </button>
                    <span style={{ minWidth: '56px', textAlign: 'center', fontSize: '2rem', fontWeight: 600, color: C.text }} aria-live="polite">{guests}</span>
                    <button type="button" onClick={() => setGuests(Math.min(MAX_GUESTS, guests + 1))} aria-label="Increase guests"
                      style={{ width: '46px', height: '46px', border: `1.5px solid rgba(247,242,235,0.3)`, background: 'transparent', fontSize: '1.4rem', color: C.text, cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.gold; (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = '#0c0803'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,242,235,0.3)'; (e.currentTarget as HTMLElement).style.color = C.text; }}>
                      +
                    </button>
                  </div>
                </div>

                {/* Meal type */}
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.85rem,3.2vw,2.25rem)', fontWeight: 700, lineHeight: 1.1, color: C.text, marginBottom: '1.15rem' }}>
                    {t('configMealTitle')}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }} role="group" aria-label="Meal type">
                    {([
                      { id: 'buffet' as MealType, label: t('mealBuffet') },
                      { id: 'hot'    as MealType, label: t('mealHot') },
                    ]).map(opt => {
                      const on = mealType === opt.id;
                      return (
                        <button key={opt.id} type="button" onClick={() => setMealType(opt.id)} aria-pressed={on}
                          style={{ width: '100%', textAlign: 'center', padding: '0.65rem 1.3rem', border: `1.5px solid ${on ? C.gold : 'rgba(247,242,235,0.3)'}`, borderRadius: '8px', background: on ? C.gold : 'transparent', fontFamily: 'inherit', fontSize: '0.85rem', color: on ? '#0c0803' : C.text, cursor: 'pointer', transition: 'all 0.18s' }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* VORSCHLAG ANSEHEN */}
                <button
                  type="button"
                  onClick={handleViewSuggestion}
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.85rem 1.5rem',
                    background: C.gold,
                    color: '#0c0803',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    transition: 'background 0.18s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.goldDark; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.gold; }}
                >
                  {locale === 'de' ? 'Vorschlag ansehen' : locale === 'ar' ? 'عرض الاقتراح' : 'View suggestion'}
                </button>
                  </>
                )}
                </div>

                {/* RIGHT half — food image fills entire side */}
                <div style={{
                  flex: '1 1 45%',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 0,
                }}
                className="max-md:hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop"
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                </div>

              </div>
            </div>

            {/* ── Filter bar (sticky) ── */}
            <div ref={filterBarRef}
              style={{ position: 'sticky', top: '106px', zIndex: 5, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '0.75rem 1.75rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>

              {/* Dietary pills */}
              <div role="group" aria-label="Dietary filter" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(['all', 'vegan', 'vegetarian', 'meat'] as const).map(f => {
                  const label = f === 'all'
                    ? (locale === 'de' ? 'Alles' : locale === 'ar' ? 'الكل' : 'All')
                    : f === 'vegan' ? 'vegan'
                    : f === 'vegetarian' ? (locale === 'de' ? 'vegetarisch' : 'vegetarian')
                    : (locale === 'de' ? 'Fleisch' : locale === 'ar' ? 'لحم' : 'Meat');
                  const active = menuFilter === f;
                  return (
                    <button key={f} type="button" onClick={() => setMenuFilter(f)} aria-pressed={active}
                      style={{ padding: '0.4rem 1.1rem', borderRadius: '6px', fontFamily: 'inherit', border: `1.5px solid ${active ? C.gold : C.border}`, background: active ? C.goldBg : 'transparent', color: active ? C.gold : C.muted, fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Allergen highlighter (visual-only) */}
              <button type="button" onClick={() => setAllergenOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.85rem', borderRadius: '6px', border: `1.5px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>
                <AlertTriangle size={12} />
                {locale === 'de' ? 'Allergene hervorheben' : locale === 'ar' ? 'إبراز مسببات الحساسية' : 'Highlight allergens'}
                <ChevronDown size={11} style={{ transform: allergenOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {/* Brutto/Netto toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: C.muted }}>
                  {locale === 'de' ? 'Preisangaben in:' : locale === 'ar' ? 'الأسعار:' : 'Prices in:'}
                </span>
                <div style={{ display: 'flex', border: `1.5px solid ${C.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                  {(['brutto', 'netto'] as const).map(mode => {
                    const on = priceMode === mode;
                    return (
                      <button key={mode} type="button" onClick={() => setPriceMode(mode)}
                        style={{ padding: '0.35rem 0.85rem', background: on ? C.gold : 'transparent', color: on ? '#0c0803' : C.muted, border: 'none', fontFamily: 'inherit', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Menu sections ── */}
            <div style={{ position: 'relative', zIndex: 1, background: C.bg }}>
              {MOCK_MENU.map(section => {
                const filtered = section.items.filter(filterItem);
                if (filtered.length === 0) return null;
                return (
                  <div key={section.categoryKey} id={`menu-section-${section.categoryKey}`} style={{ padding: '2rem 1.75rem 1.5rem' }}>
                    {/* Section heading — refueat-style: centered, big, with descriptive copy */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.7rem,3vw,2.4rem)', fontWeight: 300, fontStyle: 'italic', color: C.text, lineHeight: 1, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {translate(section.categoryKey)}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.85rem' }}>
                        <div style={{ height: '1px', width: '24px', background: C.gold }} />
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(193,127,59,0.55)' }}>
                          {translate(section.arabicLabelKey)}
                        </span>
                        <div style={{ height: '1px', width: '24px', background: C.gold }} />
                      </div>
                      <p style={{ fontSize: '0.86rem', color: C.muted, maxWidth: '540px', margin: '0 auto', lineHeight: 1.65 }}>
                        {locale === 'de'
                          ? `Stelle dein Catering selbst zusammen. Bei ${guests} Personen reichen ungefähr ${Math.ceil(guests / 2)} XL-Platten. Denke an eine gute Mischung aus Brot, Aufstrichen, Salaten und Fingerfood.`
                          : locale === 'ar'
                          ? `قم بإعداد ضيافتك بنفسك. لـ ${guests} شخصًا، تكفي حوالي ${Math.ceil(guests / 2)} صحون كبيرة. فكر في مزيج جيد من الخبز والصلصات والسلطات والمقبلات.`
                          : `Build your own catering. For ${guests} guests, around ${Math.ceil(guests / 2)} XL platters is plenty. Think a good mix of breads, dips, salads and finger food.`}
                      </p>
                    </div>

                    {/* Larger 2-col grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                      {filtered.map(item => (
                        <ProductCard
                          key={item.id} item={item} qty={selections[item.id] || 0}
                          translate={translate} formatVal={formatVal}
                          onOpen={() => setSelectedItem(item)}
                          onInc={() => handleInc(item.id)}
                          onDec={() => handleDec(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════ RIGHT: SIDEBAR WIZARD ════ */}
          <aside className="max-lg:hidden"
            style={{ position: 'sticky', top: '106px', height: 'calc(100vh - 106px)', background: C.panel, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* ── Cart status header ── */}
            <div style={{ padding: '0.9rem 1.4rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '8px', overflow: 'hidden', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selectedItems[0] ? (
                  <img src={selectedItems[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Receipt size={18} color={C.muted} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {totalDishCount === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: C.text, fontWeight: 500 }}>
                    {locale === 'de' ? 'Wähle jetzt Produkte aus!' : locale === 'ar' ? 'اختر منتجاتك الآن!' : 'Pick your dishes now!'}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: C.text, fontWeight: 500 }}>
                    {totalDishCount} {totalDishCount === 1
                      ? (locale === 'de' ? 'gewähltes Produkt' : locale === 'ar' ? 'منتج مختار' : 'item selected')
                      : (locale === 'de' ? 'gewählte Produkte' : locale === 'ar' ? 'منتجات مختارة' : 'items selected')}
                  </p>
                )}
              </div>
              {totalDishCount > 0 && (
                <button
                  onClick={() => setShowCartDetails(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gold, fontSize: '0.78rem', fontFamily: 'inherit', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {showCartDetails
                    ? (locale === 'de' ? 'verbergen' : locale === 'ar' ? 'إخفاء' : 'hide')
                    : (locale === 'de' ? 'ansehen' : locale === 'ar' ? 'عرض' : 'view')}
                  <ChevronDown size={11} style={{ transform: showCartDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
            </div>

            {/* ── Editable wizard rows + content ── */}
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

              {/* Wann (date) */}
              <div style={{ borderBottom: `1px solid ${C.border}` }}>
                {editingRow !== 'date' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: C.muted }}>
                      {locale === 'de' ? 'Wann:' : locale === 'ar' ? 'متى:' : 'When:'}
                    </span>
                    <button onClick={() => setEditingRow('date')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: C.text, fontSize: '0.85rem', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                      {defaultDateLabel}
                      <Pencil size={12} style={{ color: C.muted }} />
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '0.85rem 1.4rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text, marginBottom: '0.6rem' }}>
                      {locale === 'de' ? 'Wann möchtest du dein Catering erhalten?' : locale === 'ar' ? 'متى تريد خدمة الضيافة؟' : 'When would you like your catering?'}
                    </p>
                    <CateringCalendar selected={eventDate} onSelect={(d) => { setEventDate(d); }} locale={locale} />
                    <button onClick={() => { if (!eventDate) setEventDate(new Date()); setEditingRow('fulfillment'); }}
                      style={{ width: '100%', padding: '0.65rem', marginTop: '0.7rem', background: C.gold, color: '#0c0803', border: 'none', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      {locale === 'de' ? 'Datum wählen' : locale === 'ar' ? 'اختر التاريخ' : 'Select date'}
                    </button>
                  </div>
                )}
              </div>

              {/* Wie (fulfillment) — only after a date is set */}
              {eventDate && (
                <div style={{ borderBottom: `1px solid ${C.border}` }}>
                  {editingRow !== 'fulfillment' ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.4rem' }}>
                      <span style={{ fontSize: '0.85rem', color: C.muted }}>
                        {locale === 'de' ? 'Wie:' : locale === 'ar' ? 'كيف:' : 'How:'}
                      </span>
                      <button onClick={() => setEditingRow('fulfillment')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: C.text, fontSize: '0.85rem', fontFamily: 'inherit' }}>
                        {fulfillment === 'pickup'
                          ? (locale === 'de' ? `Abholung · ${pickupHour}:${pickupMinute}` : locale === 'ar' ? `استلام · ${pickupHour}:${pickupMinute}` : `Pickup · ${pickupHour}:${pickupMinute}`)
                          : (locale === 'de' ? 'Lieferung' : locale === 'ar' ? 'توصيل' : 'Delivery')}
                        <Pencil size={12} style={{ color: C.muted }} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem 1.4rem' }}>
                      {/* Rich card: header + 5% discount messaging + two big CTAs */}
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: C.text, textAlign: 'center', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        {locale === 'de' ? 'Sollen wir liefern oder holst du ab?'
                          : locale === 'ar' ? 'هل نوصل أم ستستلم بنفسك؟'
                          : 'Should we deliver or will you pick up?'}
                      </h4>
                      <p style={{ fontSize: '0.74rem', color: C.muted, textAlign: 'center', lineHeight: 1.55, marginBottom: '0.9rem' }}>
                        {locale === 'de' ? 'Bei einer Selbstabholung von unserer Küche in Schönefeld erhältst du 5% Rabatt auf den Preis der Speisen.'
                          : locale === 'ar' ? 'عند الاستلام من مطبخنا في شونيفلد، تحصل على خصم 5٪ على سعر الطعام.'
                          : 'Pick up from our kitchen in Schönefeld and get a 5% discount on food.'}
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '0.8rem' }}>
                        {([
                          { id: 'delivery' as Fulfillment,
                            label: locale === 'de' ? 'Lieferung' : locale === 'ar' ? 'توصيل' : 'Delivery' },
                          { id: 'pickup'   as Fulfillment,
                            label: (locale === 'de' ? 'Abholung' : locale === 'ar' ? 'استلام' : 'Pickup') + ' (-5%)' },
                        ]).map(opt => {
                          const on = fulfillment === opt.id;
                          return (
                            <button key={opt.id} type="button" onClick={() => setFulfillment(opt.id)}
                              style={{
                                flex: 1,
                                padding: '0.85rem 0.5rem',
                                borderRadius: '6px',
                                fontFamily: 'inherit',
                                border: `1.5px solid ${C.gold}`,
                                background: on ? C.gold : 'transparent',
                                color: on ? '#0c0803' : C.gold,
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {fulfillment === 'pickup' && (
                        <div style={{ padding: '0.85rem', borderRadius: '8px', background: C.surface, border: `1px solid ${C.border}`, marginBottom: '0.8rem' }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: C.text, marginBottom: '0.5rem' }}>
                            {locale === 'de' ? 'Wann möchtest du das Essen abholen?' : locale === 'ar' ? 'متى تريد استلام الطعام؟' : 'When would you like to pick up?'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem' }}>
                            <select value={pickupHour} onChange={e => setPickupHour(e.target.value)}
                              style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text, padding: '6px 10px', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.84rem', minWidth: '60px' }}>
                              {Array.from({ length: 13 }, (_, i) => 10 + i).map(h => <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>)}
                            </select>
                            <span style={{ color: C.muted }}>:</span>
                            <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)}
                              style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text, padding: '6px 10px', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.84rem', minWidth: '60px' }}>
                              {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: C.muted, lineHeight: 1.55, marginBottom: '0.4rem' }}>
                            {locale === 'de' ? 'Dein Essen steht dann zu deiner gewählten Zeit in unserer Küche bereit:'
                              : locale === 'ar' ? 'سيكون طعامك جاهزًا في الوقت المحدد في مطبخنا:'
                              : 'Your food will be ready at your chosen time at our kitchen:'}
                          </p>
                          <p style={{ fontSize: '0.76rem', color: C.gold, fontWeight: 500, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={11} />{PICKUP_ADDRESS}
                          </p>
                        </div>
                      )}

                      <button onClick={() => setEditingRow(null)}
                        style={{ width: '100%', padding: '0.7rem', background: C.gold, color: '#0c0803', border: 'none', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        {locale === 'de' ? 'Weiter' : locale === 'ar' ? 'متابعة' : 'Continue'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Meal-size slider — only when cart has items AND details expanded */}
              {totalDishCount > 0 && showCartDetails && (
                <MealSizeBlock mealSize={mealSize} setMealSize={setMealSize} guests={guests}
                  totalDishCount={totalDishCount} t={t} locale={locale} />
              )}

              {/* Cart items grouped by section — only when expanded */}
              {totalDishCount > 0 && showCartDetails && (
                <div style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ padding: '0.7rem 1.4rem 0.4rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text }}>
                      {locale === 'de' ? 'Catering Platten' : locale === 'ar' ? 'صحون الضيافة' : 'Catering Platters'}
                    </p>
                  </div>
                  <AnimatePresence>
                    {MOCK_MENU.map(section => {
                      const sItems = section.items.filter(i => (selections[i.id] || 0) > 0);
                      if (!sItems.length) return null;
                      return sItems.map(item => (
                        <motion.div key={item.id} layout
                          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0, overflow: 'hidden' }}
                          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.55rem 1.4rem' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: `1px solid ${C.border}` }}>
                            <img src={item.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                              {translate(item.nameKey)}
                              {item.dietaryTags?.[0] && (
                                <span style={{ marginLeft: '6px', fontSize: '0.58rem', background: C.tagBg, color: C.tagText, borderRadius: '4px', padding: '1px 5px', fontWeight: 600 }}>
                                  {item.dietaryTags[0]}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: C.gold, fontWeight: 600, marginTop: '1px' }}>
                              {formatVal(item.price * (selections[item.id] || 0))}
                            </div>
                          </div>
                          <Stepper id={item.id} name={translate(item.nameKey)} qty={selections[item.id] || 0}
                            onInc={() => handleInc(item.id)} onDec={() => handleDec(item.id)} small />
                          <button onClick={() => removeItem(item.id)} aria-label={`Remove ${translate(item.nameKey)}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: '6px', flexShrink: 0, lineHeight: 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', transition: 'background 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.redBg; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ));
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Footer: total + CTA ── */}
            <div style={{ padding: '0.85rem 1.4rem', borderTop: `1px solid ${C.border}`, background: C.panel, flexShrink: 0 }}>
              {totalDishCount > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: C.text }}>{formatVal(displayPrice)}</div>
                    <span style={{ fontSize: '0.68rem', color: C.muted }}>
                      {priceMode === 'brutto' ? '(inkl. MwSt.)' : '(zzgl. MwSt.)'}, {locale === 'de' ? 'zzgl. Gebühren' : locale === 'ar' ? 'بالإضافة للرسوم' : 'plus fees'}
                    </span>
                  </div>
                  <button onClick={handleBooking} disabled={isBooking}
                    style={{ width: '100%', padding: '0.9rem', background: C.gold, color: '#0c0803', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: isBooking ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => { if (!isBooking) (e.currentTarget as HTMLElement).style.background = C.goldDark; }}
                    onMouseLeave={e => { if (!isBooking) (e.currentTarget as HTMLElement).style.background = C.gold; }}>
                    {isBooking ? '…' : (locale === 'de' ? 'Bestelldetails ergänzen' : locale === 'ar' ? 'إكمال تفاصيل الطلب' : 'Complete order details')}
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: C.muted }}>
                  <span>
                    {locale === 'de' ? 'Gebührenübersicht' : locale === 'ar' ? 'نظرة عامة على الرسوم' : 'Fee overview'}
                  </span>
                  <span>{formatVal(0)}</span>
                </div>
              )}
            </div>
          </aside>
        </div>

        <Footer />

        {/* ══ MOBILE FAB ═════════════════════════════════════════════════════ */}
        <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '0.75rem 1rem', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <button onClick={() => setDrawerOpen(true)} aria-label={`Open order summary, ${totalDishCount} items`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.1rem', borderRadius: '14px', background: C.panel, border: `1px solid ${C.goldBorder}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', color: C.text, cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Receipt size={13} color={C.gold} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, lineHeight: 1 }}>{t('summaryTitle')}</p>
                <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '2px' }}>
                  {totalDishCount > 0 ? `${totalDishCount} items · ${guests} ${t('guestUnit')}` : (locale === 'de' ? 'Produkte wählen' : locale === 'ar' ? 'اختر المنتجات' : 'Pick dishes')}
                </p>
              </div>
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 600, color: C.text }}>
              {totalPrice > 0 ? formatVal(displayPrice) : '—'}
            </span>
          </button>
        </div>

        <MobileDrawer
          open={drawerOpen} onClose={() => setDrawerOpen(false)}
          selectedItems={selectedItems} totalPrice={totalPrice} totalDishCount={totalDishCount}
          formatVal={formatVal} translate={translate}
          handleInc={handleInc} handleDec={handleDec} removeItem={removeItem}
          selections={selections} guests={guests} mealSize={mealSize} setMealSize={setMealSize}
          eventDate={eventDate} setEventDate={setEventDate} locale={locale}
          onBook={handleBooking} isBooking={isBooking} t={t} catLabel={translate}
          fulfillment={fulfillment} setFulfillment={setFulfillment}
          pickupHour={pickupHour} setPickupHour={setPickupHour}
          pickupMinute={pickupMinute} setPickupMinute={setPickupMinute}
        />

        <AnimatePresence>
          {undoEntry && (
            <UndoToast
              message={locale === 'de' ? 'Gericht entfernt' : locale === 'ar' ? 'تمت إزالة الطبق' : 'Dish removed'}
              onUndo={handleUndo}
              onDismiss={() => { clearTimeout(undoEntry.timer); setUndoEntry(null); }}
            />
          )}
        </AnimatePresence>
      </div>

      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAdd={item => { handleInc(item.id); setSelectedItem(null); }}
      />

      {/* ── Clear-cart conflict modal ── */}
      <AnimatePresence>
        {clearCartModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 200, backdropFilter: 'blur(4px)' }}
              onClick={() => setClearCartModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 201, width: 'min(480px, 92vw)',
                background: '#1e1810', border: `1px solid ${C.goldBorder}`,
                borderRadius: '16px', padding: '2rem',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
            >
              <button onClick={() => setClearCartModal(false)} aria-label="Close"
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>

              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: C.text, marginBottom: '0.75rem', lineHeight: 1.2 }}>
                {locale === 'de' ? 'Du hast bereits Artikel im Warenkorb.' : locale === 'ar' ? 'لديك بالفعل عناصر في السلة.' : 'You already have items in your cart.'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {locale === 'de'
                  ? 'Möchtest du deinen Warenkorb leeren, bevor wir die Catering-Produkte hinzufügen, oder möchtest du die Catering-Produkte einfach dazulegen?'
                  : locale === 'ar'
                  ? 'هل تريد إفراغ سلتك قبل إضافة منتجات الضيافة، أم تريد إضافتها فقط؟'
                  : 'Would you like to clear your cart before adding the catering products, or simply add them on top?'}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { clearCart(); applySuggestion(pendingSuggestion); }}
                  style={{ flex: 1, padding: '0.85rem 1rem', background: C.gold, color: '#0c0803', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.goldDark; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.gold; }}
                >
                  {locale === 'de' ? 'Leeren & hinzufügen' : locale === 'ar' ? 'إفراغ وإضافة' : 'Clear & add'}
                </button>
                <button
                  type="button"
                  onClick={() => applySuggestion(pendingSuggestion)}
                  style={{ flex: 1, padding: '0.85rem 1rem', background: 'transparent', color: C.gold, border: `1.5px solid ${C.gold}`, borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.goldBg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {locale === 'de' ? 'Ungeändert hinzufügen' : locale === 'ar' ? 'إضافة دون تغيير' : 'Add without clearing'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}