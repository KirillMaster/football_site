import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCoaches, getNewsPage, getPricingPlans, getSiteSettings, getPartners, getReviews } from '@/lib/api';
import CoachCard from '@/components/CoachCard';
import NewsCard from '@/components/NewsCard';
import PricingCard from '@/components/PricingCard';
import { JsonLd } from '@/components/JsonLd';
import { getSportsClubSchema, getWebSiteSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Футбольный клуб «Арсенал» Севастополь — Детская футбольная школа',
  description:
    'Детская футбольная школа «Арсенал» в Севастополе. 64 воспитанника 6–16 лет. Лицензия УЕФА C. Открыт набор 2026. Запишитесь на пробное занятие!',
  openGraph: { type: 'website' },
};

export default async function HomePage() {
  const [coaches, newsData, plans, settings, partners, reviews] = await Promise.all([
    getCoaches(),
    getNewsPage(1, 3),
    getPricingPlans(),
    getSiteSettings(),
    getPartners(),
    getReviews(),
  ]);

  return (
    <>
      <JsonLd data={[getSportsClubSchema(), getWebSiteSchema()]} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-brand-blue text-white overflow-hidden min-h-[700px] flex items-center">
        {/* Self-hosted looping video background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/promo_1.jpg"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
          >
            <source src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/hero_video_new.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/40 rounded-full px-4 py-1.5 text-sm text-red-300 mb-6">
              <span className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
              Открыт набор 2026
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
              Футбольный клуб <span className="text-brand-red">«Арсенал»</span>
              <span className="block text-3xl md:text-4xl lg:text-5xl mt-2">Севастополь</span>
            </h1>
            <p className="text-base md:text-lg text-blue-200 leading-relaxed mb-8">
              Мы не обещаем, что ваши дети станут чемпионами и будут завоёвывать кубки — мы не ставим результаты во главу угла.
              Идеология клуба: <span className="text-white font-semibold">фокус на развитии каждого ребёнка</span>, похвала за усилия,
              цели, ориентированные на индивидуальное мастерство. Наша задача — создать среду, в которой ребёнок обретёт
              мотивацию, уверенность и любовь к спорту на всю жизнь.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/zapisatsya" className="btn-primary text-base px-8 py-4">
                Записаться
              </Link>
              <Link href="/gruppy" className="btn-outline text-base px-8 py-4 border-white text-white hover:bg-white hover:text-brand-blue">
                Наши группы
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm">
              {[
                { value: '64', label: 'воспитанника' },
                { value: '6–16', label: 'лет' },
                { value: 'УЕФА C', label: 'лицензия тренера' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-blue-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About strip ──────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50" id="o-nas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">О клубе</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ФК «Арсенал» — это сплочённая команда тренеров, родителей, детей и наших друзей.
                В июле 2022 года Игорь Кулиев воплотил свою мечту в жизнь и основал АНО «Футбольный клуб «Арсенал».
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Мы пытаемся сломать стереотип — не гонимся за количеством, делая акцент на качестве подготовки
                и раскрытии потенциала каждого воспитанника. Группы формируем по способностям, а не по возрасту.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'воспитанников 6–16 лет', value: '64' },
                  { label: 'лицензия тренера', value: 'УЕФА C' },
                  { label: 'основан', value: 'июль 2022' },
                  { label: 'пробное занятие', value: 'бесплатно' },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="font-bold text-brand-red text-sm">{item.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/o-klube" className="btn-secondary inline-flex">
                Подробнее о клубе
              </Link>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/2.jpg"
                alt="Тренировка футбольного клуба «Арсенал» Севастополь"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── От первого лица ──────────────────────────────────────── */}
      <section className="py-16 bg-white" id="ot-pervogo-lica">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">От первого лица</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/igor_3.jpg"
                alt="Кулиев Игорь Рамизович"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <div className="text-brand-red text-sm font-bold uppercase tracking-wide mb-1">Генеральный директор и главный тренер</div>
              <h3 className="text-2xl font-black text-brand-blue mb-1">ФК «Арсенал» Севастополь</h3>
              <h4 className="text-xl font-bold text-gray-700 mb-6">Кулиев Игорь Рамизович</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Мы развиваем детей, а не компании, производящие грамоты, кубки и медали — такова наша миссия.
                Она помогает нам не сбиваться с выбранного правильного пути. Наши тренеры работают с детьми,
                а не командой или результатами.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-3 italic border-l-2 border-brand-red pl-4">
                Хорошие тренеры тренируют физические качества, а великие — людей. С самооценкой у нас всё в порядке,
                мы стремимся занять места во второй категории.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Мы никогда не ставим результат во главу угла, нам важно воспитать индивидуально сильного игрока.
                Наши дети стажируются и проходят просмотры в академиях «Строгино», «Локомотива», «Краснодара»,
                «Ахмата», «Кубани», готовятся к просмотрам в Европе — в EFC Antalya (Турция) и FC Nervion (Испания).
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Показательно, что несмотря на приглашения ведущих академий, дети совместно с родителями
                принимают решение оставаться в «Арсенале». Один из воспитанников уже перешёл в ФК «Раднички» (Сербия);
                налажены контакты с клубами Черногории и Турции. В 21 веке все дороги для детей открыты —
                всё зависит исключительно от эффективности нашей работы.
              </p>
              <h5 className="font-bold text-gray-900 mb-2">Принципы работы клуба:</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-brand-red font-bold flex-shrink-0">а)</span> Фокус на развитии каждого ребёнка, а не на результатах команды;</li>
                <li className="flex gap-2"><span className="text-brand-red font-bold flex-shrink-0">б)</span> Хвалим усилия, а не результаты матчей;</li>
                <li className="flex gap-2"><span className="text-brand-red font-bold flex-shrink-0">в)</span> Цели ориентированы на мастерство каждого, а не на результаты команды.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Events ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100" id="sobytiya">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">События школы</h2>
              <p className="text-gray-500 text-sm">Следите за нашими новостями, акциями и турнирами</p>
            </div>
            <Link href="/novosti" className="text-brand-red hover:underline text-sm font-medium">
              Все события
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsData.data.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                href={`/novosti/${article.slug}`}
                className="group bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-brand-red hover:shadow-md transition-all"
              >
                <div className="text-brand-red text-xs font-semibold uppercase tracking-wide mb-2">
                  {new Date(article.publishedAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </div>
                <h3 className="font-bold text-gray-900 mb-3 group-hover:text-brand-red transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coaches preview ──────────────────────────────────────── */}
      <section className="py-16" id="trenery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Наши тренеры</h2>
            <p className="section-subtitle">Опытные специалисты с лицензиями UEFA и РФС</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coaches.slice(0, 4).map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/trenery" className="btn-outline">
              Все тренеры
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────── */}
      <section className="py-16 bg-gray-50" id="ceny">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Стоимость занятий</h2>
            <p className="section-subtitle">Выберите подходящий план для вашего ребёнка</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/ceny" className="text-brand-red hover:underline text-sm font-medium">
              Подробнее о тарифах
            </Link>
          </div>
        </div>
      </section>

      {/* ── News preview ─────────────────────────────────────────── */}
      <section className="py-16" id="novosti">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">Новости</h2>
              <p className="text-gray-500 text-sm">Последние события клуба</p>
            </div>
            <Link href="/novosti" className="text-brand-red hover:underline text-sm font-medium">
              Все новости
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsData.data.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50" id="otzyvy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Отзывы родителей</h2>
            <p className="section-subtitle">Что говорят семьи наших воспитанников</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.slice(0, 4).map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&quot;{review.text}&quot;</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">{review.author}</span>
                  {review.childAge && (
                    <span className="text-xs text-gray-400">Ребёнок {review.childAge} лет</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ─────────────────────────────────────────────── */}
      {partners.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="section-title">Наши партнёры</h2>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.websiteUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                  title={partner.name}
                >
                  {partner.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold text-lg">{partner.name}</span>
                  )}
                  <span className="text-xs text-gray-400 group-hover:text-gray-700 transition-colors">{partner.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-brand-red text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Запишите ребёнка на пробное занятие
          </h2>
          <p className="text-red-100 text-lg mb-8">
            Первое занятие — бесплатно. Мы работаем с детьми от 5 до 17 лет.
          </p>
          <Link href="/zapisatsya" className="inline-flex btn-primary bg-white text-brand-red hover:bg-gray-100 text-base px-10 py-4">
            Записаться бесплатно
          </Link>
        </div>
      </section>

      {/* ── Contacts strip ───────────────────────────────────────── */}
      <section className="py-16 bg-brand-blue text-white" id="kontakty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-brand-red text-3xl mb-3">📍</div>
              <h3 className="font-bold text-lg mb-2">Адрес</h3>
              <p className="text-blue-300 text-sm">{settings.address}</p>
            </div>
            <div>
              <div className="text-brand-red text-3xl mb-3">📞</div>
              <h3 className="font-bold text-lg mb-2">Телефоны</h3>
              {settings.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                  className="block text-blue-300 hover:text-white text-sm"
                >
                  {phone}
                </a>
              ))}
            </div>
            <div>
              <div className="text-brand-red text-3xl mb-3">💬</div>
              <h3 className="font-bold text-lg mb-2">Соцсети</h3>
              <div className="flex justify-center gap-3">
                {settings.socials.vk && (
                  <a href={settings.socials.vk} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white text-sm">VK</a>
                )}
                {settings.socials.telegram && (
                  <a href={settings.socials.telegram} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white text-sm">Telegram</a>
                )}
                {settings.socials.youtube && (
                  <a href={settings.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white text-sm">YouTube</a>
                )}
                {settings.socials.dzen && (
                  <a href={settings.socials.dzen} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white text-sm">Дзен</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
