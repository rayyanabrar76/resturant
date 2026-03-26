'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Utensils, Users } from 'lucide-react';

export default function ExperienceBridge() {
  const t = useTranslations('experienceBridge');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <section className="bg-[#0c0803] py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-1">

        {/* Left: Individual Dining */}
        <Link
          href="/menu"
          className="group relative overflow-hidden rounded-t-[40px] md:rounded-l-[40px] md:rounded-tr-none bg-[#14110d] p-12 h-100 flex flex-col justify-end border border-white/5 transition-colors duration-700 hover:bg-[#000000]"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#c17f3b]/0 to-[#c17f3b]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className={`absolute top-12 ${isRTL ? 'left-12' : 'right-12'} opacity-10 group-hover:opacity-100 group-hover:text-[#c17f3b] group-hover:-translate-y-2 transition-all duration-500 z-10`}>
            <Utensils size={80} strokeWidth={1} />
          </div>

          <div className={`relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="font-serif text-4xl text-white mb-4 italic">
              {t('menuTitle')} <span className="text-[#c17f3b]">{t('menuTitleHighlight')}</span>
            </h3>
            <p className="text-[#f7f2eb]/50 font-serif text-lg mb-6 max-w-xs">
              {t('menuDesc')}
            </p>
            <div className="w-fit border-b border-[#c17f3b] pb-1 text-[#c17f3b] uppercase text-[10px] tracking-widest font-bold group-hover:tracking-[0.2em] transition-all duration-300">
              {t('menuCta')}
            </div>
          </div>
        </Link>

        {/* Right: Catering/Buffet */}
        <Link
          href="/catering"
          className="group relative overflow-hidden rounded-b-[40px] md:rounded-r-[40px] md:rounded-bl-none bg-[#c17f3b] p-12 h-100 flex flex-col justify-end transition-colors duration-700 hover:bg-[#a66a2e]"
        >
          <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div className={`absolute top-12 ${isRTL ? 'left-12' : 'right-12'} opacity-20 group-hover:opacity-100 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 text-[#0c0803] z-10`}>
            <Users size={80} strokeWidth={1} />
          </div>

          <div className={`relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="font-serif text-4xl text-[#0c0803] mb-4 italic">
              {t('eventsTitle')} <span className="text-white">{t('eventsTitleHighlight')}</span>
            </h3>
            <p className="text-[#0c0803]/70 font-serif text-lg mb-6 max-w-xs">
              {t('eventsDesc')}
            </p>
            <div className="w-fit border-b border-[#0c0803] pb-1 text-[#0c0803] uppercase text-[10px] tracking-widest font-bold group-hover:tracking-[0.2em] transition-all duration-300">
              {t('eventsCta')}
            </div>
          </div>
        </Link>

      </div>
    </section>
  );
}