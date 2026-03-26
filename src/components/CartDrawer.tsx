'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Plus, Minus, ShoppingBag, Utensils } from 'lucide-react';
import { Link } from '@/i18n/routing'; 

interface CartItem {
  id: number;
  nameKey: string;
  price: number;
  qty: number;
  img: string;
  customDetails?: { name: string; qty: number }[];
  guestCount?: number;
}

// Custom Animated Trash Icon that "Opens its Door/Lid"
const AnimatedTrashIcon = () => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      {/* The Lid/Door - Animates to 45 degrees on hover */}
      <motion.g
        variants={{
          rest: { rotate: 0, y: 0, x: 0 },
          hover: { rotate: -45, y: -2, x: -2 },
          tap: { rotate: 0, y: 0, x: 0 }
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <path d="M3 6h18" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </motion.g>
      {/* The Container */}
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </motion.svg>
  );
};

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQty, 
  onRemoveItem,
  locale 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  locale: string;
}) {
  const t = useTranslations('Menu');
  const d = useTranslations('Dishes');
  const isRtl = locale === 'ar';

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const getDisplayName = (nameKey: string) => {
    if (nameKey.startsWith('dish') || nameKey.startsWith('cat')) {
      return d(nameKey);
    }
    return nameKey; 
  };

  const safeT = (key: string, fallback: string) => {
    try { return t(key); } catch (e) { return fallback; }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-60"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${isRtl ? 'left-0' : 'right-0'} h-full w-[90vw] sm:w-full max-w-md shadow-2xl z-70 flex flex-col`}
            style={{ background: '#0c0803' }}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(193,127,59,0.15)' }}>
              <div>
                <h3 className="font-serif italic text-2xl" style={{ color: '#f7f2eb' }}>{t('cartTitle')}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(193,127,59,0.7)' }}>
                  {items.length} {items.length === 1 ? t('item') || 'Item' : t('items') || 'Items'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: 'rgba(247,242,235,0.4)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag size={32} style={{ color: 'rgba(247,242,235,0.15)' }} />
                  <p className="font-serif italic" style={{ color: 'rgba(247,242,235,0.35)' }}>{t('emptyCart')}</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => {
                    const isCatering = !!item.customDetails;
                    
                    return (
                      <motion.div 
                        key={item.id} 
                        layout 
                        exit={{ opacity: 0, x: isRtl ? 50 : -50 }}
                        className="space-y-3 group"
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden" style={{ background: 'rgba(247,242,235,0.06)' }}>
                            <img src={item.img} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold leading-tight" style={{ color: '#f7f2eb' }}>
                                  {getDisplayName(item.nameKey)}
                                </h4>
                                <p className="text-[10px] mt-1" style={{ color: 'rgba(247,242,235,0.35)' }}>
                                  {isCatering && item.guestCount 
                                    ? `${item.guestCount} ${t('guestUnit')}` 
                                    : `${t('qty')}: ${item.qty}`}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-sm font-serif font-medium" style={{ color: '#c17f3b' }}>
                                  {t('currencySymbol')}{(item.price * item.qty).toFixed(2)}
                                </span>
                                
                                {/* ANIMATED DELETE BUTTON */}
                                <motion.button 
                                  onClick={() => onRemoveItem(item.id)}
                                  className="transition-colors p-1"
                                  style={{ color: 'rgba(247,242,235,0.2)' }}
                                  whileHover={{ color: 'rgba(239,68,68,0.8)' }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <AnimatedTrashIcon />
                                </motion.button>

                              </div>
                            </div>
                            
                            {!isCatering && (
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => onUpdateQty(item.id, -1)} 
                                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                                  style={{ border: '1px solid rgba(193,127,59,0.25)', color: 'rgba(247,242,235,0.45)' }}
                                  disabled={item.qty <= 1}
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-bold w-4 text-center" style={{ color: '#f7f2eb' }}>{item.qty}</span>
                                <button 
                                  onClick={() => onUpdateQty(item.id, 1)} 
                                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                                  style={{ border: '1px solid rgba(193,127,59,0.25)', color: 'rgba(247,242,235,0.45)' }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isCatering && item.customDetails && (
                          <div className={`mt-2 ${isRtl ? 'mr-12' : 'ml-12'} p-3 rounded-xl space-y-2`} style={{ background: 'rgba(193,127,59,0.06)', border: '1px solid rgba(193,127,59,0.15)' }}>
                            <div className="flex items-center gap-2 opacity-50">
                              <Utensils size={10} style={{ color: '#c17f3b' }} />
                              <span className="text-[9px] uppercase font-bold tracking-tighter" style={{ color: 'rgba(247,242,235,0.6)' }}>Menu Selection</span>
                            </div>
                            {item.customDetails.map((dish, idx) => (
                              <div key={idx} className="flex justify-between text-[10px]" style={{ color: 'rgba(247,242,235,0.5)' }}>
                                <span>{dish.name}</span>
                                <span className="font-bold">x{dish.qty}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 space-y-6" style={{ background: 'rgba(247,242,235,0.03)', borderTop: '1px solid rgba(193,127,59,0.15)' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'rgba(247,242,235,0.35)' }}>Total</span>
                <span className="text-3xl font-serif" style={{ color: '#c17f3b' }}>
                  {t('currencySymbol')}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <Link 
                href={items.some(i => i.customDetails) ? "/checkout?type=catering" : "/checkout"} 
                onClick={onClose}
                className={items.length === 0 ? 'pointer-events-none' : 'block'}
              >
                <button 
                  disabled={items.length === 0}
                  className="w-full py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50"
                  style={{ background: '#2d5016', color: '#f7f2eb', border: '1px solid rgba(74,124,35,0.45)' }}
                >
                  {t('checkout')}
                </button>
              </Link>
              
              <button 
                onClick={onClose}
                className="w-full text-center text-[10px] uppercase tracking-widest font-bold transition-colors"
                style={{ color: 'rgba(247,242,235,0.25)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#c17f3b'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(247,242,235,0.25)'}
              >
                {safeT('continueShopping', 'Continue Shopping')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}