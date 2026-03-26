'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Users, Phone, User,
  ChevronRight, ChevronLeft, Check, Sparkles, Mail, MapPin
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/routing';

type Status = 'idle' | 'submitting' | 'success';
type Step = 1 | 2 | 3;

interface FormData {
  name: string; phone: string; email: string; date: string;
  time: string; guests: string; occasion: string; requests: string; seating: string;
}

const TIME_SLOTS = [
  { time: '17:30', label: '5:30 PM', avail: 'good' },
  { time: '18:00', label: '6:00 PM', avail: 'good' },
  { time: '18:30', label: '6:30 PM', avail: 'low'  },
  { time: '19:00', label: '7:00 PM', avail: 'full' },
  { time: '19:30', label: '7:30 PM', avail: 'good' },
  { time: '20:00', label: '8:00 PM', avail: 'low'  },
  { time: '20:30', label: '8:30 PM', avail: 'good' },
  { time: '21:00', label: '9:00 PM', avail: 'good' },
  { time: '21:30', label: '9:30 PM', avail: 'low'  },
];

const OCCASIONS = ['Birthday', 'Anniversary', 'Business Dinner', 'Date Night', 'Family Gathering', 'Other'];
const SEATING   = ['Indoor – Main Hall', 'Terrace – Garden View', 'Private Dining Room', "Chef's Table"];
const STEPS     = ['Guest Details', 'Date & Time', 'Preferences'];

