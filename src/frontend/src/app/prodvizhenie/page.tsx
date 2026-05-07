import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Proдвижение юных футболистов',
  description:
    'Программы продвижения юных футболистов ФК «Арсенал» Севастополь совместно с International Scout Office: сборы для подготовки к просмотрам, TRYOUT в Сербии, стажировки в европейских клубах.',
};

const sections = [
  {
    href: '/prodvizhenie/sbory',
    title: 'Сборы — подготовка к просмотру в Европе',
    description:
      'Подготовка на сборах на берегу Чёрного моря под руководством тренеров из Испании и Сербии. Недельный, месячный или сезонный цикл.',
    cta: 'Подробнее',
  },
  {
    href: '/prodvizhenie/tryout-serbia',
    title: 'TRYOUT в Сербии',
    description:
      'Международный просмотр юных футболистов 2006–2012 г.р. на базе ФК «Zeleznik 1930» в Белграде, 5–15 июля 2026.',
    cta: 'Подробнее',
  },
  {
    href: '/prodvizhenie/stazhirovki',
    title: 'Стажировки в Европе',
    description:
      'Стажировки в академиях и клубах партнёров в Сербии, Боснии, Словении, Хорватии, Испании.',
    cta: 'Подробнее',
  },
];

export default function ProdvizheniePage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Pro<span className="text-brand-red">движение</span> юных футболистов
          </h1>
          <p className="text-blue-300 text-lg max-w-3xl leading-relaxed">
            ФК «Арсенал» совместно с International Scout Office — программы для тех,
            кто ставит перед собой цель играть в профессиональном футболе в России и Европе.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((s) => (
              <article
                key={s.href}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <h2 className="font-bold text-brand-blue text-lg mb-3 leading-tight">
                  {s.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                  {s.description}
                </p>
                <Link
                  href={s.href}
                  className="btn-primary text-center text-sm"
                >
                  {s.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
