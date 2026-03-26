import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ');
  return {
    title: `Zafran | ${title}`,
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  
  // Pass the id to the client component
  return <ProductDetailClient id={resolvedParams.id} />;
}