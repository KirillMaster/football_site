import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCmsPage, getCoaches } from '@/lib/api';

export const metadata: Metadata = {
  title: 'О клубе',
  description:
    'История и достижения ФК Арсенал-92 — детской футбольной школы Севастополя с 1992 года. Профессиональные тренеры с лицензией УЕФА.',
};

const advantages = [
  { icon: '🏆', title: 'Профессиональные тренеры', text: 'Тренерская лицензия категории С УЕФА. Мы любим детей и знаем, как привить любовь к спорту и добиться поставленных целей!' },
  { icon: '⚽', title: 'Современная методика', text: 'Обучение игре в футбол проводится в соответствии с методиками и рекомендациями ведущих мировых академий. Мы делаем упор на качество подготовки, а не количество детей в школе.' },
  { icon: '👫', title: 'Группы для начинающих', text: 'Не важно, есть ли у вашего ребенка опыт. Мы учим с нуля и помогаем каждому раскрыть свой потенциал. Группы формируются не по возрасту, а по уровню подготовки.' },
  { icon: '🤝', title: 'Просмотры, стажировки', text: 'Мы на прямой связи с селекционерами академий ФК «Краснодар», «Ростов», «Сочи», «Локомотив», «Строгино», ЦСКА (Москва), «Акрон-Академия Коноплёва». Ежегодно наши воспитанники проходят просмотры в данных клубах.' },
  { icon: '🎯', title: 'Участие в турнирах', text: 'Наши команды участвуют в Первенствах Севастополя, Симферополя, Крыма, турнирах «Локобол» и «Кожаный мяч», а также в общероссийских турнирах в Москве, Санкт-Петербурге, Казани, Сочи, Краснодаре.' },
  { icon: '📍', title: 'Удобное расположение', text: 'Тренировки проходят на спортивном комплексе СОШ 61 (ул. Косарева, 12) в пешей доступности от остановок транспорта (маршруты №5, 16, 83, 84, 110).' },
  { icon: '💪', title: 'Мы верим в каждого ребёнка', text: 'У нас играют все дети, а не сильнейшие в угоду результату.' },
  { icon: '🧠', title: 'Воспитание личности', text: 'Огромное внимание уделяем становлению характера каждого воспитанника, привитию правильных ценностей, любви к спорту и здоровому образу жизни.' },
];

export default async function OKlubePage() {
  const [page, coaches] = await Promise.all([getCmsPage('about'), getCoaches()]);

  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">О клубе</h1>
          <p className="text-blue-300 text-lg">Детский футбольный клуб «АРСЕНАЛ», Севастополь</p>
        </div>
      </section>

      {/* CMS content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="prose-club"
            dangerouslySetInnerHTML={{ __html: page?.content ?? '' }}
          />
        </div>
      </section>

      {/* Почему выбирают нас */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">{a.icon}</span>
                  <div>
                    <h3 className="font-bold text-brand-blue mb-1">{a.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{a.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Тренеры */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Наши тренеры</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {coaches.map((c) => (
              <div key={c.id} className="text-center">
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-3">
                  {c.photoUrl && (
                    <Image src={c.photoUrl} alt={c.name} fill className="object-cover object-top" />
                  )}
                </div>
                <h3 className="font-bold text-gray-900">{c.name}</h3>
                <p className="text-sm text-brand-red">{c.role}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/trenery" className="btn-secondary inline-flex">
              Подробнее о тренерах
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-brand-red/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-brand-blue mb-3">Запишитесь на бесплатное занятие</h2>
          <p className="text-gray-600 mb-6">Первые 2 тренировки бесплатно. Убедитесь сами!</p>
          <Link href="/zapisatsya" className="btn-primary text-base px-8 py-4 inline-flex">
            Записаться
          </Link>
        </div>
      </section>
    </>
  );
}
