'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Photo } from '@/types';

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState('');

  const openLightbox = (url: string, caption: string) => {
    setLightboxSrc(url);
    setLightboxCaption(caption);
  };

  const closeLightbox = () => setLightboxSrc(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(photo.url, photo.caption)}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-red"
            aria-label={`Открыть фото: ${photo.caption}`}
          >
            <Image
              src={photo.thumbnailUrl}
              alt={photo.caption}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={85}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              aria-label="Закрыть"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative aspect-video">
              <Image
                src={lightboxSrc}
                alt={lightboxCaption}
                fill
                className="object-contain"
                sizes="100vw"
                quality={95}
              />
            </div>
            {lightboxCaption && (
              <p className="text-center text-white text-sm mt-2">{lightboxCaption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
