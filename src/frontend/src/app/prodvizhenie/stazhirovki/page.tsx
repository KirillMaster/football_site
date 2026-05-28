import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Просмотры и стажировки — ФК «Арсенал» Севастополь',
  description:
    'Прямой контакт с академиями «Краснодар», «Локомотив», «Ростов», ЦСКА, EFC Antalya и сотрудничество с International Scouting Office (Словения). Ежегодные просмотры и стажировки.',
};

const RUSSIAN_CLUBS = [
  '«Краснодар»',
  '«Ростов»',
  '«Сочи»',
  '«Локомотив»',
  '«Строгино»',
  '«Родина»',
  '«Чертаново»',
  '«Космос»',
  'ЦСКА (Москва)',
  '«Акрон-Академия Коноплёва»',
  '«Кубань» (Афипский)',
  '«Ахмат/Рамзан» (Грозный)',
  'EFC (Анталья, Турция)',
];

export default function StazhirovkiPage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-sm uppercase tracking-wide mb-2">
            <Link href="/prodvizhenie" className="hover:text-white">Proдвижение юных футболистов</Link>
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-3">Просмотры и стажировки</h1>
          <p className="text-blue-300 text-lg max-w-3xl leading-relaxed">
            Прямой выход на ведущие академии России и европейские клубы
          </p>
        </div>
      </section>

      {/* Russian clubs */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="section-title mb-4">Академии и клубы России</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            Прямой контакт с селекционерами академий — ежегодно наши воспитанники
            стажируются и проходят просмотры в этих клубах:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {RUSSIAN_CLUBS.map((club) => (
              <div key={club} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <span className="text-brand-red flex-shrink-0">⚽</span>
                <span className="text-gray-800 font-medium">{club}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ISO partnership */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <div className="text-blue-300 text-sm uppercase tracking-wide mb-2">Новое партнёрство с апреля 2026</div>
              <h2 className="text-2xl md:text-3xl font-black mb-4">
                International Scouting Office
                <span className="block text-blue-300 text-xl mt-1">(Словения)</span>
              </h2>
              <p className="text-blue-200 leading-relaxed mb-4">
                С апреля 2026 года налажено сотрудничество со спортивным агентством
                <strong className="text-white"> «International Scouting Office»</strong> (Словения),
                благодаря чему наши юные футболисты имеют возможность проходить
                стажировки и просмотры в клубах:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Сербии', 'Словении', 'Боснии', 'Хорватии', 'Черногории'].map((country) => (
                  <span key={country} className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm text-white">
                    {country}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">🇸🇮</div>
                <div className="font-bold text-white text-sm mb-1">International Scouting Office</div>
                <div className="text-blue-300 text-xs">Любляна, Словения</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tryout Serbia CTA */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="section-title mb-3">Ближайший просмотр в Белграде</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            5–15 июля 2026 на базе ФК «Zeleznik 1930» в Белграде пройдёт
            международный просмотр юных футболистов 2006–2012 г.р.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link href="/prodvizhenie/tryout-serbia" className="btn-primary text-center">
              Подробнее о TRYOUT Сербия
            </Link>
            <Link href="/prodvizhenie/sbory" className="btn-secondary text-center">
              Сборы — подготовка к просмотру
            </Link>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-700 leading-relaxed mb-6">
            По всем вопросам стажировок и просмотров обращайтесь напрямую:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/Gurybuldi"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center"
            >
              Telegram @Gurybuldi
            </a>
            <a
              href="mailto:ars2011sev@mail.ru"
              className="btn-secondary text-center"
            >
              ars2011sev@mail.ru
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Игорь Кулиев, генеральный директор АНО ФК «Арсенал» Севастополь · тел.&nbsp;8-978-813-09-82
          </p>
        </div>
      </section>
    </>
  );
}
