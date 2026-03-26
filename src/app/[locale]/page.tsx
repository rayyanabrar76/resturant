import { useTranslations } from 'next-intl';
import Hero from '@/components/Hero';
import FeaturedDishes from '@/components/FeaturedDishes';
import CateringTeaser from '@/components/CateringTeaser';
import ChefsTable from '@/components/ChefsTable'; // <---
import EditorialReviews from '@/components/EditorialReviews';
import ExperienceBridge from '@/components/ExperienceBridge';
import SocialFeed from '@/components/SocialFeed';
import Footer from '@/components/Footer';

import { i } from 'framer-motion/client';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <>
      <main className="relative" style={{ backgroundColor: '#0c0803' }}>

        {/* 1. Entrance Section */}
        <Hero />

        {/* 2. Catering Section (Moved Up) */}
        <CateringTeaser />

        {/* 3. Signature Menu Preview */}
        <section className="py-24 px-6" style={{ backgroundColor: '#0c0803' }}>
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="space-y-4">
                <span
                  className="font-bold uppercase"
                  style={{
                    color: '#c17f3b',
                    letterSpacing: '0.3em',
                    fontSize: '10px',
                  }}
                >
                  {t('discover')}
                </span>
                <h2
                  className="font-serif leading-tight"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                    color: '#f7f2eb',
                  }}
                >
                  {t('kitchen')}{' '}
                  <span style={{ color: '#c17f3b', fontStyle: 'italic' }}>
                    {t('kitchenItalic')}
                  </span>
                </h2>
              </div>
              <p
                className="max-w-sm font-light leading-relaxed"
                style={{ color: 'rgba(247,242,235,0.45)' }}
              >
                {t('kitchenDesc')}
              </p>
            </header>

            <FeaturedDishes />
          </div>
        </section>
   <ChefsTable />
   <EditorialReviews />
   <ExperienceBridge />
   <SocialFeed />
      </main>

      {/* 5. Site-wide Footer */}
      <Footer />
    </>
  );
}