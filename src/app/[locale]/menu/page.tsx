import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MenuPageClient from '@/components/MenuPageClient';

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;

  const translations: Record<string, { title: string; description: string }> = {
    en: { title: 'Chef Aboud Küche | Menu',       description: 'Explore our curated Levantine menu.'             },
    de: { title: 'Chef Aboud Küche | Speisekarte', description: 'Entdecken Sie unsere levantinische Speisekarte.' },
    ar: { title: 'مطبخ الشيف عبود | القائمة',      description: 'اكتشف قائمة طعامنا الشامية المنتقاة.'           },
  };

  const t = translations[locale] ?? translations.en;
  return { title: t.title, description: t.description };
}

export default async function MenuPage(
  props: { params: Promise<{ locale: string }> }
) {
  const { locale } = await props.params;

  if (!['en', 'de', 'ar'].includes(locale)) notFound();

  return <MenuPageClient locale={locale} />;
}
