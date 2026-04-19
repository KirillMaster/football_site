import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Экипировка и снаряжение',
  description:
    'Спортивная экипировка футбольного клуба «Арсенал» Севастополь: бутсы, форма, зимние куртки. Заказ через Telegram.',
};

const products = [
  {
    id: 'boots',
    title: 'Профессиональные бутсы',
    price: 'от 1 199,00 руб.',
    description:
      'Футбольные бутсы — отличный подарок как маленькому болельщику, так и начинающей звезде футбола. Хотите купить детскую футбольную форму, бутсы, защиту? Обращайтесь, мы подберем вам лучшее решение по отличной цене!',
  },
  {
    id: 'kit',
    title: 'Спортивная форма — Лето 2025',
    price: 'от 1 999,00 руб.',
    description:
      'Администрация футбольного клуба АРСЕНАЛ предлагает широкий ассортимент спортивной и повседневной одежды. Гарантия качества и выгодные условия на групповые покупки. Отличная цена и возможность оперативной доставки.',
  },
  {
    id: 'jackets',
    title: 'Зимние дутые куртки — Зима 2025-2026',
    price: 'от 1 499,00 руб.',
    description:
      'Зимние спортивные куртки позволят не делать перерывов в тренировках даже при минусовой температуре. Удобная и теплая одежда. Отличное качество. Высокие стандарты в производстве при сохранении доступной цены.',
  },
];

const TELEGRAM_URL = 'https://t.me/s/arsenalarena';

export default function MagazinPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">ЭКИПИРОВКА</h1>
          <p className="text-blue-300 text-lg max-w-2xl">
            Гарантия высоких результатов и побед — это не только регулярные тренировки, но и форма.
            У нас вы можете приобрести наиболее востребованные элементы спортивной одежды.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  <span className="text-6xl">⚽</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-brand-red font-bold text-sm mb-2">{product.price}</div>
                  <h3 className="font-bold text-brand-blue text-lg mb-3 leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                    {product.description}
                  </p>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-center text-sm"
                  >
                    Заказать в Telegram
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order info */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
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
            . Принимаем заказы ежедневно.
          </p>
        </div>
      </section>
    </>
  );
}
