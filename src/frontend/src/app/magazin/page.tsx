import type { Metadata } from 'next';
import { EQUIPMENT_PHOTOS, EQUIPMENT_VIDEOS } from '@/lib/equipment-media';

export const metadata: Metadata = {
  title: 'Экипировка',
  description:
    'Футбольная экипировка от ФК «Арсенал» Севастополь: бутсы, форма, костюмы, ветровки, сумки, защита, инвентарь. Поставка от производителей. Заказ через Telegram.',
};

const TELEGRAM_URL = 'https://t.me/s/arsenalarena';

interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  photos: readonly string[];
}

// Distribute the 185 photos across 7 product categories (~26 photos per card,
// last category gets remainder). The order is preserved so visually similar
// shots stay grouped together.
function chunk<T>(arr: readonly T[], parts: number): T[][] {
  const len = arr.length;
  const base = Math.floor(len / parts);
  const result: T[][] = [];
  let start = 0;
  for (let i = 0; i < parts; i++) {
    const extra = i < len % parts ? 1 : 0;
    result.push([...arr.slice(start, start + base + extra)]);
    start += base + extra;
  }
  return result;
}

const photoChunks = chunk(EQUIPMENT_PHOTOS, 7);

const products: Product[] = [
  {
    id: 'boots',
    title: 'Футбольная обувь (бутсы, сороконожки, бампы)',
    price: 'от 4 600 ₽ (опт)',
    description:
      'Футбольные бутсы — отличный подарок как маленькому болельщику, так и начинающей звезде футбола. Хотите купить детскую футбольную форму, бутсы, защиту? Обращайтесь — подберём лучшее решение по отличной цене.',
    photos: photoChunks[0],
  },
  {
    id: 'kit',
    title: 'Игровая форма',
    price: 'от 1 600 ₽ (опт)',
    description:
      'Подберём по цвету, бренду (Adidas, Puma, Nike), дизайну и материалу форму для вашей команды, сделаем нанесение. Работаем с фабрикой, которая шьёт из оригинального дорогого дышащего полиэстера и поставляет продукцию на Amazon.',
    photos: photoChunks[1],
  },
  {
    id: 'tracksuits',
    title: 'Тренировочные и парадные костюмы',
    price: 'от 2 900 ₽ (опт)',
    description:
      'Подберём по цвету, бренду (Adidas, Puma, Kelme, Nike), дизайну и материалу костюмы для вашей команды, сделаем нанесение. Работаем с фабрикой, которая шьёт из оригинального дорогого дышащего полиэстера и поставляет продукцию на Amazon.',
    photos: photoChunks[2],
  },
  {
    id: 'jackets',
    title: 'Ветровки и пуховики',
    price: 'от 2 400 ₽ (опт)',
    description:
      'Качественные, удобные ветровки, защищающие от дождя и ветра, тёплые зимние пальто для тренеров и куртки для юных футболистов.',
    photos: photoChunks[3],
  },
  {
    id: 'bags',
    title: 'Сумки, рюкзаки',
    price: 'Цена по запросу',
    description:
      'Удобные качественные сумки, рюкзаки и бананки любого размера и производителя — для юных футболистов и их родителей.',
    photos: photoChunks[4],
  },
  {
    id: 'protection',
    title: 'Защита и аксессуары',
    price: 'Цена по запросу',
    description:
      'Щитки, капитанские повязки, тейпы, термобельё, питьевые бутылки, перчатки, банданы, снуды, шапки, гетры, антискользящие носки, держатели щитков, мячи Adidas, Umbro, Puma, Nike, Select…',
    photos: photoChunks[5],
  },
  {
    id: 'training',
    title: 'Инвентарь для тренировок',
    price: 'Цена по запросу',
    description:
      'Поставим всё необходимое для организации эффективного тренировочного процесса — от фишек до спинбайков и пушки для мячей.',
    photos: photoChunks[6],
  },
];

function ProductGallery({ photos }: { photos: readonly string[] }) {
  if (photos.length === 0) return null;
  const cover = photos[0];
  const rest = photos.slice(1, 5);
  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {rest.map((src) => (
            <div key={src} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MagazinPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">ЭКИПИРОВКА</h1>
          <p className="text-blue-300 text-lg max-w-3xl leading-relaxed">
            Мы наладили поставку футбольной экипировки и инвентаря от производителей.
            У нас вы можете приобрести всё необходимое для тренировочного процесса.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <ProductGallery photos={product.photos} />
                </div>
                <div className="px-6 pb-6 flex flex-col flex-1">
                  <div className="text-brand-red font-bold text-sm mb-2">{product.price}</div>
                  <h3 className="font-bold text-brand-blue text-lg mb-3 leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                    {product.description}
                  </p>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-center text-sm"
                  >
                    Заказать в Telegram
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      {EQUIPMENT_VIDEOS.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center mb-8">Видео</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {EQUIPMENT_VIDEOS.map((src) => (
                <video
                  key={src}
                  src={src}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full aspect-video rounded-lg bg-black"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order info */}
      <section className="py-10 bg-brand-blue/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-700 text-base leading-relaxed">
            Для заказа пишите нам в Telegram —{' '}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-blue hover:underline"
            >
              @arsenalarena
            </a>
            . Принимаем заказы ежедневно.
          </p>
        </div>
      </section>
    </>
  );
}
