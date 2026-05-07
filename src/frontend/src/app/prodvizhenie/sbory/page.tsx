import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Сборы — подготовка к просмотру в Европе',
  description:
    'Подготовка юных футболистов на сборах ФК «Арсенал» Севастополь на берегу Чёрного моря к просмотрам в европейских клубах. Недельный, месячный и сезонный циклы.',
};

const benefits = [
  'Развитие мобильности, стабильности суставов, физических качеств: ловкости, быстроты, координации, взрывной силы, гибкости.',
  'Развитие техники владения мячом: дриблинг, удар, приём, передачи.',
  'Развитие игрового мышления и индивидуальной тактической грамотности.',
  'Повышение мотивации и осознание необходимости не останавливаться на достигнутом и впахивать для достижения цели.',
  'Ограниченное время пользования гаджетами (2 раза в день по 15 минут).',
  'Интересный сбалансированный распорядок дня: зарядка на берегу моря, две тренировки, контрольные матчи, прогулки, чтение, шахматы, рисование, уроки английского и испанского, уличные игры, обучение навыкам работ в саду и по дому, посещение моря, экскурсии во Владимирский собор, Музей 35 Береговой Батареи, Парк миниатюр в Бахчисарае, прогулки по городу.',
  'Отличная инфраструктура: бассейн, отремонтированные комфортные номера и столовая, актовый зал для теоретических занятий и общения, мангал, полноценное поле с новым газоном, море, хвойный парк, спортивные площадки, тренажёры — всё в пешей доступности.',
  'Четырёхразовое правильное, сбалансированное, спортивное питание, приготовленное с любовью и заботой из свежих продуктов. Никакой вредной пищи и газировок.',
  'Задания для развития памяти, быстроты мышления, объёма внимания.',
  'Комплект экипировки: игровая форма, тренировочный костюм.',
  'Работа под руководством тренеров из Испании и Сербии, которые, определив ваш уровень, подбирают европейский клуб для просмотра.',
];

const outcomes = [
  'Возможность попробовать свои силы в одном из клубов в Испании, Сербии, Боснии, Словении, Хорватии — с агентским сопровождением.',
  'Возможность принять участие в просмотре юных талантов, который пройдёт в Белграде 5–15 июля с участием руководителей, тренеров, скаутов европейских клубов и агентов.',
  'Возможность принять участие в сборной команде в турнирах в Боснии, Сербии и Греции (игроки 2015, 2016, 2017 г.р.).',
];

const packages = [
  {
    title: 'Недельный цикл',
    subtitle:
      'Под руководством тренера-агента ФК «Црвена Звезда» (Сербия) или FC Nervion (Севилья, Испания)',
    dates: '4 – 11 июня',
    price: '60 000 ₽ / 700 €',
    highlight: false,
  },
  {
    title: 'Месячный цикл',
    subtitle:
      'Подготовка к просмотру в Сербии (5–15 июля), включая четырёхдневный интенсив с тренером FC Nervion (Севилья, Испания)',
    dates: '2 – 30 июня',
    price: '196 400 ₽ / 2 200 €',
    bonus: '+ 10% скидка на TRYOUT в Сербии',
    highlight: true,
  },
  {
    title: 'Подготовка в течение всего лета',
    subtitle: 'Полная программа межсезонной подготовки',
    dates: '2 июня – 29 августа',
    price: '567 200 ₽ / 6 450 €',
    highlight: false,
  },
];

export default function SboryPage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-sm uppercase tracking-wide mb-2">
            <Link href="/prodvizhenie" className="hover:text-white">Proдвижение юных футболистов</Link>
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Сборы — подготовка к просмотру в Европе
          </h1>
          <p className="text-blue-300 text-lg max-w-3xl leading-relaxed">
            ФК «Арсенал» Севастополь &amp; International Scout Office
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-gray-700 text-base leading-relaxed mb-4">
            Центр футбольной подготовки на базе ФК «Арсенал» (Севастополь) приглашает юных
            футболистов пройти подготовку на сборах на берегу Чёрного моря и набрать форму
            для участия в просмотрах в европейские клубы и в формируемых сборных командах
            2015, 2016, 2017 годов рождения в летних турнирах в Боснии и Греции.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="section-title mb-8">Что вы получите</h2>
          <ul className="space-y-3">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-4">
                <span className="text-green-500 flex-shrink-0 mt-0.5">✔️</span>
                <span className="text-gray-700 text-sm leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="section-title mb-4">По итогам подготовки</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Вы получаете чёткий план дальнейших действий:
          </p>
          <ul className="space-y-3">
            {outcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-brand-red flex-shrink-0 mt-1">→</span>
                <span className="text-gray-700 text-sm leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-2">Варианты программ</h2>
          <p className="text-center text-gray-600 mb-10">
            Все программы под руководством международных тренеров-агентов
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {packages.map((p) => (
              <article
                key={p.title}
                className={
                  p.highlight
                    ? 'rounded-2xl p-6 flex flex-col bg-brand-blue text-white shadow-2xl ring-4 ring-brand-red ring-offset-2'
                    : 'rounded-2xl p-6 flex flex-col bg-white border-2 border-gray-200 shadow-md'
                }
              >
                {p.highlight && (
                  <div className="self-start bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                    Рекомендуем
                  </div>
                )}
                <h3 className={p.highlight ? 'text-xl font-bold mb-2 text-white' : 'text-xl font-bold mb-2 text-brand-blue'}>
                  {p.title}
                </h3>
                <p className={p.highlight ? 'text-sm leading-relaxed mb-4 text-blue-100' : 'text-sm leading-relaxed mb-4 text-gray-600'}>
                  {p.subtitle}
                </p>
                <div className="mt-auto pt-4 border-t border-white/20 space-y-2">
                  <div className={p.highlight ? 'text-sm text-blue-200' : 'text-sm text-gray-500'}>
                    📅 {p.dates}
                  </div>
                  <div className={p.highlight ? 'text-2xl font-black text-white' : 'text-2xl font-black text-brand-red'}>
                    {p.price}
                  </div>
                  {p.bonus && (
                    <div className={p.highlight ? 'text-xs text-yellow-300' : 'text-xs text-green-600'}>
                      {p.bonus}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-700 leading-relaxed mb-6">
            Мы работаем круглогодично и готовы принять юных футболистов со всего мира,
            позаботиться об их Pro-движении с участием агентства и европейских тренеров,
            с которыми сотрудничаем.
          </p>
          <Link href="/zapisatsya" className="btn-primary text-base px-8 py-3 inline-flex">
            Записаться на сборы
          </Link>
        </div>
      </section>
    </>
  );
}
