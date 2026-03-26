import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/context/CartContext'; 
import '@/app/globals.css';
import { Metadata } from 'next';
import Header from '@/components/Header'; 

export const metadata: Metadata = {
  title: {
    template: '%s | Premium Persian Cuisine',
    default: 'Chef Aboud Kuche | Premium Persian Cuisine',
  },
  description: 'Experience the finest Persian culinary arts in the heart of the city.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` is supported
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Get translations for the current locale
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="scroll-smooth">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased bg-ivory text-stone-950 min-h-screen flex flex-col font-sans">
        {/* STRATEGY: CartProvider wraps NextIntlClientProvider.
          This keeps the cart state alive when the language re-renders.
        */}
        <CartProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {/* Pass the locale prop to the Header component */}
            <Header locale={locale} /> 
            <main className="grow">
              {children}
            </main>
          </NextIntlClientProvider>
        </CartProvider>
      </body>
    </html>
  );
}