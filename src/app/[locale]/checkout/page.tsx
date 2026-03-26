'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCart, CartItem } from '@/context/CartContext';
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  Calendar,
  Clock,
  Utensils,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const T = {
  bg:         '#0c0803',
  surface:    '#130e07',
  surfaceAlt: 'rgba(247,242,235,0.04)',
  border:     'rgba(196,148,72,0.14)',
  borderSub:  'rgba(247,242,235,0.07)',
  cream:      '#f7f2eb',
  creamMid:   'rgba(247,242,235,0.55)',
  creamLow:   'rgba(247,242,235,0.3)',
  creamFaint: 'rgba(247,242,235,0.08)',
  gold:       '#c49448',
  goldDim:    '#c17f3b',
  red:        'rgba(239,68,68,0.9)',
  redBg:      'rgba(239,68,68,0.08)',
  redBorder:  'rgba(239,68,68,0.2)',
  stripe:     '#635bff',
  paypal:     '#009cde',
  paypalDark: '#003087',
};

type PaymentMethod = 'stripe' | 'paypal' | 'cod';
type OrderStatus   = 'idle' | 'processing' | 'success' | 'error';

interface FormData {
  fullName: string; phone: string; date: string; time: string; address: string;
}
interface FormErrors {
  fullName?: string; phone?: string; date?: string; time?: string; address?: string;
}

// ─────────────────────────────────────────────
// PayPal SVG
// ─────────────────────────────────────────────
const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <path d="M19.554 6.253c.302-1.97-.002-3.312-1.046-4.527C17.336.338 15.294 0 12.686 0H5.167a.935.935 0 0 0-.924.79L1.05 19.803a.562.562 0 0 0 .555.65h4.044l-.27 1.71a.491.491 0 0 0 .485.568h3.409c.406 0 .75-.295.814-.695l.034-.173.645-4.098.042-.226a.822.822 0 0 1 .812-.695h.512c3.312 0 5.903-1.346 6.664-5.24.317-1.627.153-2.986-.685-3.943a3.27 3.27 0 0 0-.937-.708z" fill="#009cde" />
    <path d="M19.554 6.253a6.74 6.74 0 0 0-.834-.184 10.63 10.63 0 0 0-1.688-.124H12.16a.82.82 0 0 0-.812.695L10.27 14.33l-.038.24a.935.935 0 0 1 .924-.79h1.924c3.782 0 6.742-1.537 7.608-5.984.026-.132.048-.261.067-.387a4.8 4.8 0 0 0-.735-.337 5.39 5.39 0 0 0-.466-.12z" fill="#012169" />
    <path d="M11.348 6.64a.82.82 0 0 1 .812-.695h5.872c.695 0 1.344.046 1.937.141a6.74 6.74 0 0 1 .834.184l.197.065c.26.09.502.196.735.337.267-1.703-.002-2.862-.922-3.913C19.763.338 17.72 0 15.113 0H7.594a.935.935 0 0 0-.924.79L3.477 19.803a.562.562 0 0 0 .555.65h4.045l1.016-6.444L11.348 6.64z" fill="#003087" />
  </svg>
);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const inputBase = (hasError: boolean, extra = '') =>
  `w-full rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all ${extra}` +
  ` border ${hasError ? 'border-red-500/40 ring-1 ring-red-500/30' : 'border-[rgba(196,148,72,0.14)]'}` +
  ` bg-[rgba(247,242,235,0.04)] text-[#f7f2eb] placeholder-[rgba(247,242,235,0.2)]` +
  ` focus:ring-1 focus:ring-[#c49448] focus:border-[#c49448]`;

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ color: T.creamLow, fontSize:'9px', fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', display:'block' }}>
    {children}
  </label>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="flex items-center gap-1" style={{ fontSize:'10px', color: T.red }}>
      <AlertCircle size={10} /> {msg}
    </p>
  ) : null;

