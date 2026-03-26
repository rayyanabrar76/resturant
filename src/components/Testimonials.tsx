'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
  {
    quote: "تجربة الشام الأكثر أصالة في المدينة. الاهتمام بالتفاصيل والأجواء الفاخرة لا يعلى عليها.",
    author: "أحمد المنصوري",
    role: "Epicurean Guest",
    lang: "ar",
  },
  {
    quote: "Das authentischste levantinische Erlebnis der Stadt. Die Liebe zum Detail und die Atmosphäre sind unübertroffen.",
    author: "Sarah Jensen",
    role: "Fine Dining Critic",
    lang: "de",
  },
  {
    quote: "A taste that transports you. Chef Aboud Küche is not just a restaurant — it is an art form. Simply stunning.",
    author: "James Sterling",
    role: "Food & Lifestyle Blogger",
    lang: "en",
  },
  {
    quote: "أرقى تجربة طعام شامي في برلين. الجودة هنا تتحدث عن نفسها في كل طبق.",
    author: "ليلى محمود",
    role: "Berlin Foodie",
    lang: "ar",
  },
];

const StarIcon = ({ size = 14, color = '#c17f3b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <polygon
      points="10,2 11.8,7.2 17,8 12.8,11.5 14,17 10,14 6,17 7.2,11.5 3,8 8.2,7.2"
      fill="none" stroke={color} strokeWidth="0.9"
    />
    <circle cx="10" cy="10" r="2.2" fill={color} opacity="0.65" />
  </svg>
);

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const DURATION = 5000;
  const TICK = 40;

  useEffect(() => {
    let elapsed = 0;
    const progressTimer = setInterval(() => {
      elapsed += TICK;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, TICK);

    const slideTimer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % REVIEWS.length);
      elapsed = 0;
      setProgress(0);
    }, DURATION);

    return () => {
      clearInterval(progressTimer);
      clearInterval(slideTimer);
    };
  }, [current]);

  const next = () => { setCurrent((prev) => (prev + 1) % REVIEWS.length); setProgress(0); };
  const prev = () => { setCurrent((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length); setProgress(0); };

  const review = REVIEWS[current];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500;600;700&display=swap');

        .testimonials-section {
          background-color: #0c0803;
          position: relative;
          overflow: hidden;
        }

        /* Noise grain */
        .testimonials-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.035;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        /* Star-tile pattern */
        .testimonials-section::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpattern id='st' x='0' y='0' width='64' height='64' patternUnits='userSpaceOnUse'%3E%3Cpolygon points='32,4 36,18 50,18 39,27 43,41 32,33 21,41 25,27 14,18 28,18' fill='none' stroke='%23f7f2eb' stroke-width='0.65'/%3E%3Ccircle cx='32' cy='32' r='5' fill='none' stroke='%23f7f2eb' stroke-width='0.4'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23st)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
        }

        .quote-enter {
          animation: quoteIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes quoteIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nav-btn {
          transition: color 0.3s, transform 0.3s;
          color: rgba(247,242,235,0.2);
        }
        .nav-btn:hover {
          color: #c17f3b;
          transform: scale(1.1);
        }
      `}</style>

      <section className="testimonials-section" style={{ padding: '7rem 1.5rem' }}>

        {/* Top kufic strip */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <svg className="w-full block" height="5" preserveAspectRatio="none" style={{ opacity: 0.38 }}>
            <defs>
              <pattern id="kufic-t-top" x="0" y="0" width="40" height="5" patternUnits="userSpaceOnUse">
                <rect x="0"  y="0" width="10" height="5" fill="#2d5016" />
                <rect x="11" y="1" width="6"  height="4" fill="#2d5016" />
                <rect x="19" y="0" width="4"  height="5" fill="#2d5016" />
                <rect x="25" y="1" width="10" height="4" fill="#2d5016" />
                <rect x="37" y="0" width="3"  height="5" fill="#2d5016" />
              </pattern>
            </defs>
            <rect width="100%" height="5" fill="url(#kufic-t-top)" />
          </svg>
        </div>

        {/* Bottom kufic strip */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg className="w-full block" height="5" preserveAspectRatio="none" style={{ opacity: 0.5 }}>
            <defs>
              <pattern id="kufic-t-bot" x="0" y="0" width="40" height="5" patternUnits="userSpaceOnUse">
                <rect x="0"  y="0" width="10" height="5" fill="#c17f3b" />
                <rect x="11" y="1" width="6"  height="4" fill="#c17f3b" />
                <rect x="19" y="0" width="4"  height="5" fill="#c17f3b" />
                <rect x="25" y="1" width="10" height="4" fill="#c17f3b" />
                <rect x="37" y="0" width="3"  height="5" fill="#c17f3b" />
              </pattern>
            </defs>
            <rect width="100%" height="5" fill="url(#kufic-t-bot)" />
          </svg>
        </div>

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(193,127,59,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          {/* Section label */}
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1rem',
            fontStyle: 'italic',
            letterSpacing: '0.1em',
            color: 'rgba(247,242,235,0.32)',
            marginBottom: '0.5rem',
          }}>
            ما يقوله ضيوفنا
          </p>

          {/* Heading */}
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 300,
            lineHeight: 1,
            color: '#f7f2eb',
            marginBottom: '0.8rem',
          }}>
            Guest <span style={{ color: '#c17f3b', fontStyle: 'italic' }}>Voices</span>
          </h2>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-12" style={{ opacity: 0.45 }}>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #c17f3b)' }} />
            <StarIcon size={14} color="#c17f3b" />
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #c17f3b)' }} />
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-10">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} size={16} color="#c17f3b" />
            ))}
          </div>

          {/* Quote + nav arrows */}
          <div className="relative px-10 md:px-16">

            <button onClick={prev} className="nav-btn absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
              <ChevronLeft size={30} strokeWidth={1} />
            </button>
            <button onClick={next} className="nav-btn absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
              <ChevronRight size={30} strokeWidth={1} />
            </button>

            <div
              key={current}
              className="quote-enter"
              dir={review.lang === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Opening quote mark */}
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '5rem',
                lineHeight: 0.6,
                color: 'rgba(193,127,59,0.2)',
                marginBottom: '0.5rem',
                textAlign: review.lang === 'ar' ? 'right' : 'left',
              }}>
                "
              </div>

              <blockquote style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: '#f7f2eb',
                lineHeight: 1.65,
                minHeight: '7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.01em',
              }}>
                {review.quote}
              </blockquote>

              <footer style={{ paddingTop: '2rem' }}>
                {/* Author divider */}
                <div className="flex items-center justify-center gap-3 mb-4" style={{ opacity: 0.35 }}>
                  <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, #c17f3b)' }} />
                  <StarIcon size={10} color="#c17f3b" />
                  <div className="h-px w-8" style={{ background: 'linear-gradient(to left, transparent, #c17f3b)' }} />
                </div>

                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: '#f7f2eb',
                  marginBottom: '0.35rem',
                }}>
                  {review.author}
                </p>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontStyle: 'italic',
                  color: 'rgba(193,127,59,0.55)',
                }}>
                  {review.role}
                </p>
              </footer>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center items-center gap-3 mt-12">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setProgress(0); }}
                aria-label={`Review ${i + 1}`}
                style={{
                  height: '3px',
                  width: i === current ? '48px' : '20px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 0.4s ease, background 0.4s ease',
                  background: i === current
                    ? `linear-gradient(to right, #2d5016 ${progress}%, rgba(247,242,235,0.15) ${progress}%)`
                    : 'rgba(247,242,235,0.12)',
                }}
              />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}