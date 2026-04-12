import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@/components/Analytics';
import { JsonLd } from '@/components/JsonLd';
import { getSiteSettings } from '@/lib/api';
import { getSportsClubSchema, getWebSiteSchema } from '@/lib/schema';

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://fcarsenal92.ru'),
  title: {
    default: 'Футбольная школа «Арсенал» в Севастополе — детский футбол от 6 до 14 лет',
    template: '%s | ДФК Арсенал Севастополь',
  },
  description:
    'Детская футбольная школа «Арсенал» в Севастополе. Профессиональные тренеры с лицензией УЕФА C. Группы для начинающих и продвинутых. Запишите ребёнка на пробную тренировку!',
  openGraph: {
    siteName: 'ДФК Арсенал — Детская футбольная школа Севастополь',
    locale: 'ru_RU',
    type: 'website',
  },
  alternates: {
    languages: {
      ru: 'https://fcarsenal92.ru',
      en: 'https://fcarsenal92.ru/en',
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="ru">
      <head>
        <JsonLd data={[getSportsClubSchema(), getWebSiteSchema()]} />
      </head>
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer settings={settings} />
        <Analytics />
      </body>
    </html>
  );
}