// ─────────────────────────────────────────────
// Stripe fields
// ─────────────────────────────────────────────
const StripeCardFields = ({ isRTL }: { isRTL: boolean }) => {
  const [cardNum,  setCardNum]  = useState('');
  const [expiry,   setExpiry]   = useState('');
  const [cvc,      setCvc]      = useState('');
  const [cardName, setCardName] = useState('');

  const formatCard   = (v: string) => v.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length>=3?d.slice(0,2)+'/'+d.slice(2):d; };

  const label = (text: string) => (
    <label style={{ color: T.creamLow, fontSize:'9px', fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase' }}>{text}</label>
  );

  return (
    <motion.div key="stripe-fields" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }} className="space-y-4 mt-5">
      <div className="space-y-2">
        {label('Card Number')}
        <div className="relative">
          <input type="text" inputMode="numeric" value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))}
            placeholder="0000 0000 0000 0000"
            className={inputBase(false, `font-mono tracking-wider ${isRTL?'pr-5 pl-16':'pl-5 pr-16'}`)} />
          <div className={`absolute ${isRTL?'left-4':'right-4'} top-1/2 -translate-y-1/2 flex gap-1`}>
            <span style={{ fontSize:'7px', background:'rgba(247,242,235,0.08)', color:T.creamMid, padding:'2px 5px', borderRadius:3, fontWeight:700 }}>VISA</span>
            <span style={{ fontSize:'7px', background:'rgba(247,242,235,0.08)', color:T.creamMid, padding:'2px 5px', borderRadius:3, fontWeight:700 }}>MC</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {label('Cardholder Name')}
        <input type="text" value={cardName} onChange={e=>setCardName(e.target.value)}
          placeholder="Name as on card" className={inputBase(false)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {label('Expiry')}
          <input type="text" inputMode="numeric" value={expiry} onChange={e=>setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY" className={inputBase(false, 'font-mono')} />
        </div>
        <div className="space-y-2">
          {label('CVC')}
          <input type="text" inputMode="numeric" value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,'').slice(0,4))}
            placeholder="•••" className={inputBase(false, 'font-mono')} />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1" style={{ color:T.creamLow, fontSize:'9px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase' }}>
        <ShieldCheck size={12} style={{ color: T.stripe }} />
        Secured by <span style={{ color: T.stripe, fontWeight:900 }}>Stripe</span>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// PayPal fields
