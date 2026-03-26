'use client';

import { notFound } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { Plus, Minus, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/routing';

const DISH_DATA: Record<string, { price: number; img: string; calories: number }> = {
  shawarma_teller: { 
    price: 13.00, 
    img: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600', 
    calories: 850 
  },
  grill_mix: { 
    price: 19.00, 
    img: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=600', 
    calories: 1100 
  },
  aboud_special: { 
    price: 14.00, 
    img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600', 
    calories: 950 
  },
  falafel_teller: { 
    price: 11.00, 
    img: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?q=80&w=600', 
    calories: 680 
  },
  hummus_teller: { 
    price: 7.50, 
    img: 'https://immigrantstable.com/wp-content/uploads/2024/08/Canned-Chickpea-Hummus-Recipe-11.jpg', 
    calories: 450 
  },
  tabbouleh: { 
    price: 9.90, 
    img: 'https://www.loveandlemons.com/wp-content/uploads/2022/08/tabbouleh-1.jpg', 
    calories: 180 
  },
  fattoush: { 
    price: 9.90, 
    img: 'https://www.lastingredient.com/wp-content/uploads/2019/04/fattoush-salad2-819x1024.jpg', 
    calories: 210 
  },
  halloumi_teller: { 
    price: 12.00, 
    img: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?q=80&w=600', 
    calories: 720 
  },
};

export default function ProductDetailClient({ id }: { id: string }) {
  const t = useTranslations('Dishes');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  // Normalize id to lowercase to match DISH_DATA keys
  const activeId = id.toLowerCase();
  const dish = DISH_DATA[activeId];

  if (!dish) {
    return notFound();
  }

  return (
    <section className="bg-[#0c0803] min-h-screen pt-32 pb-20 px-6 text-[#f7f2eb]">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/menu" 
          className="inline-flex items-center gap-2 text-[#c49448] mb-12 hover:text-[#f7f2eb] transition-colors group"
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          <span className="text-xs uppercase tracking-widest font-sans font-bold">
            {isRTL ? 'العودة للقائمة' : 'Back to Menu'}
          </span>
        </Link>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-4/5 rounded-[40px] overflow-hidden border border-[#c49448]/20 shadow-2xl"
          >
            <img src={dish.img} alt={t(`${activeId}.name`)} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-[#0c0803] via-transparent to-transparent opacity-50" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={isRTL ? 'text-right' : 'text-left'}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#c49448] font-bold">
              {t('signatureLabel')}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl italic mt-4 mb-6 leading-tight">
              {t(`${activeId}.name`)}
            </h1>
            <div className="flex items-center gap-6 mb-8 text-2xl font-serif text-[#c49448]">
              <span>{t('currency')}{dish.price}</span>
              <span className="w-px h-6 bg-white/10" />
              <span className="text-sm text-white/40 uppercase tracking-widest">{dish.calories} kcal</span>
            </div>
            <p className="font-serif text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
              {t(`${activeId}.desc`)}
            </p>

            <div className="flex flex-wrap gap-6 items-center mb-12">
              <div className="flex items-center border border-white/10 rounded-full px-4 py-2 bg-white/5">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:text-[#c49448]"><Minus size={18} /></button>
                <span className="px-6 font-sans font-bold w-12 text-center text-lg">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2 hover:text-[#c49448]"><Plus size={18} /></button>
              </div>
              <button 
                onClick={() => addToCart({ ...dish, id: activeId, qty, nameKey: activeId })}
                className="bg-[#c49448] text-[#0c0803] px-12 py-5 rounded-full font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#f7f2eb] transition-all shadow-xl"
              >
                {t('addToCart')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div className="flex items-center gap-4 text-white/40 text-[10px] uppercase tracking-widest">
                <ShieldCheck size={20} className="text-[#c49448] shrink-0" />
                <span>Authentic Ingredients</span>
              </div>
              <div className="flex items-center gap-4 text-white/40 text-[10px] uppercase tracking-widest">
                <Truck size={20} className="text-[#c49448] shrink-0" />
                <span>Premium Packaging</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}