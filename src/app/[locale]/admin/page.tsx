import { Metadata } from 'next';
import AdminPOS from '@/components/AdminPOS';

export const metadata: Metadata = {
  title: 'Chef Aboud Küche | Staff',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPOS />;
}
