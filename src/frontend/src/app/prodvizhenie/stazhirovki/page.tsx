import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Стажировки в Европе',
  description:
    'Стажировки в академиях и клубах партнёров ФК «Арсенал» Севастополь в Сербии, Боснии, Словении, Хорватии и Испании.',
};

export default function StazhirovkiPage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-sm uppercase tracking-wide mb-2">
            <Link href="/prodvizhenie" className="hover:text-white">Proдвижение юных футболистов</Link>
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-3">Стажировки в Европе</h1>
          <p className="text-blue-300 text-lg max-w-3xl leading-relaxed">
            Программы стажировок в академиях и клубах партнёров
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-6 text-left mb-8">
            <p className="font-bold text-gray-800 mb-2">Раздел в разработке</p>
            <p className="text-gray-700 leading-relaxed">
              Подробное описание программы стажировок в европейских клубах будет добавлено
              в ближайшее время. Пока вы можете ознакомиться со смежными программами или
              связаться с нами напрямую.
            </p>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">
            ФК «Арсенал» Севастополь сотрудничает с футбольными агентами и клубами в Сербии,
            Боснии, Словении, Хорватии и Испании. Наши воспитанники регулярно проходят
            просмотры и стажировки в академиях партнёров.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/prodvizhenie/sbory" className="btn-secondary text-center">
              Сборы — подготовка к просмотру
            </Link>
            <Link href="/prodvizhenie/tryout-serbia" className="btn-primary text-center">
              TRYOUT в Сербии
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-10">
            По всем вопросам:&nbsp;
            <a href="https://t.me/Gurybuldi" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-medium hover:underline">
              Telegram @Gurybuldi
            </a>
            &nbsp;·&nbsp;
            <a href="mailto:ars2011sev@mail.ru" className="text-brand-blue font-medium hover:underline">
              ars2011sev@mail.ru
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
