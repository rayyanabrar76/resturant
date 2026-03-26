'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

const StarIcon = ({ size = 16, color = '#c17f3b' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5">
    <polygon points="10,2 11.8,7.2 17,8 12.8,11.5 14,17 10,14 6,17 7.2,11.5 3,8 8.2,7.2" />
  </svg>
);

export default function ChefsTable() {
  const t = useTranslations('chefsTable');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const steps = (t.raw('steps') as { no: string; title: string; desc: string }[]).map(
    (s, i) => ({
      ...s,
      img: [
        'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=800',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800',
        'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800',
      ][i],
    })
  );

  return (
    <section className="bg-[#0c0803] pt-0 pb-20 px-6 overflow-hidden relative z-10 -mt-32">
      <div className="max-w-7xl mx-auto">

        <div className={`flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`max-w-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <StarIcon />
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#c17f3b] font-bold">
                {t('label')}
              </span>
            </div>
            <h2 className="font-serif text-[#f7f2eb] text-5xl lg:text-7xl leading-tight">
              {t('title')} <span className="italic text-[#c17f3b]">{t('titleHighlight')}</span>
            </h2>
          </div>

          {/* Rotating Stamp */}
          <div className="relative hidden md:block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="w-32 h-32 rounded-full border border-[#c17f3b]/20 flex items-center justify-center"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                <text className="fill-[#c17f3b] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <textPath xlinkHref="#circlePath">{t('stampText')}</textPath>
                </text>
              </svg>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <StarIcon size={20} />
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative p-3 border border-[#c17f3b]/30 rounded-[40px] mb-8 transition-colors group-hover:border-[#c17f3b]">
                <div className="aspect-3/4 overflow-hidden rounded-[30px] relative">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                    src={step.img}
                    className="w-full h-full object-cover"
                    alt={step.title}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#0c0803] via-transparent to-transparent opacity-60" />
                  <span className="absolute bottom-6 left-6 font-sans text-5xl font-black text-white/20 outline-text">
                    {step.no}
                  </span>
                </div>
              </div>

              <h3 className={`font-serif text-[#f7f2eb] text-3xl mb-4 italic group-hover:text-[#c17f3b] transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
                {step.title}
              </h3>
              <p className={`font-serif text-[#f7f2eb]/60 text-lg leading-relaxed font-light ${isRTL ? 'text-right' : 'text-left'}`}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}</style>
    </section>
  );
}