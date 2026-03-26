import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js specifically looks for a "default" export here
export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames. Ignore API routes and static files.
  matcher: ['/', '/(ar|en|de)/:path*']
};