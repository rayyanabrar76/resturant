import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'de', 'ar'],
  defaultLocale: 'en'
});

// Use these wrappers instead of standard Next.js navigation APIs
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);