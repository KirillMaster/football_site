import type { Metadata } from 'next';
import { getCoaches } from '@/lib/api';
import CoachCard from '@/components/CoachCard';
import { JsonLd } from '@/components/JsonLd';
import { getCoachSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Тренеры',
  description:
    'Тренерский состав футбольного клуба «Арсенал» Севастополь. Лицензия УЕФА категории C. Узнайте о каждом тренере клуба.',
};

export default async function TreneryPage() {
  const coaches = await getCoaches();

  return (
    <>
      <JsonLd data={coaches.map(getCoachSchema)} />

      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Тренеры</h1>
          <p className="text-blue-300 text-lg">
            Профессиональные специалисты с лицензиями UEFA и РФС
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy strip */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="section-title">Наш подход</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Каждый тренер нашего клуба проходит регулярное повышение квалификации.
            Мы сочетаем строгую спортивную дисциплину с индивидуальным подходом к каждому ребёнку.
          </p>
        </div>
      </section>
    </>
  );
}
