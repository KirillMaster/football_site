import type { Metadata } from 'next';
import { getPhotos } from '@/lib/api';
import PhotoGallery from '@/components/PhotoGallery';

export const metadata: Metadata = {
  title: 'Фото',
  description:
    'Фотогалерея футбольного клуба «Арсенал» Севастополь — тренировки, турниры, жизнь клуба.',
};

export default async function FotoPage() {
  const photos = await getPhotos();

  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Фото</h1>
          <p className="text-blue-300 text-lg">
            Фотогалерея клуба — {photos.length} фото
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PhotoGallery photos={photos} />
        </div>
      </section>
    </>
  );
}
