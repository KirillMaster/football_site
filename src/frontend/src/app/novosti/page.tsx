import type { Metadata } from 'next';
import { getNewsPage } from '@/lib/api';
import NewsCard from '@/components/NewsCard';

export const metadata: Metadata = {
  title: 'Новости',
  description:
    'Последние новости ФК Арсенал-92: турниры, результаты матчей, события клуба.',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NovostiPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const { data: articles, total, pageSize } = await getNewsPage(page, 9);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Новости</h1>
          <p className="text-blue-300 text-lg">События клуба ФК Арсенал-92</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Новостей пока нет</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-10 flex justify-center gap-2" aria-label="Навигация по страницам">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/novosti?page=${p}`}
                  aria-current={p === page ? 'page' : undefined}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                    p === page
                      ? 'bg-brand-red text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red'
                  }`}
                >
                  {p}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
