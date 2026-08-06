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

const SERBIA_ADVANTAGES = [
  {
    title: 'Системный отбор, а не просто «поездка»',
    text: 'Первые два дня на базе ФК «Zeleznik 1930» (Белград) — тестирование, чтобы определить подходящий по уровню клуб. Далее в течение недельного цикла под руководством европейских тренеров вы проходите просмотр в одном из балканских клубов. Это системный отбор с реальным шансом на контракт.',
  },
  {
    title: 'Уровень и опыт балканских академий',
    text: 'Балканы — кузница кадров для топ-чемпионатов. Здесь сложилась синергия европейского менталитета и эффективной системы подготовки, десятилетиями одной из лучших не только в Восточной Европе, но и в мире.',
  },
  {
    title: 'Дополнительная возможность',
    text: 'При желании можно продлить стажировку и пройти просмотр в нескольких клубах Сербии — для расширения выбора и получения большего числа предложений.',
  },
  {
    title: 'Мы не даём пустых обещаний',
    text: 'Мы предоставляем шанс и объективную оценку. Даже если вы не подойдёте клубам Суперлиги, мы найдём сильный клуб Первой лиги, где вы будете тренироваться, играть и прогрессировать, — а агентство будет в постоянном поиске вашего будущего.',
  },
];

const SERBIA_INCLUDED = [
  { icon: '🚐', title: 'Трансфер', desc: 'Встреча в аэропорту и все переезды по Сербии, включая трансферы между городами и клубами' },
  { icon: '🏠', title: 'Проживание', desc: 'Комфортное размещение на весь период стажировки' },
  { icon: '🍽', title: 'Питание', desc: 'Сбалансированный рацион, необходимый для восстановления спортсмена' },
  { icon: '⚽', title: 'Тренировочный процесс', desc: 'Поля, манежи, тренажёрные залы, восстановительные процедуры и тренировки под руководством европейских тренеров' },
  { icon: '🧑‍💼', title: 'Агентское сопровождение', desc: 'Заинтересованность в вашем продвижении и помощь в бытовых и спортивных вопросах 24/7' },
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

      {/* Serbia clubs internship */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-brand-red text-sm uppercase tracking-wide mb-2 font-semibold">🔥 Новое направление</div>
          <h2 className="section-title mb-4">Стажировки в сербских клубах</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            Мы согласовали с ISO возможность для наших юных футболистов стажироваться
            и проходить индивидуальные просмотры в сербских клубах. Предлагаем не просто
            «поездку», а системный отбор с реальным шансом на контракт.
          </p>

          <div className="space-y-4 mb-10">
            {SERBIA_ADVANTAGES.map((item) => (
              <div key={item.title} className="flex gap-4 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <span className="text-brand-red text-xl flex-shrink-0">🧪</span>
                <div>
                  <h3 className="font-bold text-brand-blue mb-1">{item.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-blue text-white rounded-2xl p-6 sm:p-8 mb-4">
            <h3 className="text-xl font-black mb-2">Доступная стоимость и никаких лишних забот</h3>
            <p className="text-blue-200 text-sm leading-relaxed mb-5">
              Не нужно оформлять визу, минимальный обязательный пакет документов.
              Стоимость поездки — демократичная по сравнению с Западной Европой.
            </p>
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-4xl font-black">600&nbsp;€</span>
              <span className="text-blue-300 text-sm">базовая стоимость недельного тренировочного цикла — символическая сумма для Европы</span>
            </div>
            <p className="text-blue-200 text-sm font-semibold mb-4">В стоимость входит полное сопровождение:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERBIA_INCLUDED.map((item) => (
                <div key={item.title} className="flex gap-3 bg-white/10 border border-white/20 rounded-lg p-4">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm mb-0.5">{item.title}</div>
                    <div className="text-blue-200 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-blue-300 text-xs leading-relaxed mt-5">
              * Точная стоимость рассчитывается индивидуально — в зависимости от выбранного клуба,
              количества недельных циклов и трансферов. Авиаперелёт до Сербии оплачивается
              отдельно (организуем встречу).
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-brand-blue font-bold text-lg leading-relaxed mb-2">
              Балканы — кузница кадров для топ-чемпионатов Европы
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Десятилетиями здесь готовят игроков мирового уровня. Теперь эта система открыта
              для тебя. Поверь в себя и стань ближе к профессиональному контракту!
            </p>
            <p className="text-gray-700 font-semibold mb-4">Оставь заявку прямо сейчас:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="tel:+79788130982" className="btn-primary text-center">📞 +7-978-813-09-82</a>
              <a href="mailto:ars2011sev@mail.ru" className="btn-secondary text-center">📧 ars2011sev@mail.ru</a>
              <a href="https://instagram.com/fc92arsenal" target="_blank" rel="noopener noreferrer" className="btn-outline text-center">📱 Instagram @fc92arsenal</a>
              <a href="https://t.me/Gurybuldi" target="_blank" rel="noopener noreferrer" className="btn-outline text-center">✈️ Telegram @Gurybuldi</a>
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
