'use client';

import { Instagram, ExternalLink } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';

const FEED_POSTS = [
  { id: 1, img: '/images/post1.PNG', link: '...', isVideo: true },
  { id: 2, img: '/images/post2.PNG', link: '...', isVideo: true },
  { id: 3, img: '/images/post3.PNG', link: '...', isVideo: true },
  { id: 4, img: '/images/post4.PNG', link: '...', isVideo: true },
  { id: 5, img: '/images/post5.PNG', link: '...', isVideo: true },
  { id: 6, img: '/images/post6.PNG', link: '...', isVideo: true },
  { id: 1, img: '/images/post1.png', link: 'https://www.instagram.com/p/DVoMb74gYjw/', isVideo: true },
  { id: 2, img: '/images/post2.png', link: 'https://www.instagram.com/p/DVBmt5hDzFd/', isVideo: true },
  { id: 3, img: '/images/post3.png', link: 'https://www.instagram.com/p/DPbvqOcAkM3/', isVideo: true },
  { id: 4, img: '/images/post4.png', link: 'https://www.instagram.com/p/DPLkWBIjHdX/', isVideo: true },
  { id: 5, img: '/images/post5.png', link: 'https://www.instagram.com/p/DOQsfbRiFUf/', isVideo: true },
  { id: 6, img: '/images/post6.png', link: 'https://www.instagram.com/p/DO19PGmkxTr/', isVideo: true },
];

export default function SocialFeed() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section
      className="relative bg-[#0c0803] py-24 overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-px bg-linear-to-r from-transparent via-[#c49448]/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-150 h-px bg-linear-to-r from-transparent via-[#c49448]/20 to-transparent" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 relative z-10">

        <div className="flex flex-col items-center justify-center mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-[#c49448]/40" />
            <div className="w-px h-3 bg-[#c49448]/30" />
            <Instagram size={15} className="text-[#c49448]" strokeWidth={1.5} />
            <div className="w-px h-3 bg-[#c49448]/30" />
            <div className="h-px w-16 bg-linear-to-l from-transparent to-[#c49448]/40" />
          </div>

          <a
            href="https://instagram.com/chef.aboud.kueche"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 relative"
          >
            <span
              className="text-[#c0a978] transition-colors duration-300 group-hover:text-[#e8c97a] tracking-[0.45em] text-[10px] font-semibold uppercase"
              style={{ fontFamily: "'Tajawal', 'Cairo', sans-serif" }}
            >
              @CHEF.ABOUD.KUECHE
            </span>
            <ExternalLink
              size={10}
              className="text-[#c49448]/40 group-hover:text-[#c49448] transition-all duration-300 opacity-0 group-hover:opacity-100"
            />
            <span className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full bg-linear-to-r from-[#c49448]/60 to-transparent transition-all duration-500" />
          </a>

          <p
            className="mt-3 text-[#6b5a3e]/70 text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {isRTL ? 'تابعونا على الإنستغرام' : 'Follow along the journey'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0.5">
          {FEED_POSTS.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group bg-[#1a1510]"
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={post.img}
                alt={`Instagram post ${post.id}`}
                className="w-full h-full object-cover transition-transform duration-1200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.08]"
              />

              <div className="absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-black/30" />

              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(12,8,3,0.55) 0%, rgba(196,148,72,0.08) 100%)',
                  opacity: hoveredId === post.id ? 1 : 0,
                }}
              />

              <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                style={{
                  opacity: hoveredId === post.id ? 1 : 0,
                  transform: hoveredId === post.id ? 'scale(1)' : 'scale(0.8)',
                }}
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full border border-[#c49448]/20 transition-all duration-700"
                    style={{
                      transform: hoveredId === post.id ? 'scale(1.7)' : 'scale(1.4)',
                      opacity: hoveredId === post.id ? 0.6 : 0,
                    }}
                  />
                  <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md border border-[#c49448]/30 flex items-center justify-center">
                    <Instagram size={13} className="text-[#c49448]" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {post.isVideo && (
                <div className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <svg viewBox="0 0 16 16" fill="#c49448" className="w-3.5 h-3.5">
                    <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zM6 5.5v5l4.5-2.5L6 5.5z" />
                  </svg>
                </div>
              )}

              <div
                className="absolute bottom-0 left-0 h-px bg-linear-to-r from-[#c49448] to-[#e8c97a]/50 transition-all duration-700"
                style={{ width: hoveredId === post.id ? '100%' : '0%' }}
              />

              <div
                className="absolute top-0 left-0 w-4 h-4 transition-all duration-500"
                style={{ opacity: hoveredId === post.id ? 1 : 0 }}
              >
                <div className="absolute top-0 left-0 w-full h-px bg-[#c49448]/50" />
                <div className="absolute top-0 left-0 h-full w-px bg-[#c49448]/50" />
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="https://instagram.com/chef.aboud.kueche"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-7 py-3 border border-[#c49448]/20 hover:border-[#c49448]/50 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-[#c49448]/5 to-transparent" />
            <Instagram size={13} className="text-[#c49448]" strokeWidth={1.5} />
            <span
              className="text-[#c0a978] text-[9px] tracking-[0.35em] uppercase font-semibold"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              {isRTL ? 'عرض المزيد' : 'View Profile'}
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}