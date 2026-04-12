import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsArticle } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { JsonLd } from '@/components/JsonLd';
import { getArticleSchema, getBreadcrumbSchema } from '@/lib/schema';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return { title: 'Статья не найдена' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.coverImageUrl, width: 1200, height: 630 }],
      publishedTime: article.publishedAt,
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) notFound();

  return (
    <>
      <JsonLd
        data={[
          getArticleSchema(article),
          getBreadcrumbSchema([
            { name: 'Главная', url: 'https://fcarsenal92.ru/' },
            { name: 'Новости', url: 'https://fcarsenal92.ru/novosti' },
            { name: article.title, url: `https://fcarsenal92.ru/novosti/${article.slug}` },
          ]),
        ]}
      />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-sm text-gray-500 flex gap-2">
          <Link href="/" className="hover:text-brand-red">Главная</Link>
          <span>/</span>
          <Link href="/novosti" className="hover:text-brand-red">Новости</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{article.title}</span>
        </div>
      </nav>

      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <time dateTime={article.publishedAt} className="text-sm text-gray-500">
              {formatDate(article.publishedAt)}
            </time>
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs bg-brand-red/10 text-brand-red px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Cover image */}
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8 bg-gray-200">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          {/* Content */}
          <div
            className="prose-club max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Author */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
              АК
            </div>
            <div>
              <div className="font-medium text-gray-800 text-sm">{article.author}</div>
              <div className="text-xs text-gray-500">{formatDate(article.publishedAt)}</div>
            </div>
          </div>
        </div>
      </article>

      {/* Back */}
      <div className="pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/novosti" className="text-brand-red hover:underline text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Все новости
        </Link>
      </div>
    </>
  );
}
