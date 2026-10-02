import type { Metadata } from 'next';

const DOMAIN = 'https://fcarsenal92.ru';
const DEFAULT_OG_IMAGE = {
  url: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/logo_arsenal_new_512.png',
  width: 512,
  height: 561,
};
const SITE_NAME = 'Футбольный клуб «Арсенал» Севастополь';

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const { title, description, path, ogImage, noIndex, absoluteTitle } = opts;
  const canonical = `${DOMAIN}${path}`;
  const image = ogImage
    ? { url: ogImage.startsWith('http') ? ogImage : `${DOMAIN}${ogImage}` }
    : DEFAULT_OG_IMAGE;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ ...image, alt: title }],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image.url],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// Convenience: root-level metadata base used in layout.tsx
export const metadataBase = new URL(DOMAIN);
