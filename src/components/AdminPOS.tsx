'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Printer, User, MapPin, Calendar, Clock, Trash2, LogOut, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MENU_DATA } from '@/data/menu';
import type { MenuItem } from '@/data/menu';

// ── Change this PIN to whatever Abdulla wants ──────────────────────────────
const ADMIN_PIN = '1234';

interface OrderItem {
  item: MenuItem;
  name: string; // resolved translation at add-time
  qty: number;
}

interface CustomerDetails {
  name: string;
  address: string;
  date: string;
  time: string;
  notes: string;
}

// ── PIN Gate ──────────────────────────────────────────────────────────────

function PINGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin,   setPin]   = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        onSuccess();
      } else {
        setShake(true);
        setTimeout(() => { setPin(''); setShake(false); }, 700);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0c0803' }}>
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs px-6 space-y-10 text-center"
      >
        <div>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#c17f3b', fontWeight: 700, marginBottom: '8px' }}>
            Chef Aboud Küche
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', fontStyle: 'italic', color: '#f7f2eb' }}>
            Staff Access
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(247,242,235,0.3)', marginTop: '6px', fontFamily: "'Jost', sans-serif" }}>
            Enter your PIN to continue
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all duration-150"
              style={{
                background: i < pin.length ? (shake ? '#ef4444' : '#c17f3b') : 'rgba(247,242,235,0.12)',
                transform: i < pin.length ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (d === '⌫') handleDelete();
                else if (d) handleDigit(d);
              }}
              disabled={!d}
              className="h-16 rounded-2xl text-xl font-light transition-all active:scale-90 disabled:invisible"
              style={{
                background: d ? 'rgba(247,242,235,0.06)' : 'transparent',
                border: d ? '1px solid rgba(193,127,59,0.12)' : 'none',
                color: '#f7f2eb',
                fontFamily: "'Cormorant Garamond', serif",
                cursor: d ? 'pointer' : 'default',
              }}
              onMouseEnter={e => d && ((e.currentTarget as HTMLElement).style.background = 'rgba(193,127,59,0.1)')}
              onMouseLeave={e => d && ((e.currentTarget as HTMLElement).style.background = 'rgba(247,242,235,0.06)')}
            >
              {d}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main POS ──────────────────────────────────────────────────────────────

export default function AdminPOS() {
  const t = useTranslations('MenuExplorer');

  const [unlocked,      setUnlocked]      = useState(false);
  const [activeSection, setActiveSection] = useState(MENU_DATA[0].categoryKey);
  const [orderItems,    setOrderItems]    = useState<OrderItem[]>([]);
  const [details,       setDetails]       = useState<CustomerDetails>({ name: '', address: '', date: '', time: '', notes: '' });

  const currentSection = MENU_DATA.find(s => s.categoryKey === activeSection)!;
  const total      = orderItems.reduce((sum, oi) => sum + oi.item.price * oi.qty, 0);
  const totalItems = orderItems.reduce((sum, oi) => sum + oi.qty, 0);

  const getItemQty = useCallback((id: string) =>
    orderItems.find(o => o.item.id === id)?.qty ?? 0,
  [orderItems]);

  const addItem = useCallback((item: MenuItem) => {
    const name = t(item.nameKey as any);
    setOrderItems(prev => {
      const existing = prev.find(o => o.item.id === item.id);
      if (existing) return prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + 1 } : o);
      return [...prev, { item, name, qty: 1 }];
    });
  }, [t]);

  const updateQty = useCallback((id: string, delta: number) => {
    setOrderItems(prev => prev.map(o => o.item.id === id ? { ...o, qty: o.qty + delta } : o).filter(o => o.qty > 0));
  }, []);

  const clearOrder = () => {
    setOrderItems([]);
    setDetails({ name: '', address: '', date: '', time: '', notes: '' });
  };

  const handlePrint = () => window.print();

  if (!unlocked) return <PINGate onSuccess={() => setUnlocked(true)} />;

  const printDate = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* ── Print Styles ─────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #pos-receipt, #pos-receipt * { visibility: visible !important; }
          #pos-receipt {
            position: fixed !important;
            inset: 0 !important;
            width: 80mm !important;
            margin: 0 auto !important;
            padding: 6mm 4mm !important;
            font-family: 'Courier New', monospace !important;
            font-size: 12px !important;
            color: #000 !important;
            background: #fff !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>

      {/* ── Hidden receipt rendered into DOM, shown only on print ─────── */}
      <div id="pos-receipt" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>CHEF ABOUD KÜCHE</div>
          <div style={{ fontSize: '11px' }}>Thielallee 34, 14195 Berlin</div>
          <div style={{ fontSize: '11px' }}>+49 176 066 6501</div>
          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
          <div style={{ fontSize: '10px', color: '#555' }}>CATERING ORDER</div>
        </div>

        {/* Customer info */}
        <div style={{ marginBottom: '8px', fontSize: '11px' }}>
          {details.name    && <div><b>Kunde:</b> {details.name}</div>}
          {details.address && <div><b>Adresse:</b> {details.address}</div>}
          {details.date    && <div><b>Datum:</b> {details.date}{details.time ? ` ${details.time}` : ''}</div>}
          {details.notes   && <div><b>Notiz:</b> {details.notes}</div>}
        </div>
        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        {/* Items */}
        <div style={{ fontSize: '11px', marginBottom: '8px' }}>
          {orderItems.map(({ name, item, qty }) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{qty}× {name}</span>
              <span>€{(item.price * qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
          <span>GESAMT</span>
          <span>€{total.toFixed(2)}</span>
        </div>

        <div style={{ textAlign: 'center', fontSize: '10px', borderTop: '1px dashed #000', paddingTop: '6px', color: '#555' }}>
          Gedruckt: {printDate}
        </div>
      </div>

      {/* ── Main POS UI ───────────────────────────────────────────────── */}
      <div className="min-h-screen flex flex-col" style={{ background: '#0c0803', color: '#f7f2eb' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3" style={{ borderBottom: '1px solid rgba(193,127,59,0.15)', background: '#0f0b07' }}>
          <div>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c17f3b', fontWeight: 700 }}>
              Chef Aboud Küche
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontStyle: 'italic', color: '#f7f2eb', lineHeight: 1.1 }}>
              Catering Order
            </h1>
          </div>
          <button
            onClick={() => setUnlocked(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors"
            style={{ color: 'rgba(247,242,235,0.3)', border: '1px solid rgba(247,242,235,0.08)', fontSize: '9px', fontFamily: "'Jost', sans-serif", fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(247,242,235,0.3)'}
          >
            <LogOut size={12} />
            Lock
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>

          {/* ── LEFT: Item Browser ─────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(193,127,59,0.1)' }}>

            {/* Category tabs */}
            <div
              className="flex overflow-x-auto shrink-0 px-4"
              style={{ borderBottom: '1px solid rgba(193,127,59,0.08)', scrollbarWidth: 'none' } as React.CSSProperties}
            >
              {MENU_DATA.map(s => (
                <button
                  key={s.categoryKey}
                  onClick={() => setActiveSection(s.categoryKey)}
                  style={{
                    fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: activeSection === s.categoryKey ? '#c17f3b' : 'rgba(247,242,235,0.3)',
                    borderBottom: activeSection === s.categoryKey ? '2px solid #c17f3b' : '2px solid transparent',
                    padding: '12px 14px', whiteSpace: 'nowrap', flexShrink: 0,
                    background: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {t(s.categoryKey as any)}
                </button>
              ))}
            </div>

            {/* Item grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                >
                  {currentSection.items.map(item => {
                    const qty = getItemQty(item.id);
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => addItem(item)}
                        whileTap={{ scale: 0.95 }}
                        className="relative rounded-xl p-3 text-left transition-all"
                        style={{
                          background: qty > 0 ? 'rgba(193,127,59,0.1)' : 'rgba(247,242,235,0.04)',
                          border: qty > 0 ? '1px solid rgba(193,127,59,0.35)' : '1px solid rgba(247,242,235,0.07)',
                        }}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-2" style={{ background: '#14110d' }}>
                          <img src={item.image} alt="" loading="lazy" className="w-full h-full object-cover opacity-85" />
                        </div>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '12px', fontStyle: 'italic', color: '#f7f2eb', lineHeight: 1.2, marginBottom: '2px' }}>
                          {t(item.nameKey as any)}
                        </p>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', color: '#c17f3b' }}>
                          €{item.price}
                        </p>
                        {qty > 0 && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#c17f3b', color: '#0c0803' }}>
                            {qty}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT: Order Panel ─────────────────────────────────────── */}
          <div className="w-full lg:w-[360px] shrink-0 flex flex-col" style={{ background: '#0f0b07' }}>

            {/* Customer details form */}
            <div className="p-4 space-y-2 shrink-0" style={{ borderBottom: '1px solid rgba(193,127,59,0.1)' }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c17f3b', fontWeight: 700, marginBottom: '10px' }}>
                Customer Details
              </p>
              {([
                { key: 'name',    placeholder: 'Customer Name',      Icon: User,     type: 'text'  },
                { key: 'address', placeholder: 'Delivery Address',   Icon: MapPin,   type: 'text'  },
                { key: 'date',    placeholder: 'Delivery Date',      Icon: Calendar, type: 'date'  },
                { key: 'time',    placeholder: 'Delivery Time',      Icon: Clock,    type: 'time'  },
                { key: 'notes',   placeholder: 'Special instructions...', Icon: null, type: 'text' },
              ] as const).map(({ key, placeholder, Icon, type }) => (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(247,242,235,0.04)', border: '1px solid rgba(193,127,59,0.1)' }}
                >
                  {Icon && <Icon size={11} style={{ color: 'rgba(193,127,59,0.55)', flexShrink: 0 }} />}
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={details[key as keyof CustomerDetails]}
                    onChange={e => setDetails(prev => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 bg-transparent outline-none"
                    style={{ color: '#f7f2eb', fontFamily: "'Jost', sans-serif", fontSize: '11px' }}
                  />
                </div>
              ))}
            </div>

            {/* Order items list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {orderItems.length === 0 ? (
                <p className="text-center py-10" style={{ color: 'rgba(247,242,235,0.18)', fontSize: '11px', fontFamily: "'Jost', sans-serif" }}>
                  Tap items from the menu to add them
                </p>
              ) : (
                orderItems.map(({ item, name, qty }) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 py-1"
                  >
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '12px', color: '#f7f2eb', lineHeight: 1.2 }}>
                        {name}
                      </p>
                      <p style={{ fontSize: '11px', color: '#c17f3b', fontFamily: "'Cormorant Garamond', serif" }}>
                        €{(item.price * qty).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(247,242,235,0.07)', border: '1px solid rgba(247,242,235,0.1)', color: '#f7f2eb' }}
                      >
                        {qty === 1 ? <Trash2 size={9} /> : <Minus size={9} />}
                      </button>
                      <span style={{ fontSize: '12px', color: '#f7f2eb', width: '16px', textAlign: 'center', fontFamily: "'Jost', sans-serif", fontWeight: 700 }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(247,242,235,0.07)', border: '1px solid rgba(247,242,235,0.1)', color: '#f7f2eb' }}
                      >
                        <Plus size={9} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer: total + print */}
            <div className="p-4 space-y-3 shrink-0" style={{ borderTop: '1px solid rgba(193,127,59,0.15)' }}>
              <div className="flex justify-between items-baseline">
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(247,242,235,0.3)' }}>
                  Total · {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: '#c17f3b' }}>
                  €{total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handlePrint}
                disabled={orderItems.length === 0}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-98"
                style={{ background: '#c17f3b', color: '#0c0803', fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                <Printer size={14} />
                Print Receipt
              </button>

              <button
                onClick={clearOrder}
                disabled={orderItems.length === 0}
                className="w-full py-2 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30"
                style={{ color: 'rgba(247,242,235,0.22)', fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(247,242,235,0.22)'}
              >
                <RefreshCw size={10} />
                Clear Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
