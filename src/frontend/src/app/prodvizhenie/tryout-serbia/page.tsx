import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TRYOUT 2026 в Сербии — просмотр юных футболистов',
  description:
    'Международный просмотр юных футболистов 2006–2012 г.р. на базе ФК «Zeleznik 1930» в Белграде, 5–15 июля 2026. Совместно с International Scout Office (Словения).',
};

const STADIUM_PHOTOS = [
  'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/zheleznik_stadium_01.jpg',
  'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/zheleznik_stadium_02.jpg',
  'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/zheleznik_stadium_03.jpg',
];

const included = [
  'Проживание',
  '3-разовое питание',
  'Тренировки под руководством сербских специалистов (УЕФА A, УЕФА Pro)',
  'Тестирование',
  'Контрольные игры',
  'Сопровождение скаута агентства',
];

const opportunities = [
  'Приглашения в структуру европейских клубов',
  'Предложение о сотрудничестве с футбольным агентством',
  'Получение стипендии от агентства',
  'Помощь агента в оформлении необходимых документов',
  'Проживание и питание за счёт клуба или агентства',
];

const conditions = [
  'Возраст 14–20 лет',
  'Для игроков младше 16 лет необходим сопровождающий (тренер, родитель) с нотариально заверенной доверенностью',
  'Заполнить и прислать заявку на ars2011sev@mail.ru',
  'Произвести предоплату, получив подтверждение участия',
  'Оформление визы не требуется',
];

export default function TryoutSerbiaPage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-sm uppercase tracking-wide mb-2">
            <Link href="/prodvizhenie" className="hover:text-white">Proдвижение юных футболистов</Link>
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            TRYOUT 2026 <span className="text-brand-red">| Сербия</span>
          </h1>
          <p className="text-blue-300 text-lg max-w-3xl leading-relaxed">
            ФК «Арсенал» Севастополь &amp; International Scout Office (Словения)
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            Центр футбольной подготовки на базе ФК «Арсенал» (Севастополь) и футбольное
            агентство International Scout Office (Словения) приглашают юных футболистов
            <strong> 2006–2012 г.р.</strong> принять участие в просмотре молодых дарований
            в Сербии — <strong>«TRYOUT 2026 | Сербия»</strong>.
          </p>

          <div className="bg-brand-red/5 border-l-4 border-brand-red rounded-r-lg p-5 mb-6">
            <p className="text-2xl font-black text-brand-red mb-2">🔥 ТВОЙ ШАНС ИГРАТЬ В ЕВРОПЕ 🔥</p>
            <p className="text-gray-700">
              С <strong>5 по 15 июля</strong> на базе ФК <strong>«Zeleznik 1930»</strong> (Белград)
              пройдёт международный просмотр юных футболистов.
            </p>
          </div>

          <p className="text-gray-700 leading-relaxed">
            🎯 Ваш шанс продемонстрировать свои способности руководителям академий
            Сербии, Боснии, Словении, Хорватии, скаутам спортивных агентств и
            селекционерам европейских футбольных клубов.
          </p>
        </div>
      </section>

      {/* Stadium photos */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-2">Стадион ФК «Zeleznik 1930»</h2>
          <p className="text-center text-gray-600 mb-8">Белград, Сербия</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STADIUM_PHOTOS.map((src, i) => (
              <div key={src} className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Стадион ФК «Zeleznik 1930» в Белграде, фото ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6 leading-relaxed">
            Инфраструктура: 3 натуральных футбольных поля, зона восстановления, тренажёрный зал.
          </p>
        </div>
      </section>

      {/* Cost */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border-2 border-brand-blue/20 shadow-md p-8">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-green-600 text-2xl">✅</span>
              <h2 className="text-2xl font-black text-brand-blue">Стоимость участия</h2>
            </div>
            <div className="text-5xl font-black text-brand-red mb-6">1 500 €</div>
            <h3 className="font-bold text-gray-800 mb-3">В стоимость включено:</h3>
            <ul className="space-y-2">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-500 flex-shrink-0">✔️</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="section-title mb-2">🏆 После отбора лучшие игроки получат</h2>
          <ul className="space-y-3 mt-6">
            {opportunities.map((o) => (
              <li key={o} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-4">
                <span className="text-brand-red flex-shrink-0">→</span>
                <span className="text-gray-700 text-sm leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-5 mb-8">
            <p className="font-bold text-gray-800">📅 Дедлайн заявок: 1 июля 2026</p>
          </div>
          <h2 className="section-title mb-6">Условия участия</h2>
          <ul className="space-y-3">
            {conditions.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-brand-blue font-bold flex-shrink-0">{i + 1}.</span>
                <span className="text-gray-700 text-sm leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contacts */}
      <section className="py-12 bg-brand-blue text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-black mb-6">📩 Контакты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <a
              href="https://t.me/Gurybuldi"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-800 hover:bg-blue-700 rounded-lg p-4 transition-colors"
            >
              <div className="text-blue-300 text-xs uppercase tracking-wide mb-1">Telegram</div>
              <div className="font-bold">@Gurybuldi</div>
            </a>
            <a
              href="https://wa.me/79788130982"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-800 hover:bg-blue-700 rounded-lg p-4 transition-colors"
            >
              <div className="text-blue-300 text-xs uppercase tracking-wide mb-1">WhatsApp</div>
              <div className="font-bold">+7-978-813-09-82</div>
            </a>
            <a
              href="mailto:ars2011sev@mail.ru"
              className="bg-blue-800 hover:bg-blue-700 rounded-lg p-4 transition-colors"
            >
              <div className="text-blue-300 text-xs uppercase tracking-wide mb-1">Email</div>
              <div className="font-bold text-sm">ars2011sev@mail.ru</div>
            </a>
          </div>
          <p className="text-blue-200 text-sm mt-8 leading-relaxed">
            ⚽ Репост приветствуется! Отправь это сообщение в чаты команд и друзьям —
            возможно, именно ты поможешь кому-то попасть в профессиональный футбол.
          </p>
        </div>
      </section>
    </>
  );
}
