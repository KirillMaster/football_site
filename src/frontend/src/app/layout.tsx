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
  icons: {
    icon: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/logo_arsenal_new_96.png',
    apple: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/logo_arsenal_new_200.png',
  },
  title: {
    default: 'Футбольный клуб «Арсенал» Севастополь — Детская футбольная школа',
    template: '%s | Футбольный клуб «Арсенал» Севастополь',
  },
  description:
    'Детская футбольная школа «Арсенал» в Севастополе. 64 воспитанника 6–16 лет. Профессиональные тренеры с лицензией УЕФА C. Открыт набор 2026. Запишите ребёнка на пробную тренировку!',
  openGraph: {
    siteName: 'Футбольный клуб «Арсенал» Севастополь',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/logo_arsenal_new_512.png',
        width: 512,
        height: 561,
        alt: 'Футбольный клуб «Арсенал» Севастополь',
      },
    ],
  },
  alternates: {
    canonical: 'https://fcarsenal92.ru',
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
