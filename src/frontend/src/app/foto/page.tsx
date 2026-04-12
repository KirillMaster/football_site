import type { Metadata } from 'next';
import { getAlbums, getPhotos } from '@/lib/api';
import PhotoGallery from '@/components/PhotoGallery';

export const metadata: Metadata = {
  title: 'Фото',
  description:
    'Фотогалерея ФК Арсенал-92 — тренировки, турниры, жизнь клуба.',
};

export default async function FotoPage() {
  const [albums, photos] = await Promise.all([getAlbums(), getPhotos()]);

  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Фото</h1>
          <p className="text-blue-300 text-lg">Фотогалерея клуба</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {albums.map((album) => (
            <div key={album.id} className="mb-12">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {album.title}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({album.photoCount} фото)
                </span>
              </h2>
              <PhotoGallery photos={photos.filter((p) => p.albumId === album.id)} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