// ─────────────────────────────────────────────
const PayPalFields = () => (
  <motion.div key="paypal-fields" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }}
    className="mt-5 rounded-3xl p-5 text-center space-y-4"
    style={{ border:`1px solid rgba(0,156,222,0.2)`, background:'rgba(0,156,222,0.06)' }}>
    <div className="flex justify-center">
      <div className="rounded-2xl px-6 py-3 shadow-sm inline-flex items-center gap-2"
        style={{ background: T.surface, border:`1px solid ${T.border}` }}>
        <PayPalIcon />
        <span style={{ fontWeight:700, color: T.paypalDark, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>PayPal</span>
      </div>
    </div>
    <p style={{ fontSize:'11px', color: T.creamMid, lineHeight:1.6 }}>
      You'll be redirected to PayPal to complete your payment securely.
    </p>
    <div className="flex items-center justify-center gap-2"
      style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.2em', color: T.paypal, fontWeight:700 }}>
      <ShieldCheck size={12} /> Buyer Protection Included
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────
// COD fields
// ─────────────────────────────────────────────
const CODFields = () => (
  <motion.div key="cod-fields" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }}
    className="mt-5 rounded-3xl p-5 space-y-3"
    style={{ border:`1px solid ${T.borderSub}`, background: T.surfaceAlt }}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: T.creamFaint, border:`1px solid ${T.borderSub}` }}>
        <Truck size={18} style={{ color: T.creamMid }} />
      </div>
      <div>
        <p style={{ fontSize:'13px', fontWeight:700, color: T.cream }}>Pay when your order arrives</p>
        <p style={{ fontSize:'10px', color: T.creamLow }}>Have the exact amount ready for the courier</p>
      </div>
    </div>
    <div className="pt-3 flex flex-col gap-2" style={{ borderTop:`1px solid ${T.borderSub}` }}>
      {['No card or account needed','Available for orders in the delivery zone','Exact change preferred'].map(note=>(
        <div key={note} className="flex items-center gap-2" style={{ fontSize:'11px', color: T.creamMid }}>
          <CheckCircle2 size={12} style={{ color:'#4ade80', flexShrink:0 }} /> {note}
        </div>
      ))}
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────
// Success Overlay
// ─────────────────────────────────────────────
const SuccessOverlay = ({ isCatering, paymentMethod }: { isCatering:boolean; paymentMethod:PaymentMethod }) => (
  <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{ background:'rgba(12,8,3,0.92)', backdropFilter:'blur(16px)' }}>
    <div className="rounded-4xl p-8 sm:p-12 max-w-md w-full text-center space-y-6"
      style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow:'0 40px 80px rgba(0,0,0,0.7)' }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
        transition={{ type:'spring', stiffness:260, damping:20, delay:0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
        style={{ background:'rgba(74,222,128,0.1)', border:'2px solid rgba(74,222,128,0.3)' }}>
        <CheckCircle2 size={36} style={{ color:'#4ade80' }} />
      </motion.div>
      <div className="space-y-2">
        <h2 className="font-serif italic text-3xl" style={{ color: T.cream }}>
          {isCatering ? 'Booking Requested!' : 'Order Placed!'}
        </h2>
        <p style={{ fontSize:'13px', color: T.creamMid, lineHeight:1.6 }}>
          {paymentMethod==='paypal'
            ? 'Redirecting you to PayPal to complete your payment…'
            : paymentMethod==='cod'
            ? 'Your order is confirmed. Please have payment ready on delivery.'
            : 'Payment successful. Your order is now being prepared.'}
        </p>
      </div>
      <p style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.25em', color: T.creamLow, fontWeight:700 }}>
        Confirmation sent to your phone
      </p>
      <Link href="/"
        className="inline-block mt-2"
        style={{ color: T.gold, fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.25em', fontWeight:700, borderBottom:`1px solid ${T.gold}`, paddingBottom:'2px' }}>
        Back to Home
      </Link>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────
// Mobile Order Summary (collapsible)
// ─────────────────────────────────────────────
const MobileOrderSummary = ({
  cart, isCatering, isRTL, formatPrice, getDisplayName, subtotal, deliveryFee, total, c,
}: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: T.surface, border:`1px solid ${T.border}` }}>
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="font-serif italic text-base" style={{ color: T.cream }}>
            {isCatering ? c('eventSummary') : c('orderSummary')}
          </span>
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background:'rgba(196,148,72,0.15)', color: T.gold }}>
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold" style={{ color: T.gold, fontSize:'1.2rem' }}>
            {formatPrice(total)}
          </span>
          {open ? <ChevronUp size={16} style={{ color: T.creamLow }} /> : <ChevronDown size={16} style={{ color: T.creamLow }} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="summary-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 space-y-5" style={{ borderTop: `1px solid ${T.borderSub}` }}>
              {/* Items */}
              <div className="space-y-4 pt-4 max-h-[40vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                        style={{ background:'rgba(247,242,235,0.06)', border:`1px solid ${T.borderSub}` }}>
                        <img src={item.img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="grow min-w-0">
                        <h5 className="text-sm font-bold truncate" style={{ color: T.cream }}>
                          {getDisplayName(item.nameKey)}
                        </h5>
                        <p className="text-xs italic" style={{ color: T.creamLow }}>
                          {isCatering && item.guestCount ? `${item.guestCount} guests` : `qty: ${item.qty}`}
                        </p>
                      </div>
                      <span className="font-serif font-bold shrink-0" style={{ color: T.cream, fontSize:'13px' }}>
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                    {isCatering && item.customDetails && (
                      <div className="ml-10 p-3 rounded-xl space-y-2"
                        style={{ background: T.surfaceAlt, border:`1px solid ${T.borderSub}` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Utensils size={10} style={{ color: T.gold }} />
                          <p style={{ fontSize:'8px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color: T.creamLow }}>
                            {c('selectedDishes')}
                          </p>
                        </div>
                        {item.customDetails.map((dish: any, idx: number) => (
                          <div key={idx} className="flex justify-between pb-1 last:pb-0"
                            style={{ fontSize:'11px', color: T.creamMid, borderBottom:`1px solid ${T.borderSub}` }}>
                            <span>{dish.name}</span>
                            <span style={{ fontWeight:700, color: T.cream }}>×{dish.qty}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-4 space-y-3" style={{ borderTop:`1px solid ${T.borderSub}` }}>
                <div className="flex justify-between"
                  style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.2em', color: T.creamLow }}>
                  <span>{c('subtotal')}</span>
                  <span style={{ color: T.cream }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between"
                  style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.2em', color: T.creamLow }}>
                  <span>{isCatering ? c('serviceFee') : c('delivery')}</span>
                  <span style={{ color: T.cream }}>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-3" style={{ borderTop:`1px solid ${T.borderSub}` }}>
                  <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color: T.creamMid }}>
                    {c('total')}
                  </span>
                  <span className="font-serif font-bold" style={{ fontSize:'2rem', color: T.gold, lineHeight:1 }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function CheckoutPage() {
  const t    = useTranslations('Menu');
  const d    = useTranslations('Dishes');
  const c    = useTranslations('Checkout');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { cart, cartCount } = useCart();

  const isCatering = searchParams.get('type') === 'catering';
  const isRTL      = locale === 'ar';
  const symbol     = t('currencySymbol');
  const pos        = t('currencyPos');

  const formatPrice = (n: number) => {
    const v = n.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 });
    return pos==='prefix' ? `${symbol}${v}` : `${v} ${symbol}`;
  };

  const subtotal    = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const deliveryFee = subtotal > 0 ? (isCatering ? 50 : 5) : 0;
  const total       = subtotal + deliveryFee;

  const getDisplayName = (key: string) => {
    if (key.startsWith('dish') || key.startsWith('cat')) { try { return d(key); } catch {} }
    try { return d(`${key}.name`); } catch { return key; }
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [orderStatus,   setOrderStatus]   = useState<OrderStatus>('idle');
  const [formData,      setFormData]      = useState<FormData>({ fullName:'', phone:'', date:'', time:'', address:'' });
  const [errors,        setErrors]        = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    if (!formData.phone.trim())    e.phone    = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(formData.phone)) e.phone = 'Enter a valid phone number';
    if (!formData.date)            e.date     = 'Date is required';
    if (!formData.time)            e.time     = 'Time is required';
    if (!formData.address.trim())  e.address  = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setOrderStatus('processing');
    try {
      await new Promise(r => setTimeout(r, paymentMethod==='stripe'?2000:paymentMethod==='paypal'?1500:1000));
      setOrderStatus('success');
    } catch { setOrderStatus('error'); }
  };

  if (cartCount === 0 && !isCatering) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: T.bg }}>
        <h2 className="font-serif italic text-4xl mb-4" style={{ color: T.cream }}>{t('emptyCart')}</h2>
        <Link href="/menu" style={{ color: T.gold, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:700, borderBottom:`1px solid ${T.gold}`, paddingBottom:'2px' }}>
          {t('filterAll')}
        </Link>
      </div>
    );
  }

  const paymentOptions = [
    { id: 'stripe' as PaymentMethod, label: 'Card',    icon: <CreditCard size={18} />, activeBorder: T.stripe,   activeText: T.stripe },
    { id: 'paypal' as PaymentMethod, label: 'PayPal',  icon: <PayPalIcon />,           activeBorder: T.paypal,   activeText: T.paypalDark },
    { id: 'cod'    as PaymentMethod, label: c('cashOnDelivery'), icon: <Truck size={18} />, activeBorder: T.creamMid, activeText: T.cream },
  ];

  const ctaLabel = () => {
    if (orderStatus === 'processing') return '';
    if (isCatering)                   return c('requestBooking');
    if (paymentMethod === 'paypal')   return 'Continue to PayPal';
    if (paymentMethod === 'cod')      return 'Place Order';
    return c('completeOrder');
  };

  const IconInput = ({ icon, error, children }: { icon: React.ReactNode; error?: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="relative">
        <span className={`absolute ${isRTL?'right-5':'left-5'} top-1/2 -translate-y-1/2`} style={{ color: T.creamLow }}>{icon}</span>
        {children}
      </div>
      <FieldError msg={error} />
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {orderStatus === 'success' && <SuccessOverlay isCatering={isCatering} paymentMethod={paymentMethod} />}
      </AnimatePresence>

      {/* Noise grain */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity:0.03, mixBlendMode:'overlay',
      }} aria-hidden="true" />

      <div className="relative z-10 min-h-screen pt-24 sm:pt-32 pb-32 sm:pb-20 px-4 sm:px-6 md:px-8"
        style={{ backgroundColor: T.bg }}
        dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto">

          {/* Back link */}
          <Link href={isCatering?'/catering':'/menu'}
            className="inline-flex items-center gap-2 mb-8 transition-colors"
            style={{ color: T.creamLow, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.25em', fontWeight:700 }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=T.cream}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=T.creamLow}>
            <ArrowLeft size={14} className={isRTL?'rotate-180':''} />
            {c('back')}
          </Link>

          {/* Page title */}
          <div className="mb-8 space-y-1">
            <span style={{ color: T.goldDim, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:700 }}>
              {isCatering ? c('cateringBadge') : c('deliveryBadge')}
            </span>
            <h1 className="font-serif italic" style={{ fontSize:'clamp(2rem,6vw,3.2rem)', color: T.cream, lineHeight:1.05 }}>
              {isCatering ? c('eventDetails') : c('checkoutTitle')}
            </h1>
          </div>

          {/* ── MOBILE: Order summary (collapsible) — shown above form ── */}
          <div className="lg:hidden mb-6">
            <MobileOrderSummary
              cart={cart} isCatering={isCatering} isRTL={isRTL}
              formatPrice={formatPrice} getDisplayName={getDisplayName}
              subtotal={subtotal} deliveryFee={deliveryFee} total={total} c={c}
            />
          </div>

          {/* ── TWO-COLUMN on lg+ ── */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">

            {/* LEFT: Form */}
            <div className="lg:col-span-7 space-y-10">

              {/* Contact & Delivery */}
              <section className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <FieldLabel>{c('fullName')}</FieldLabel>
                    <input type="text" value={formData.fullName} onChange={e=>handleChange('fullName',e.target.value)}
                      placeholder="Enter name" className={inputBase(!!errors.fullName)} />
                    <FieldError msg={errors.fullName} />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <FieldLabel>{c('phone')}</FieldLabel>
                    <input type="tel" value={formData.phone} onChange={e=>handleChange('phone',e.target.value)}
                      placeholder="+49..." className={inputBase(!!errors.phone)} />
                    <FieldError msg={errors.phone} />
                  </div>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldLabel>{c('date')}</FieldLabel>
                    <IconInput icon={<Calendar size={16}/>} error={errors.date}>
                      <input type="date" value={formData.date} onChange={e=>handleChange('date',e.target.value)}
                        className={inputBase(!!errors.date, isRTL?'pr-12 pl-5':'pl-12 pr-5')} />
                    </IconInput>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>{c('time')}</FieldLabel>
                    <IconInput icon={<Clock size={16}/>} error={errors.time}>
                      <input type="time" value={formData.time} onChange={e=>handleChange('time',e.target.value)}
                        className={inputBase(!!errors.time, isRTL?'pr-12 pl-5':'pl-12 pr-5')} />
                    </IconInput>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <FieldLabel>{isCatering ? c('location') : c('address')}</FieldLabel>
                  <textarea rows={3} value={formData.address} onChange={e=>handleChange('address',e.target.value)}
                    placeholder="Detailed address..."
                    className={inputBase(!!errors.address, 'resize-none')} />
                  <FieldError msg={errors.address} />
                </div>
              </section>

              {/* Payment Method */}
              <section className="space-y-5">
                <h3 className="font-serif italic text-lg" style={{ color: T.cream }}>{c('paymentMethod')}</h3>

                {/* Payment tabs — full width on mobile */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {paymentOptions.map(opt => {
                    const active = paymentMethod === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={()=>setPaymentMethod(opt.id)}
                        className="relative flex flex-col items-center gap-2 px-2 sm:px-3 py-4 sm:py-5 rounded-2xl sm:rounded-3xl transition-all duration-200"
                        style={{
                          border: `2px solid ${active ? opt.activeBorder : T.borderSub}`,
                          background: active ? T.surface : T.surfaceAlt,
                          boxShadow: active ? `0 0 20px rgba(196,148,72,0.1)` : 'none',
                          color: active ? opt.activeText : T.creamLow,
                        }}>
                        {active && (
                          <motion.div layoutId="payment-indicator"
                            className="absolute inset-0 rounded-2xl sm:rounded-3xl -z-10"
                            style={{ background: T.surfaceAlt }} />
                        )}
                        <span style={{ opacity: active ? 1 : 0.45 }}>{opt.icon}</span>
                        <span style={{ fontSize:'7px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', textAlign:'center', lineHeight:1.3 }}>
                          {opt.label}
                        </span>
                        {active && (
                          <span className="absolute top-2 right-2">
                            <CheckCircle2 size={10} style={{ color: opt.activeBorder, opacity:0.8 }} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod==='stripe' && <StripeCardFields isRTL={isRTL} key="stripe" />}
                  {paymentMethod==='paypal' && <PayPalFields key="paypal" />}
                  {paymentMethod==='cod'    && <CODFields key="cod" />}
                </AnimatePresence>
              </section>

              {/* Error banner */}
              <AnimatePresence>
                {orderStatus==='error' && (
                  <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="flex items-start gap-3 rounded-2xl px-5 py-4"
                    style={{ background: T.redBg, border:`1px solid ${T.redBorder}` }}>
                    <AlertCircle size={16} style={{ color: T.red, flexShrink:0, marginTop:1 }} />
                    <p style={{ fontSize:'13px', color: T.red }}>
                      Something went wrong. Please try again or choose a different payment method.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA — inline on desktop, sticky on mobile */}
              <div className="hidden lg:block">
                <SubmitButton orderStatus={orderStatus} handleSubmit={handleSubmit} ctaLabel={ctaLabel} />
              </div>
            </div>

            {/* RIGHT: Desktop Order Summary */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-[40px] p-10 sticky top-32 space-y-8"
                style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>

                <h4 className="font-serif italic text-3xl" style={{ color: T.cream }}>
                  {isCatering ? c('eventSummary') : c('orderSummary')}
                </h4>

                <div className="space-y-6 max-h-[45vh] overflow-y-auto pr-1" style={{ scrollbarWidth:'thin' }}>
                  {cart.map((item: CartItem) => (
                    <div key={item.id} className="space-y-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0"
                          style={{ background:'rgba(247,242,235,0.06)', border:`1px solid ${T.borderSub}` }}>
                          <img src={item.img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="grow min-w-0">
                          <h5 className="text-sm font-bold truncate" style={{ color: T.cream }}>
                            {getDisplayName(item.nameKey)}
                          </h5>
                          <p className="text-xs italic" style={{ color: T.creamLow }}>
                            {isCatering && item.guestCount ? `${item.guestCount} guests` : `qty: ${item.qty}`}
                          </p>
                        </div>
                        <span className="font-serif font-bold shrink-0" style={{ color: T.cream, fontSize:'14px' }}>
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                      {isCatering && item.customDetails && (
                        <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                          className={`${isRTL?'mr-12':'ml-12'} p-4 rounded-2xl space-y-2`}
                          style={{ background: T.surfaceAlt, border:`1px solid ${T.borderSub}` }}>
                          <div className="flex items-center gap-2 mb-1">
                            <Utensils size={11} style={{ color: T.gold }} />
                            <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color: T.creamLow }}>
                              {c('selectedDishes')}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            {item.customDetails.map((dish: any, idx: number) => (
                              <div key={idx} className="flex justify-between pb-1.5 last:pb-0"
                                style={{ fontSize:'11px', color: T.creamMid, borderBottom:`1px solid ${T.borderSub}` }}>
                                <span>{dish.name}</span>
                                <span style={{ fontWeight:700, color: T.cream }}>×{dish.qty}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-6 space-y-4" style={{ borderTop:`1px solid ${T.borderSub}` }}>
                  <div className={`flex justify-between ${isRTL?'flex-row-reverse':''}`}
                    style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.2em', color: T.creamLow }}>
                    <span>{c('subtotal')}</span>
                    <span style={{ color: T.cream }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div className={`flex justify-between ${isRTL?'flex-row-reverse':''}`}
                    style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.2em', color: T.creamLow }}>
                    <span>{isCatering ? c('serviceFee') : c('delivery')}</span>
                    <span style={{ color: T.cream }}>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className={`flex justify-between items-baseline pt-4 ${isRTL?'flex-row-reverse':''}`}>
                    <span style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color: T.creamMid }}>
                      {c('total')}
                    </span>
                    <span className="font-serif font-bold" style={{ fontSize:'2.4rem', color: T.gold, lineHeight:1 }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Payment badge */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${isRTL?'flex-row-reverse':''}`}
                  style={{ background: T.surfaceAlt, border:`1px solid ${T.borderSub}` }}>
                  {paymentMethod==='stripe' && <CreditCard size={14} style={{ color: T.stripe }} />}
                  {paymentMethod==='paypal' && <PayPalIcon />}
                  {paymentMethod==='cod'    && <Truck size={14} style={{ color: T.creamMid }} />}
                  <span style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:700, color: T.creamLow }}>
                    {paymentMethod==='stripe' && 'Paying by Card'}
                    {paymentMethod==='paypal' && 'Paying via PayPal'}
                    {paymentMethod==='cod'    && 'Cash on Delivery'}
                  </span>
                  <button type="button"
                    onClick={()=>{ const m:PaymentMethod[]=['stripe','paypal','cod']; setPaymentMethod(m[(m.indexOf(paymentMethod)+1)%m.length]); }}
                    className="ml-auto flex items-center gap-1 transition-colors"
                    style={{ fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.15em', color: T.creamLow }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=T.cream}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=T.creamLow}>
                    Change <ChevronRight size={10} />
                  </button>
                </div>

                <SubmitButton orderStatus={orderStatus} handleSubmit={handleSubmit} ctaLabel={ctaLabel} />

                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck size={14} style={{ color:'#4ade80' }} />
                  <span style={{ fontSize:'8px', textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:700, color: T.creamLow }}>
                    {c('secure')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE: sticky bottom CTA bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4"
        style={{ background: `linear-gradient(to top, ${T.bg} 70%, transparent)` }}>
        <SubmitButton orderStatus={orderStatus} handleSubmit={handleSubmit} ctaLabel={ctaLabel} />
        <div className="flex items-center justify-center gap-2 mt-2">
          <ShieldCheck size={12} style={{ color:'#4ade80' }} />
          <span style={{ fontSize:'8px', textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:700, color: T.creamLow }}>
            {c('secure')}
          </span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Submit button (reused in both columns)
// ─────────────────────────────────────────────
function SubmitButton({ orderStatus, handleSubmit, ctaLabel }: {
  orderStatus: OrderStatus;
  handleSubmit: () => void;
  ctaLabel: () => string;
}) {
  const T_gold  = '#c49448';
  const T_bg    = '#0c0803';
  const T_creamLow = 'rgba(247,242,235,0.3)';
  const T_creamMid = 'rgba(247,242,235,0.55)';
  return (
    <button type="button" onClick={handleSubmit} disabled={orderStatus==='processing'}
      className="w-full py-5 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 flex items-center justify-center gap-3"
      style={{
        background: orderStatus==='processing' ? 'rgba(247,242,235,0.1)' : T_gold,
        color:      orderStatus==='processing' ? T_creamLow               : T_bg,
        cursor:     orderStatus==='processing' ? 'not-allowed'             : 'pointer',
        boxShadow:  orderStatus==='processing' ? 'none' : `0 8px 32px rgba(196,148,72,0.3)`,
      }}
      onMouseEnter={e=>{ if(orderStatus!=='processing') (e.currentTarget as HTMLElement).style.background='#f7f2eb'; }}
      onMouseLeave={e=>{ if(orderStatus!=='processing') (e.currentTarget as HTMLElement).style.background=T_gold; }}>
      {orderStatus==='processing'
        ? <><Loader2 size={14} className="animate-spin" style={{ color: T_creamMid }} /> Processing…</>
        : ctaLabel()}
    </button>
  );
}