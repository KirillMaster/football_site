import type { Metadata } from 'next';
import Link from 'next/link';
import { getPricingPlans } from '@/lib/api';
import PricingCard from '@/components/PricingCard';
import { JsonLd } from '@/components/JsonLd';
import { getCourseSchema } from '@/lib/schema';
import { mockGroups } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Цены на тренировки',
  description:
    'Стоимость занятий в ФК Арсенал-92: Standard — 4000₽, Standard+ — 5400₽, PRO — 6000₽ в месяц. Первое занятие бесплатно.',
};

const faq = [
  {
    q: 'Можно ли посетить пробное занятие?',
    a: 'Да! Первое занятие всегда бесплатно. Запишитесь онлайн или позвоните нам.',
  },
  {
    q: 'Когда нужно платить?',
    a: 'Оплата производится ежемесячно до 5-го числа текущего месяца.',
  },
  {
    q: 'Есть ли скидки для нескольких детей из одной семьи?',
    a: 'Да, при записи двух и более детей из одной семьи предоставляется скидка 10%.',
  },
  {
    q: 'Что входит в стоимость?',
    a: 'Занятия с тренером, форма клуба (при длительной подписке), участие в товарищеских матчах. Экипировка и инвентарь включены в план PRO.',
  },
];

export default async function CenyPage() {
  const plans = await getPricingPlans();

  return (
    <>
      <JsonLd data={mockGroups.map(getCourseSchema)} />

      {/* Hero */}
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Цены</h1>
          <p className="text-blue-300 text-lg">
            Прозрачная стоимость — без скрытых платежей
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Выберите план</h2>
            <p className="section-subtitle">
              Первое занятие — бесплатно для всех новых учеников
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            * Оплата ежемесячно. Скидка 10% при записи двух и более детей из одной семьи.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="section-title text-center mb-8">Часто задаваемые вопросы</h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <div key={item.q} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-red text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Готовы начать?</h2>
          <p className="text-red-100 mb-8">
            Запишитесь прямо сейчас — первое занятие бесплатно!
          </p>
          <Link href="/zapisatsya" className="btn-primary bg-white text-brand-red hover:bg-gray-100 px-10 py-4 text-base">
            Записаться
          </Link>
        </div>
      </section>
    </>
  );
}
