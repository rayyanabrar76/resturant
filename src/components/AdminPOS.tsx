'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Minus, Printer, User, MapPin, Calendar, Clock,
  Trash2, LogOut, Images, Phone, ShoppingBag, UtensilsCrossed, NotebookPen,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { MENU_DATA } from '@/data/menu';
import type { MenuItem } from '@/data/menu';

const ADMIN_PIN = '1234';

const G = {
  bg:     '#0c0803',
  panel:  '#110d08',
  surf:   'rgba(247,242,235,0.035)',
  border: 'rgba(193,127,59,0.14)',
  gold:   '#c17f3b',
  goldBg: 'rgba(193,127,59,0.1)',
  text:   '#f7f2eb',
  muted:  'rgba(247,242,235,0.38)',
  red:    '#ef4444',
} as const;

interface OrderItem       { item: MenuItem; name: string; qty: number; }
interface CustomerDetails { name: string; phone: string; address: string; date: string; time: string; notes: string; }
type MobileTab = 'details' | 'menu' | 'order';

/* ── Receipt printer ─────────────────────────────────────────────────────── */
function openReceipt(details: CustomerDetails, items: OrderItem[], total: number) {
  const fmt = (n: number) =>
    `€${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const now = new Date();
  const ts  = now.toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const rows = items.map(({ name, item, qty }) => `
    <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;">
      <span>${qty}&times; ${name}</span>
      <span style="font-weight:bold">${fmt(item.price * qty)}</span>
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Courier New',monospace;font-size:12px;color:#000;background:#fff;
      width:80mm;max-width:80mm;padding:6mm 4mm;line-height:1.55;}
    .c{text-align:center;} .b{font-weight:bold;}
    .hr{border-top:1px dashed #000;margin:7px 0;}
    .row{display:flex;justify-content:space-between;}
    @media print{@page{size:80mm auto;margin:0;}}
  </style>
</head>
<body>
  <div class="c b" style="font-size:15px;letter-spacing:1px;margin-bottom:3px;">CHEF ABOUD KÜCHE</div>
  <div class="c" style="font-size:10px;color:#555;">Levantinische Küche · Berlin</div>
  <div class="c" style="font-size:10px;color:#555;">Friedhofsweg 1, 12529 Schönefeld</div>
  <div class="c" style="font-size:10px;color:#555;margin-bottom:2px;">+49 176 066 6501</div>
  <div class="hr"></div>
  <div class="c b" style="font-size:13px;letter-spacing:2px;margin-bottom:2px;">CATERING BESTELLUNG</div>
  <div class="c" style="font-size:10px;color:#666;">Gedruckt: ${ts}</div>
  <div class="hr"></div>
  <div style="font-size:11px;margin-bottom:6px;">
    ${details.name    ? `<div class="row"><span class="b">Kunde</span><span>${details.name}</span></div>` : ''}
    ${details.phone   ? `<div class="row"><span class="b">Tel</span><span>${details.phone}</span></div>` : ''}
    ${details.date    ? `<div class="row"><span class="b">Datum</span><span>${details.date}${details.time ? ' ' + details.time + ' Uhr' : ''}</span></div>` : ''}
    ${details.address ? `<div style="margin-top:3px;"><span class="b">Adresse: </span>${details.address}</div>` : ''}
    ${details.notes   ? `<div style="margin-top:3px;"><span class="b">Notiz: </span>${details.notes}</div>` : ''}
  </div>
  <div class="hr"></div>
  <div style="margin-bottom:6px;">${rows}</div>
  <div class="hr"></div>
  <div class="row b" style="font-size:15px;margin-bottom:4px;">
    <span>GESAMT</span><span>${fmt(total)}</span>
  </div>
  <div class="row" style="font-size:10px;color:#666;margin-bottom:8px;">
    <span>inkl. 19% MwSt.</span>
    <span>${fmt(total / 1.19)} + ${fmt(total - total / 1.19)}</span>
  </div>
  <div class="hr"></div>
  <div class="c" style="font-size:10px;color:#666;margin-top:4px;">
    Vielen Dank! · chefaboudkueche.de
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=420,height=680,scrollbars=yes');
  if (!win) { alert('Bitte Popups erlauben.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}

/* ── PIN gate ────────────────────────────────────────────────────────────── */
function PINGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin,   setPin]   = useState('');
  const [shake, setShake] = useState(false);

  const digit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === ADMIN_PIN) { onSuccess(); }
      else { setShake(true); setTimeout(() => { setPin(''); setShake(false); }, 650); }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: G.bg }}>
      <motion.div
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '320px', padding: '0 24px', textAlign: 'center' }}
      >
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: G.gold, fontWeight: 700, marginBottom: '8px' }}>
          Chef Aboud Küche
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontStyle: 'italic', color: G.text, marginBottom: '6px' }}>
          Mitarbeiter-Zugang
        </h1>
        <p style={{ fontSize: '11px', color: G.muted, marginBottom: '40px', fontFamily: "'Jost', sans-serif" }}>
          PIN eingeben
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '14px', height: '14px', borderRadius: '50%', transition: 'all 0.15s',
              background: i < pin.length ? (shake ? G.red : G.gold) : 'rgba(247,242,235,0.12)',
              transform: i < pin.length ? 'scale(1.3)' : 'scale(1)',
            }} />
          ))}
        </div>

        {/* Numpad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button key={i} onClick={() => { if (d === '⌫') setPin(p => p.slice(0,-1)); else if (d) digit(d); }}
              disabled={!d}
              style={{
                height: '68px', borderRadius: '16px', fontSize: '22px', fontWeight: 300,
                fontFamily: "'Cormorant Garamond', serif", cursor: d ? 'pointer' : 'default',
                background: d ? G.surf : 'transparent',
                border: d ? `1px solid ${G.border}` : 'none',
                color: G.text, visibility: d ? 'visible' : 'hidden',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => d && ((e.currentTarget as HTMLElement).style.background = G.goldBg)}
              onMouseLeave={e => d && ((e.currentTarget as HTMLElement).style.background = G.surf)}
            >
              {d}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main POS ────────────────────────────────────────────────────────────── */
export default function AdminPOS() {
  const t      = useTranslations('MenuExplorer');
  const locale = useLocale();

  const [unlocked,   setUnlocked]   = useState(false);
  const [activeSection, setActiveSection] = useState(MENU_DATA[0].categoryKey);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [details,    setDetails]    = useState<CustomerDetails>({ name: '', phone: '', address: '', date: '', time: '', notes: '' });
  const [tab,        setTab]        = useState<MobileTab>('details');

  const currentSection = MENU_DATA.find(s => s.categoryKey === activeSection)!;
  const total      = orderItems.reduce((s, o) => s + o.item.price * o.qty, 0);
  const totalItems = orderItems.reduce((s, o) => s + o.qty, 0);

  const getQty = useCallback((id: string) => orderItems.find(o => o.item.id === id)?.qty ?? 0, [orderItems]);

  const addItem = useCallback((item: MenuItem) => {
    const name = t(item.nameKey as any);
    setOrderItems(prev => {
      const found = prev.find(o => o.item.id === item.id);
      if (found) return prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + 1 } : o);
      return [...prev, { item, name, qty: 1 }];
    });
  }, [t]);

  const updateQty = useCallback((id: string, delta: number) => {
    setOrderItems(prev => prev.map(o => o.item.id === id ? { ...o, qty: o.qty + delta } : o).filter(o => o.qty > 0));
  }, []);

  const clearOrder = () => {
    setOrderItems([]);
    setDetails({ name: '', phone: '', address: '', date: '', time: '', notes: '' });
    setTab('details');
  };

  const canPrint = orderItems.length > 0 && !!details.name && !!details.phone && !!details.address;

  if (!unlocked) return <PINGate onSuccess={() => setUnlocked(true)} />;

  /* ── Panels ── */

  const DetailForm = (
    <div style={{ padding: '20px 16px', overflowY: 'auto', height: '100%' }}>
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.38em', textTransform: 'uppercase', color: G.gold, fontWeight: 700, marginBottom: '20px' }}>
        Kundendaten
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {([
          { key: 'name',    label: 'Name *',       Icon: User,        type: 'text', placeholder: 'Kundenname' },
          { key: 'phone',   label: 'Telefon',      Icon: Phone,       type: 'tel',  placeholder: '+49 …' },
          { key: 'address', label: 'Adresse',      Icon: MapPin,      type: 'text', placeholder: 'Lieferadresse' },
          { key: 'date',    label: 'Datum',        Icon: Calendar,    type: 'date', placeholder: '' },
          { key: 'time',    label: 'Uhrzeit',      Icon: Clock,       type: 'time', placeholder: '' },
          { key: 'notes',   label: 'Anmerkungen',  Icon: NotebookPen, type: 'text', placeholder: 'Besondere Wünsche…' },
        ] as const).map(({ key, label, Icon, type, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: G.muted, marginBottom: '5px' }}>
              {label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: G.surf, border: `1px solid ${key === 'name' && !details.name ? 'rgba(193,127,59,0.35)' : G.border}` }}>
              <Icon size={14} style={{ color: G.gold, flexShrink: 0 }} />
              <input
                type={type}
                placeholder={placeholder}
                value={details[key]}
                onChange={e => setDetails(p => ({ ...p, [key]: e.target.value }))}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: G.text, fontFamily: "'Jost', sans-serif", fontSize: '14px', minWidth: 0 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ItemBrowser = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Category tabs */}
      <div style={{ overflowX: 'auto', scrollbarWidth: 'none', borderBottom: `1px solid ${G.border}`, flexShrink: 0 } as React.CSSProperties}>
        <div style={{ display: 'inline-flex', padding: '0 12px' }}>
          {MENU_DATA.map(s => (
            <button key={s.categoryKey} onClick={() => setActiveSection(s.categoryKey)}
              style={{
                padding: '14px 14px', fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                color: activeSection === s.categoryKey ? G.gold : G.muted,
                borderBottom: `2px solid ${activeSection === s.categoryKey ? G.gold : 'transparent'}`,
                background: 'none', cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {t(s.categoryKey as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', scrollbarWidth: 'none' } as React.CSSProperties}>
        <AnimatePresence mode="wait">
          <motion.div key={activeSection}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}
          >
            {currentSection.items.map(item => {
              const qty = getQty(item.id);
              return (
                <motion.div key={item.id} whileTap={{ scale: 0.95 }}
                  onClick={() => addItem(item)}
                  style={{
                    borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    background: G.panel,
                    border: `1.5px solid ${qty > 0 ? G.gold : G.border}`,
                    boxShadow: qty > 0 ? `0 0 0 1px ${G.gold}, 0 4px 14px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                    <img src={item.image} alt="" loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: '8px 10px 10px' }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', fontStyle: 'italic', color: G.text, lineHeight: 1.25, marginBottom: '3px' }}>
                      {t(item.nameKey as any)}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: G.gold, fontWeight: 500 }}>
                      €{item.price}
                    </p>
                  </div>
                  {qty > 0 && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', background: G.gold, color: G.bg, fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Jost', sans-serif" }}>
                      {qty}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  const OrderPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Items list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', scrollbarWidth: 'none' } as React.CSSProperties}>
        {orderItems.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '48px' }}>
            <ShoppingBag size={36} style={{ color: 'rgba(247,242,235,0.08)', margin: '0 auto 10px' }} />
            <p style={{ color: 'rgba(247,242,235,0.18)', fontSize: '12px', fontFamily: "'Jost', sans-serif" }}>
              Noch keine Artikel hinzugefügt
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orderItems.map(({ item, name, qty }) => (
                <motion.div key={item.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: G.surf, border: `1px solid ${G.border}` }}>
                  <img src={item.image} alt="" loading="lazy"
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: `1px solid ${G.border}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '13px', color: G.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: G.gold, marginTop: '2px' }}>
                      €{(item.price * qty).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => updateQty(item.id, -1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${G.border}`, background: 'transparent', color: qty === 1 ? G.red : G.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {qty === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                    </button>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: G.text, minWidth: '22px', textAlign: 'center', fontFamily: "'Jost', sans-serif" }}>
                      {qty}
                    </span>
                    <button onClick={() => updateQty(item.id, 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${G.border}`, background: 'transparent', color: G.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      <Plus size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${G.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: G.muted }}>
            {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
          </span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', color: G.gold, lineHeight: 1 }}>
            €{total.toFixed(2)}
          </span>
        </div>

        {!canPrint && orderItems.length > 0 && (
          <p style={{ fontSize: '10px', color: G.gold, fontFamily: "'Jost', sans-serif", marginBottom: '8px', textAlign: 'center', opacity: 0.8 }}>
            {[!details.name && 'Name', !details.phone && 'Telefon', !details.address && 'Adresse'].filter(Boolean).join(', ')} erforderlich
          </p>
        )}

        <button onClick={() => openReceipt(details, orderItems, total)} disabled={!canPrint}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            background: canPrint ? G.gold : 'rgba(193,127,59,0.2)',
            color: canPrint ? G.bg : 'rgba(247,242,235,0.25)',
            fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: canPrint ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '8px', transition: 'all 0.15s',
          }}>
          <Printer size={15} />
          Bon drucken
        </button>

        <button onClick={clearOrder} disabled={orderItems.length === 0}
          style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: 'rgba(247,242,235,0.18)', fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: orderItems.length > 0 ? 'pointer' : 'default', transition: 'color 0.15s' }}
          onMouseEnter={e => { if (orderItems.length > 0) (e.currentTarget as HTMLElement).style.color = G.red; }}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(247,242,235,0.18)'}>
          Neue Bestellung
        </button>
      </div>
    </div>
  );

  const HEADER_H = 58;

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text }}>

      {/* ── Header ── */}
      <div style={{ height: `${HEADER_H}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: `1px solid ${G.border}`, background: G.panel, flexShrink: 0 }}>
        <div>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: G.gold, fontWeight: 700 }}>
            Chef Aboud Küche
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontStyle: 'italic', color: G.text, lineHeight: 1.1 }}>
            Catering Order
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => window.open(`/${locale}/gallery`, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: `1px solid rgba(193,127,59,0.28)`, background: G.goldBg, color: G.gold, fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <Images size={12} />
            Galerie
          </button>
          <button
            onClick={() => setUnlocked(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: `1px solid rgba(247,242,235,0.08)`, background: 'transparent', color: G.muted, fontFamily: "'Jost', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = G.red}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = G.muted}>
            <LogOut size={12} />
            Sperren
          </button>
        </div>
      </div>

      {/* ── Desktop / Tablet landscape: 3-column ── */}
      <div className="hidden md:flex" style={{ height: `calc(100vh - ${HEADER_H}px)` }}>

        {/* Column 1: Customer details */}
        <div style={{ width: '260px', flexShrink: 0, borderRight: `1px solid ${G.border}`, overflowY: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
          {DetailForm}
        </div>

        {/* Column 2: Item browser */}
        <div style={{ flex: 1, borderRight: `1px solid ${G.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {ItemBrowser}
        </div>

        {/* Column 3: Order */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: G.panel }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: G.gold, fontWeight: 700 }}>
              Bestellung
            </p>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {OrderPanel}
          </div>
        </div>
      </div>

      {/* ── Mobile: tab-based ── */}
      <div className="md:hidden flex flex-col" style={{ height: `calc(100vh - ${HEADER_H}px)` }}>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'details' && (
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
              {DetailForm}
            </div>
          )}
          {tab === 'menu' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {ItemBrowser}
            </div>
          )}
          {tab === 'order' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: G.panel }}>
              {OrderPanel}
            </div>
          )}
        </div>

        {/* Bottom tab bar */}
        <div style={{ borderTop: `1px solid ${G.border}`, background: G.panel, display: 'flex', flexShrink: 0 }}>
          {([
            { key: 'details' as MobileTab, label: 'Kunde',       Icon: User           },
            { key: 'menu'    as MobileTab, label: 'Speisekarte', Icon: UtensilsCrossed },
            { key: 'order'   as MobileTab, label: totalItems > 0 ? `Bestellung (${totalItems})` : 'Bestellung', Icon: ShoppingBag },
          ]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '12px 6px 14px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '5px', background: 'none', border: 'none',
                borderTop: `2px solid ${tab === key ? G.gold : 'transparent'}`,
                color: tab === key ? G.gold : G.muted,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <Icon size={20} />
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