function FloatField({
  label, icon: Icon, type = 'text', required, value, onChange, placeholder, isRTL
}: {
  label: string; icon: any; type?: string; required?: boolean;
  value: string; onChange: (v: string) => void; placeholder?: string; isRTL: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div className="relative group">
      <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 transition-colors duration-200
        ${focused || filled ? 'text-gold' : 'text-stone-300'}`}>
        <Icon size={15} strokeWidth={1.8} />
      </div>
      <input
        type={type} required={required} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`peer w-full bg-stone-50 border rounded-2xl
          ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} pt-6 pb-3
          text-stone-900 placeholder-transparent text-sm focus:outline-none transition-all duration-200
          ${focused ? 'border-gold shadow-[0_0_0_3px_rgba(201,168,76,0.1)] bg-white' : 'border-stone-100 hover:border-stone-200'}`}
      />
      <label className={`absolute transition-all duration-200 pointer-events-none font-medium
        ${isRTL ? 'right-11' : 'left-11'}
        ${focused || filled
          ? 'top-2.5 text-[9px] uppercase tracking-[0.18em] text-gold'
          : 'top-1/2 -translate-y-1/2 text-xs text-stone-400'}`}>
        {label}
      </label>
    </div>
  );
}

function StepHeader({ number, title, subtitle }: { number: number; title: string; subtitle: string }) {
  return (
    <div className="space-y-1 pb-2">
      <p className="text-gold text-[9px] uppercase tracking-[0.4em] font-bold">Step {number} of 3</p>
      <h2 className="font-serif italic text-3xl text-stone-900">{title}</h2>
      <p className="text-stone-400 text-sm font-light">{subtitle}</p>
    </div>
  );
}

export default function ReservationPage() {
  const t      = useTranslations('Reservation');
  const locale = useLocale();
  const isRTL  = locale === 'ar';

  const [status, setStatus] = useState<Status>('idle');
  const [step,   setStep]   = useState<Step>(1);
  const [form,   setForm]   = useState<FormData>({
    name: '', phone: '', email: '', date: '', time: '',
    guests: '2', occasion: '', requests: '', seating: ''
  });

  const set = (key: keyof FormData) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const canNext = () => {
    if (step === 1) return form.name && form.phone;
    if (step === 2) return form.date && form.time;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { setStep((step + 1) as Step); return; }
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 2000);
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <div className="absolute top-[-10%] right-[-5%] w-125500px] bg-gold/5 rounded-full blur-3xl -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center space-y-8 max-w-lg z-10"
        >
          <div className="relative mx-auto w-24 h-24">
            <motion.div
              initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-24 h-24 rounded-full border border-gold/30 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease: 'backOut' }}
                className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center"
              >
                <Check size={28} className="text-gold" strokeWidth={2} />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 rounded-full border border-gold/20 scale-125"
            />
          </div>
          <div className="space-y-3">
            <p className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold">Reservation Confirmed</p>
            <h2 className="font-serif italic text-5xl text-stone-900 leading-tight">{t('successTitle')}</h2>
            <p className="text-stone-500 font-light leading-relaxed text-sm">{t('successMessage')}</p>
          </div>
          <div className="bg-white border border-stone-100 rounded-3xl p-6 text-left space-y-3 shadow-premium">
            {[
              { label: 'Guest',  value: form.name },
              { label: 'Date',   value: form.date },
              { label: 'Time',   value: form.time },
              { label: 'Guests', value: `${form.guests} people` },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex justify-between text-sm border-b border-stone-50 pb-3 last:border-0 last:pb-0">
                <span className="text-stone-400 uppercase tracking-widest text-[9px] font-bold">{label}</span>
                <span className="text-stone-900 font-medium">{value}</span>
              </div>
            ) : null)}
          </div>
          <button onClick={() => { setStatus('idle'); setStep(1); }}
            className="text-gold uppercase tracking-[0.2em] font-bold text-[10px] border-b border-gold/40 pb-1 hover:border-gold transition-colors">
            {t('backToBooking')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-16 px-4 md:px-8 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Decorative blobs matching Hero */}
      <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-gold/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 bg-stone-200/40 rounded-full blur-3xl -z-10" />

      <div className="relative max-w-6xl mx-auto z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
            </span>
            {t('experienceBadge')}
          </div>
          <h1 className="font-serif text-6xl md:text-7xl text-stone-950 leading-[0.9]">
            {t('pageTitle').split(' ').slice(0, -1).join(' ')}{' '}
            <span className="italic text-gold">{t('pageTitle').split(' ').pop()}</span>
          </h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-5 rounded-[40px] overflow-hidden shadow-premium border border-stone-100 bg-white"
        >
          {/* Left panel – photo + steps */}
          <div className="lg:col-span-2 relative overflow-hidden min-h-65">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
              alt="Restaurant Interior"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-stone-950/90 via-stone-950/40 to-stone-950/10" />
            <div className="relative h-full flex flex-col justify-between p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 w-fit">
                <Sparkles size={12} className="text-gold" />
                <span className="text-white/90 text-[10px] uppercase tracking-[0.25em] font-bold">Fine Dining</span>
              </div>
              <div className="space-y-5">
                <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-bold">Your Journey</p>
                {STEPS.map((label, i) => {
                  const s = (i + 1) as Step;
                  const done = step > s; const current = step === s;
                  return (
                    <div key={s} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 shrink-0
                        ${done ? 'bg-gold border-gold' : current ? 'border-gold bg-gold/15' : 'border-white/20 bg-white/5'}`}>
                        {done
                          ? <Check size={13} className="text-stone-950" strokeWidth={2.5} />
                          : <span className={`text-[10px] font-bold ${current ? 'text-gold' : 'text-white/30'}`}>{s}</span>}
                      </div>
                      <span className={`text-sm transition-colors duration-300
                        ${done ? 'text-white/30 line-through' : current ? 'text-white font-medium' : 'text-white/30'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
                <div className="h-px bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-linear-to-r from-gold to-amber-300"
                    animate={{ width: `${((step - 1) / 2) * 100 + 33}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
              <div className="space-y-3 border-t border-white/10 pt-8">
                {[
                  { icon: Clock, text: 'Open daily · 17:30 – 23:00' },
                  { icon: Phone, text: '+49 30 1234 5678' },
                  { icon: Mail,  text: 'reserve@zafran.com' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={13} className="text-gold shrink-0" strokeWidth={1.8} />
                    <span className="text-white/50 text-xs">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel – form */}
          <div className="lg:col-span-3 p-8 md:p-14 bg-white">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1"
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-7"
                  >
                    <StepHeader number={1} title="Guest Details" subtitle="Tell us who's joining us tonight" />
                    <div className="space-y-4">
                      <FloatField label={t('fullName')} icon={User} required value={form.name} onChange={set('name')} placeholder="Your name" isRTL={isRTL} />
                      <FloatField label={t('phone')} icon={Phone} type="tel" required value={form.phone} onChange={set('phone')} placeholder="+49..." isRTL={isRTL} />
                      <FloatField label="Email Address" icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" isRTL={isRTL} />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">{t('guests')}</p>
                      <div className="flex gap-2 flex-wrap">
                        {[1,2,3,4,5,6,7,8].map(n => (
                          <button key={n} type="button" onClick={() => set('guests')(String(n))}
                            className={`w-12 h-12 rounded-2xl border text-sm font-bold transition-all duration-200
                              ${form.guests === String(n)
                                ? 'bg-stone-950 border-stone-950 text-white shadow-lg'
                                : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700 bg-white'}`}>
                            {n}
                          </button>
                        ))}
                        <button type="button" onClick={() => set('guests')('9+')}
                          className={`px-4 h-12 rounded-2xl border text-xs font-bold transition-all duration-200
                            ${form.guests === '9+' ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-200 text-stone-400 hover:border-stone-400 bg-white'}`}>
                          9+
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2"
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-7"
                  >
                    <StepHeader number={2} title="Date & Time" subtitle="Choose your perfect evening" />
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">{t('date')}</p>
                      <div className="relative">
                        <Calendar size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none`} strokeWidth={1.8} />
                        <input type="date" required value={form.date} onChange={e => set('date')(e.target.value)}
                          className={`w-full bg-stone-50 border border-stone-100 rounded-2xl ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-4 text-stone-900 text-sm
                            focus:outline-none focus:border-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,168,76,0.1)] transition-all`} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">{t('time')}</p>
                        <div className="flex items-center gap-3 text-[9px] font-bold">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/><span className="text-stone-400">Available</span></span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"/><span className="text-stone-400">Low</span></span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-300 inline-block"/><span className="text-stone-400">Full</span></span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map(({ time, label, avail }) => {
                          const full = avail === 'full'; const chosen = form.time === time;
                          const dot  = avail === 'good' ? 'bg-emerald-400' : avail === 'low' ? 'bg-amber-400' : 'bg-red-300';
                          return (
                            <button key={time} type="button" disabled={full} onClick={() => set('time')(time)}
                              className={`relative py-3 px-2 rounded-2xl border text-xs font-bold transition-all duration-200
                                ${full ? 'border-stone-100 text-stone-300 bg-stone-50 cursor-not-allowed'
                                  : chosen ? 'bg-stone-950 border-stone-950 text-white shadow-lg'
                                  : 'border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50'}`}>
                              <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${dot}`} />
                              {label}
                              {full && <span className="block text-[8px] font-normal text-stone-400 mt-0.5">Full</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3"
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-7"
                  >
                    <StepHeader number={3} title="Preferences" subtitle="Help us make it perfect" />
                    <div className="space-y-3">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">Occasion <span className="text-stone-300 normal-case tracking-normal">(optional)</span></p>
                      <div className="flex flex-wrap gap-2">
                        {OCCASIONS.map(occ => (
                          <button key={occ} type="button" onClick={() => set('occasion')(occ === form.occasion ? '' : occ)}
                            className={`px-4 py-2 rounded-full border text-xs font-medium transition-all duration-200
                              ${form.occasion === occ ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'}`}>
                            {occ}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">Seating <span className="text-stone-300 normal-case tracking-normal">(optional)</span></p>
                      <div className="grid grid-cols-2 gap-2">
                        {SEATING.map(seat => (
                          <button key={seat} type="button" onClick={() => set('seating')(seat === form.seating ? '' : seat)}
                            className={`py-3 px-4 rounded-2xl border text-xs font-medium text-left transition-all duration-200 leading-tight
                              ${form.seating === seat ? 'bg-gold/10 border-gold/40 text-stone-900' : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'}`}>
                            {seat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">{t('specialRequests')} <span className="text-stone-300 normal-case tracking-normal">(optional)</span></p>
                      <textarea rows={3} value={form.requests} onChange={e => set('requests')(e.target.value)}
                        placeholder="Allergies, birthday cake, high chair…"
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-stone-900 text-sm placeholder-stone-400
                          focus:outline-none focus:border-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,168,76,0.1)] transition-all resize-none" />
                    </div>
                    <div className="bg-stone-50 border border-stone-100 rounded-3xl p-5 space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">Booking Summary</p>
                      {[
                        { label: 'Guest', value: form.name },
                        { label: 'Date',  value: form.date },
                        { label: 'Time',  value: form.time },
                        { label: 'Guests', value: form.guests ? `${form.guests} people` : '' },
                        { label: 'Occasion', value: form.occasion },
                        { label: 'Seating',  value: form.seating },
                      ].filter(r => r.value).map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">{label}</span>
                          <span className="text-stone-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`flex items-center mt-10 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                {step > 1 && (
                  <button type="button" onClick={() => setStep((step - 1) as Step)}
                    className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-xs font-bold uppercase tracking-widest">
                    <ChevronLeft size={14} /> Back
                  </button>
                )}
                <button type="submit" disabled={!canNext() || status === 'submitting'}
                  className="flex items-center gap-3 bg-stone-950 text-white px-8 py-4 rounded-full
                    text-[10px] font-bold uppercase tracking-[0.3em]
                    hover:bg-gold hover:text-stone-950 transition-all duration-300
                    shadow-xl shadow-stone-950/20 active:scale-95
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                  {status === 'submitting' ? 'Confirming…' :
                    step < 3 ? <>Continue <ChevronRight size={13} /></> :
                    <>{t('confirmBooking')} <Sparkles size={13} /></>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Bottom info strip — replaces footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: MapPin, title: 'Location',      body: 'Unter den Linden 42, Berlin' },
            { icon: Clock,  title: 'Opening Hours',  body: 'Mon – Sat · 17:30 – 23:00'  },
            { icon: Phone,  title: 'Call Us',        body: '+49 30 1234 5678'            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-center gap-4 bg-white border border-stone-100 rounded-3xl px-6 py-5 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-gold" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-stone-400">{title}</p>
                <p className="text-stone-800 text-sm font-medium mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}