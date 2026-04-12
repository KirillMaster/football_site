import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCoaches, getNewsPage, getPricingPlans, getSiteSettings } from '@/lib/api';
import CoachCard from '@/components/CoachCard';
import NewsCard from '@/components/NewsCard';
import PricingCard from '@/components/PricingCard';
import { JsonLd } from '@/components/JsonLd';
import { getSportsClubSchema, getWebSiteSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'ФК Арсенал-92 — Детская футбольная школа Севастополя',
  description:
    'Детская футбольная школа ФК Арсенал-92 в Севастополе. Тренировки для детей от 5 до 17 лет. Запишитесь на бесплатное пробное занятие!',
  openGraph: { type: 'website' },
};

export default async function HomePage() {
  const [coaches, newsData, plans, settings] = await Promise.all([
    getCoaches(),
    getNewsPage(1, 3),
    getPricingPlans(),
    getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd data={[getSportsClubSchema(), getWebSiteSchema()]} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-brand-blue text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-blue-900 to-black opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/40 rounded-full px-4 py-1.5 text-sm text-red-300 mb-6">
              <span className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
              Набор открыт — 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
              ФК <span className="text-brand-red">Арсенал-92</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 font-medium mb-3">
              Детская футбольная школа Севастополя
            </p>
            <p className="text-base text-blue-300 mb-8 leading-relaxed">
              Воспитываем чемпионов с 1992 года. Профессиональные тренеры, современные методики,
              дружный коллектив. Для детей от&nbsp;5 до&nbsp;17 лет.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/zapísatsya" className="btn-primary text-base px-8 py-4">
                Записаться
              </Link>
              <Link href="/gruppy" className="btn-outline text-base px-8 py-4 border-white text-white hover:bg-white hover:text-brand-blue">
                Наши группы
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm">
              {[
                { value: '30+', label: 'лет опыта' },
                { value: '4', label: 'тренера' },
                { value: '100+', label: 'детей' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-white">{stat.value}</div>
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
                ФК Арсенал-92 основан в 1992 году в Севастополе. За более чем 30 лет клуб воспитал
                сотни юных футболистов, многие из которых стали профессиональными игроками.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Мы работаем с детьми от 5 до 17 лет. Наши тренеры имеют лицензии UEFA и применяют
                современные европейские методики обучения.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Чемпионы Севастополя', value: '2020, 2022, 2024' },
                  { label: 'Финалисты Кубка Крыма', value: '2023' },
                  { label: 'В профессиональных клубах', value: '15+ воспитанников' },
                  { label: 'Первое занятие', value: 'Бесплатно' },
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
                src="/images/about-club.jpg"
                alt="ФК Арсенал-92 — тренировки"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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

      {/* ── CTA banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-brand-red text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Запишите ребёнка на пробное занятие
          </h2>
          <p className="text-red-100 text-lg mb-8">
            Первое занятие — бесплатно. Мы работаем с детьми от 5 до 17 лет.
          </p>
          <Link href="/zapísatsya" className="inline-flex btn-primary bg-white text-brand-red hover:bg-gray-100 text-base px-10 py-4">
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
