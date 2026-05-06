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
    'Стоимость занятий в футбольном клубе «Арсенал» Севастополь: Standard — 4000₽, Standard+ — 5400₽, PRO — 6000₽ в месяц. Первое занятие бесплатно.',
};

const faq = [
  {
    q: 'Куда и когда нужно оплачивать абонемент?',
    a: 'Оплата производится до 10 числа каждого месяца на расчётный счёт АНО ФК «Арсенал».',
  },
  {
    q: 'Что входит в стоимость?',
    a: 'Всё указано в тарифах выше.',
  },
  {
    q: 'Входит ли в сумму абонемента стоимость игровой формы?',
    a: 'Комплект игровой формы предоставляется клубом спустя год занятий. Изначально форма приобретается родителями.',
  },
  {
    q: 'Нужно ли дополнительно платить за приобретаемый инвентарь?',
    a: 'Нет, весь инвентарь приобретается и обновляется клубом.',
  },
  {
    q: 'Могут ли родители посещать тренировки?',
    a: 'Мы не видим в этом никаких проблем и даже приветствуем это.',
  },
  {
    q: 'Нужно ли платить дополнительно, чтобы ребёнок играл в стартовом составе?',
    a: 'Нет, стартовый состав формируется тренером исходя из уровня воспитанников и поставленных на каждую игру задач. Абсолютно все дети у нас получают игровую практику.',
  },
  {
    q: 'Нужно ли дополнительно оплачивать клубу за организацию просмотров, стажировок, интенсивов в России и за рубежом?',
    a: 'Нет, мы не берём никаких комиссионных, вы несёте лишь расходы на трансфер, проживание и питание.',
  },
  {
    q: 'Можно ли заплатив определённую сумму попасть в европейскую команду?',
    a: 'Можно, но без нашего участия.',
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
              Первые 2 тренировки бесплатно — убедитесь, что мы именно то, что нужно вашему ребёнку
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8 max-w-3xl mx-auto leading-relaxed">
            Оплата до 10 числа каждого месяца. Лояльный, индивидуальный подход
            к каждой семье — вычеты по травмам и болезни перерасчитываются.
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
            Запишитесь прямо сейчас — первые 2 тренировки бесплатно!
          </p>
          <Link href="/zapisatsya" className="btn-primary bg-white text-brand-red hover:bg-gray-100 px-10 py-4 text-base">
            Записаться
          </Link>
        </div>
      </section>
    </>
  );
}
