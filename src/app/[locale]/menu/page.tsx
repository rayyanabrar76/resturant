// src/app/[locale]/menu/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOCK_MENU } from '@/components/MenuExplorer';
import MenuPageClient from '@/components/MenuPageClient';

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;

  const translations: Record<string, { title: string; description: string }> = {
    en: {
      title: 'Chef Aboud Küche | Menu',
      description: 'Explore our curated Lebanese menu.',
    },
    de: {
      title: 'Chef Aboud Küche | Speisekarte',
      description: 'Entdecken Sie unsere libanesische Speisekarte.',
    },
    ar: {
      title: 'مطبخ الشيف عبود | القائمة',
      description: 'اكتشف قائمة طعامنا اللبنانية المنتقاة.',
    },
  };

  const t = translations[locale] ?? translations.en;
  return { title: t.title, description: t.description };
}

export default async function MenuPage(
  props: { params: Promise<{ locale: string }> }
) {
  const { locale } = await props.params;

  // Must match your routing.ts locales exactly
  if (!['en', 'de', 'ar'].includes(locale)) {
    notFound();
  }

  return <MenuPageClient locale={locale} data={MOCK_MENU} />;
}