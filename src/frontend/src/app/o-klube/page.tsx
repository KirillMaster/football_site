import type { Metadata } from 'next';
import { getCmsPage } from '@/lib/api';

export const metadata: Metadata = {
  title: 'О клубе',
  description:
    'История и достижения ФК Арсенал-92 — детской футбольной школы Севастополя с 1992 года.',
};

export default async function OKlubePage() {
  const page = await getCmsPage('about');

  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">О клубе</h1>
          <p className="text-blue-300 text-lg">ФК Арсенал-92 с 1992 года в Севастополе</p>
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
