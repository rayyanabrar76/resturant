'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import MenuDropdown from './MenuDropdown';

const StarIcon = ({ size = 14, color = '#c17f3b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <polygon
      points="10,2 11.8,7.2 17,8 12.8,11.5 14,17 10,14 6,17 7.2,11.5 3,8 8.2,7.2"
      fill="none" stroke={color} strokeWidth="0.9"
    />
    <circle cx="10" cy="10" r="2.2" fill={color} opacity="0.65" />
  </svg>
);

// ── Frozen style objects — never recomputed, never changes between pages ──
const LOGO_STYLE: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  fontSize: '18px', // px instead of rem — immune to parent font-size differences
  fontWeight: 300,
  fontStyle: 'italic',
  color: '#f7f2eb',
  letterSpacing: '0.01em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

const NAV_LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Jost', 'Trebuchet MS', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

const PILL_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(12,8,3,0.92)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '9999px',
  border: '1px solid rgba(193,127,59,0.2)',
  padding: '10px 20px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
};

const TRANSPARENT_STYLE: React.CSSProperties = {
  background: 'transparent',
  padding: '8px 4px',
};

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Non-home pages always start as pill (no transparent phase)
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isVisible,  setIsVisible]  = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const lastScrollY = useRef(0);
  const { cartCount, updateQty, removeFromCart, cart } = useCart();

  // Sync scroll state when pathname changes (e.g. navigating home → menu)
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      setIsVisible(true);
      return;
    }
    setIsScrolled(window.scrollY > 20);
  }, [isHomePage]);

  // Scroll listener — only active on homepage
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      setIsVisible(!(y > lastScrollY.current && y > 100));
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Close mobile menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navLinks = [
    { name: t('Home'),     href: '/' },
    { name: t('Menu'),     href: '/menu' },
    { name: t('Catering'), href: '/catering' },
    { name: t('About'),    href: '/about' },
  ];

  return (
    <>
      <header
        className="fixed top-0 w-full z-100 transition-all duration-500 ease-in-out"
        style={{
          padding: isScrolled ? '8px 12px' : '18px 12px',
          transform: isVisible && !isCartOpen ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <nav
          className="max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 relative"
          style={isScrolled ? PILL_STYLE : TRANSPARENT_STYLE}
        >

          {/* ── LOGO — identical on every page ── */}
          <Link href="/" className="relative z-10 shrink-0" style={{ textDecoration: 'none' }}>
            <div className="flex items-center gap-2">
              <span className="shrink-0"><StarIcon size={14} color="#c17f3b" /></span>
              <span style={LOGO_STYLE}>{t('LogoName')}</span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <div className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              if (link.href === '/menu') {
                return <MenuDropdown key="menu-link" label={link.name} />;
              }
              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className="relative group"
                  style={{ textDecoration: 'none' }}
                >
                  <span style={{
                    ...NAV_LINK_STYLE,
                    color: isActive ? '#c17f3b' : 'rgba(247,242,235,0.6)',
                  }}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ── ACTIONS ── */}
          <div className="flex items-center gap-3 relative z-10 shrink-0">

            {/* Language switcher — hidden on mobile (shown in dropdown instead) */}
            <div className="hidden sm:flex items-center gap-3">
              {['en', 'ar', 'de'].map((l) => (
                <Link
                  key={l}
                  href={pathname as any}
                  locale={l}
                  style={{
                    ...NAV_LINK_STYLE,
                    fontSize: '9px',
                    color: locale === l ? '#c17f3b' : 'rgba(247,242,235,0.28)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {l}
                </Link>
              ))}
            </div>

            {/* Cart icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 group"
              aria-label="Open cart"
            >
              <ShoppingBag
                size={19}
                className="text-[#f7f2eb]/70 group-hover:text-[#c17f3b] transition-colors"
              />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 text-[8px] flex items-center justify-center rounded-full bg-[#c17f3b] text-[#0c0803] font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-[#f7f2eb]/70 hover:text-[#c17f3b] transition-colors p-1"
              onClick={() => setIsMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen
                  ? <motion.span key="x"    initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }} className="block"><X size={21} /></motion.span>
                  : <motion.span key="menu" initial={{ rotate: 45,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }} className="block"><Menu size={21} /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* ── MOBILE DROPDOWN ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,   scale: 1 }}
              exit={{   opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="md:hidden mx-2 mt-2"
              style={{
                backgroundColor: 'rgba(12,8,3,0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '20px',
                border: '1px solid rgba(193,127,59,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              {/* Nav links */}
              <div className="px-6 pt-5 pb-2">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.055 + 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={link.href as any}
                        onClick={() => setIsMenuOpen(false)}
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <div
                          className="flex items-center justify-between py-4"
                          style={{
                            borderBottom: index < navLinks.length - 1
                              ? '1px solid rgba(247,242,235,0.07)'
                              : 'none',
                          }}
                        >
                          <span style={{
                            ...NAV_LINK_STYLE,
                            fontSize: '12px',
                            color: isActive ? '#c17f3b' : 'rgba(247,242,235,0.65)',
                          }}>
                            {link.name}
                          </span>
                          <ArrowRight
                            size={13}
                            style={{ color: isActive ? '#c17f3b' : 'rgba(247,242,235,0.18)' }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Language switcher */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24 }}
                className="flex items-center gap-5 px-6 py-4"
                style={{ borderTop: '1px solid rgba(247,242,235,0.07)' }}
              >
                {['en', 'ar', 'de'].map((l) => (
                  <Link
                    key={l}
                    href={pathname as any}
                    locale={l}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      ...NAV_LINK_STYLE,
                      fontSize: '10px',
                      color: locale === l ? '#c17f3b' : 'rgba(247,242,235,0.28)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                  >
                    {l}
                  </Link>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={updateQty}
        onRemoveItem={removeFromCart}
        locale={locale}
      />
    </>
  );
}