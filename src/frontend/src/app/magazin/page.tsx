import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Магазин — ДФК Арсенал Севастополь',
  description:
    'Фирменная экипировка и атрибутика ДФК Арсенал-92: форма, мячи, аксессуары, спортивные костюмы. Заказ через Telegram — доставка по Севастополю.',
};

const categories = [
  {
    id: 'forma',
    title: 'Форма',
    icon: '👕',
    description:
      'Официальная игровая форма клуба «Арсенал». Домашний и выездной комплект — футболка, шорты, гетры с клубной символикой.',
  },
  {
    id: 'myachi',
    title: 'Мячи',
    icon: '⚽',
    description:
      'Тренировочные и матчевые мячи размеров 3, 4 и 5 с логотипом клуба. Подходят для всех возрастных групп.',
  },
  {
    id: 'aksessuary',
    title: 'Аксессуары',
    icon: '🧢',
    description:
      'Шапки, кепки, шарфы, рюкзаки и сумки с эмблемой «Арсенала». Отличный подарок для юного футболиста.',
  },
  {
    id: 'kostum',
    title: 'Спортивный костюм',
    icon: '🥋',
    description:
      'Фирменный спортивный костюм клуба — куртка и брюки. Удобен для тренировок и повседневной носки.',
  },
];

const TELEGRAM_URL = 'https://t.me/s/arsenalarena';

export default function MagazinPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Магазин «Арсенал»
          </h1>
          <p className="text-blue-300 text-lg">
            Фирменная экипировка и атрибутика детского футбольного клуба
          </p>
        </div>
      </section>

      {/* Product categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Каталог</h2>
            <p className="section-subtitle">
              Вся экипировка выполнена в цветах клуба и доступна для заказа через Telegram
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col"
              >
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="font-bold text-brand-blue text-xl mb-2">
                  {cat.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                  {cat.description}
                </p>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-center"
                >
                  Заказать в Telegram
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order info */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-red/5 border border-brand-red/20 rounded-2xl p-8 text-center">
            <p className="text-gray-700 text-base leading-relaxed">
              Для заказа пишите нам в Telegram —{' '}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-blue hover:underline"
              >
                @arsenalarena
              </a>
              . Доставка по Севастополю бесплатна при заказе от 3000₽.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
