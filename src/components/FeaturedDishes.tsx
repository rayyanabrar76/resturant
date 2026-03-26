'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCart } from '@/context/CartContext';
import { Link } from '@/i18n/routing'; // Ensure this path matches your i18n setup
import { Plus, ArrowRight } from 'lucide-react';

const DISH_ITEMS = [
  { id: 'shawarma_teller', name: 'Shawarma Teller Hähnchen', price: 13.00, img: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600' },
  { id: 'grill_mix', name: 'Grill Teller Mix', price: 19.00, img: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=600' },
  { id: 'aboud_special', name: 'Aboud Teller Mix', price: 14.00, img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600' },
  { id: 'falafel_teller', name: 'Falafel Teller', price: 11.00, img: 'https://images.unsplash.com/photo-1642151614526-583bfad9cb2f' },
  { id: 'hummus_teller', name: 'Hummus Teller', price: 7.50, img: 'https://immigrantstable.com/wp-content/uploads/2024/08/Canned-Chickpea-Hummus-Recipe-11.jpg' },
  { id: 'tabbouleh', name: 'Tabbouleh Salad', price: 9.90, img: 'https://www.loveandlemons.com/wp-content/uploads/2022/08/tabbouleh-1.jpg' },
  { id: 'fattoush', name: 'Fattoush Salad', price: 9.90, img: 'https://www.lastingredient.com/wp-content/uploads/2019/04/fattoush-salad2-819x1024.jpg' },
  { id: 'halloumi_teller', name: 'Halloumi Teller', price: 12.00, img: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?q=80&w=600' }
]

export default function FeaturedDishes() {
  const d = useTranslations('Dishes');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent, dish: (typeof DISH_ITEMS)[0]) => {
    e.preventDefault(); // Prevents navigating to details page when clicking "+"
    e.stopPropagation();
    addToCart({
      id: dish.id as any,
      nameKey: dish.id,
      price: dish.price,
      img: dish.img,
      qty: 1,
    });
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Tajawal:wght@300;400;500;700&display=swap');

        .lev-root { background-color: #0c0803; position: relative; }

        .lev-card::before, .lev-card::after {
          content: ''; position: absolute; width: 20px; height: 20px;
          border-color: rgba(196, 148, 72, 0.4); border-style: solid;
          z-index: 10; pointer-events: none; transition: opacity 0.4s ease; opacity: 0;
        }
        .lev-card::before { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
        .lev-card::after  { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
        .lev-card:hover::before, .lev-card:hover::after { opacity: 1; }

        .lev-img { transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .lev-card:hover .lev-img { transform: scale(1.08); }

        .lev-btn-primary {
          background-color: #c49448; color: #0c0803; padding: 14px 36px;
          border-radius: 9999px; font-family: 'Tajawal', sans-serif;
          font-weight: 700; font-size: 12px; letter-spacing: 0.1em;
          text-transform: uppercase; transition: all 0.3s ease;
          display: flex; align-items: center; gap: 10px; border: none;
        }
        .lev-btn-primary:hover { background-color: #f7f2eb; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(196, 148, 72, 0.3); }

        .lev-tag { font-family: 'Tajawal', sans-serif; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(196, 148, 72, 0.85); }
        .lev-name { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500; color: #f7f2eb; line-height: 1.1; }
        .lev-price { font-family: 'Cormorant Garamond', serif; font-weight: 500; color: #c49448; }
        .lev-divider { width: 24px; height: 1px; background: linear-gradient(to right, #c49448, transparent); margin: 4px 0 6px; }
        .lev-divider.rtl { background: linear-gradient(to left, #c49448, transparent); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div dir={isRTL ? 'rtl' : 'ltr'} className="lev-root relative">
        <div className="relative z-10 flex overflow-x-auto pb-10 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible px-4">
          {DISH_ITEMS.map((dish) => (
            <Link 
              key={dish.id} 
              href={`/menu/${dish.id}`}
              className={[
                'lev-card group snap-center block',
                'min-w-[70vw] md:min-w-0',
                isRTL ? 'ml-4 last:ml-0 rtl' : 'mr-4 last:mr-0',
                'md:mr-0 md:ml-0',
              ].join(' ')}
            >
              <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-4 shadow-2xl">
                <img src={dish.img} alt={d(`${dish.id}.name`)} className="lev-img w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-[#0c0803]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-3 left-0 right-0 px-3 flex justify-between items-center z-10">
                  <span className={`text-white/80 text-[11px] font-light italic ${isRTL ? 'font-sans' : 'font-serif'}`}>
                    {d(`${dish.id}.name`)}
                  </span>
                  <button
                    onClick={(e) => handleAdd(e, dish)}
                    className="bg-[#c49448] text-[#0c0803] p-1.5 rounded-full md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className={`flex justify-between items-start px-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h4 className={`lev-name${isRTL ? ' rtl' : ''} text-lg md:text-xl mb-0`}>{d(`${dish.id}.name`)}</h4>
                  <div className={`lev-divider${isRTL ? ' rtl' : ''}`} />
                  <p className="lev-tag opacity-60">{d('signatureLabel')}</p>
                </div>
                <span className="lev-price text-sm md:text-base mt-1">{d('currency')}{dish.price}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Explore Full Menu Button - Matches "Plan Your Buffet" */}
        <div className="flex justify-center mt-12 pb-16">
          <Link href="/menu">
            <button className="lev-btn-primary group">
              <span>{d('exploreFullMenu')}</span>
              <ArrowRight size={16} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}