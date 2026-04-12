import type { Metadata } from 'next';

const DOMAIN = 'https://fcarsenal92.ru';
const DEFAULT_OG_IMAGE = '/og-default.jpg';
const SITE_NAME = 'ДФК Арсенал — Детская футбольная школа Севастополь';

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const { title, description, path, ogImage, noIndex } = opts;
  const canonical = `${DOMAIN}${path}`;
  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const absoluteImage = image.startsWith('http') ? image : `${DOMAIN}${image}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: canonical,
        en: `${DOMAIN}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// Convenience: root-level metadata base used in layout.tsx
export const metadataBase = new URL(DOMAIN);
