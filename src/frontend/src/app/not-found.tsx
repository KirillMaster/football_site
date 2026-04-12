import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-brand-red mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Страница не найдена</h1>
        <p className="text-gray-500 mb-8">
          Запрошенная страница не существует или была удалена.
        </p>
        <Link href="/" className="btn-primary px-8 py-3">
          На главную
        </Link>
      </div>
    </div>
  );
}
