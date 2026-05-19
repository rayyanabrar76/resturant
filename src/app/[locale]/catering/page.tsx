import BuffetCalculator from '@/components/BuffetCalculator';

export default function CateringPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0c0803' }}>
      <div className="relative z-10 pt-15">
        <BuffetCalculator />
      </div>
    </main>
  );
}
