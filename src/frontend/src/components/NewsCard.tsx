import Link from 'next/link';
import Image from 'next/image';
import type { NewsArticle } from '@/types';
import { formatDate } from '@/lib/utils';

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/novosti/${article.slug}`}>
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-blue-900 flex items-center justify-center">
              <span className="text-white font-black text-5xl opacity-20">92</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <time
              dateTime={article.publishedAt}
              className="text-xs text-gray-500"
            >
              {formatDate(article.publishedAt)}
            </time>
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-brand-red/10 text-brand-red px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>

          <div className="mt-4 text-sm font-medium text-brand-red flex items-center gap-1">
            Читать далее
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}
