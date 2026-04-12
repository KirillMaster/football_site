import type { Metadata } from 'next';
import { getCmsPage } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Философия клуба',
  description:
    'Ценности и методология ФК Арсенал-92. Как мы воспитываем детей через футбол.',
};

export default async function FilosofiyaPage() {
  const page = await getCmsPage('mission');

  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Философия</h1>
          <p className="text-blue-300 text-lg">Наши ценности и подход к воспитанию</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="prose-club"
            dangerouslySetInnerHTML={{ __html: page?.content ?? '' }}
          />
        </div>
      </section>
    </>
  );
}
