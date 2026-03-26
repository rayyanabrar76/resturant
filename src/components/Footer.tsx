'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Instagram, Facebook, MapPin, Phone, ArrowUp } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const exploreLinks = t.raw('exploreLinks') as string[];

  return (
    <footer
      className="relative text-[#f7f2eb] overflow-hidden"
      style={{
        backgroundImage: "url('/images/islamic-circle1.png')",
        backgroundSize: '400px 400px',
        backgroundRepeat: 'repeat',
        backgroundColor: '#0c0803',
      }}
    >
      <div className="absolute inset-0 bg-[#0c0803]/85 pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-lg h-64 rounded-full bg-[#d4a373]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">

        {/* ── HERO BRAND BLOCK ── */}
        <div className="py-12 flex flex-col items-center text-center border-b border-white/5">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full border border-[#d4a373]/30 scale-110" />
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#d4a373]/50">
              <img src="/images/profile.jpg" alt="Chef Aboud Küche" className="w-full h-full object-cover" />
            </div>
          </div>

          <h2
            className="text-[32px] md:text-[44px] leading-tight mb-2 text-[#eec49b]"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
          >
            Chef Aboud Küche
          </h2>

          <p className="text-[#f7f2eb] text-[10px] tracking-[0.4em] uppercase mb-6 opacity-90">
            {t('tagline')}
          </p>

          <div className="flex gap-4">
            <a href="#" className="p-2.5 bg-white/5 border border-white/10 hover:border-[#d4a373] transition-all rounded-full">
              <Instagram size={16} className="text-[#d4a373]" />
            </a>
            <a href="#" className="p-2.5 bg-white/5 border border-white/10 hover:border-[#d4a373] transition-all rounded-full">
              <Facebook size={16} className="text-[#d4a373]" />
            </a>
          </div>
        </div>

        {/* ── 3 COLUMNS ── */}
        <div className={`grid grid-cols-1 md:grid-cols-3 border-b border-white/5 ${isRTL ? 'direction-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>

          {/* Contact */}
          <div className="py-10 px-4 md:border-r border-white/5">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#d4a373] mb-6 font-bold">
              {t('contactTitle')}
            </h4>
            <ul className="space-y-4">
              <li className={`flex items-start gap-3 text-[14px] text-white/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin size={14} className="text-[#d4a373] shrink-0 mt-1" />
                <span>{t('address')}</span>
              </li>
              <li className={`flex items-center gap-3 text-[14px] text-white/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone size={14} className="text-[#d4a373] shrink-0" />
                <span dir="ltr">{t('phone')}</span>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div className="py-10 px-8 md:border-r border-white/5">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#d4a373] mb-6 font-bold">
              {t('exploreTitle')}
            </h4>
            <div className="grid grid-cols-2 gap-y-3">
              {exploreLinks.map((item) => (
                <a key={item} href="#" className="text-[14px] text-white/70 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="py-10 px-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#d4a373] mb-6 font-bold">
              {t('newsletterTitle')}
            </h4>
            <div className="relative">
              <input
                type="email"
                placeholder={t('newsletterPlaceholder')}
                dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-[13px] focus:outline-none focus:border-[#d4a373]/50 transition-all"
              />
              <button className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[#d4a373] text-[10px] font-bold uppercase`}>
                {t('newsletterCta')}
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className={`py-6 flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <p className="text-white/30 text-[10px] uppercase tracking-widest">
            {t('copyright')}
          </p>
          <button onClick={scrollToTop} className={`flex items-center gap-2 group text-white/50 hover:text-[#d4a373] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] uppercase tracking-widest">{t('backToTop')}</span>
            <ArrowUp size={12} />
          </button>
        </div>

      </div>
    </footer>
  );
}