'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { mockPhotos, mockAlbums } from '@/lib/mock-data';
import type { Photo } from '@/types';
import Image from 'next/image';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [selectedAlbum, setSelectedAlbum] = useState<number | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered =
    selectedAlbum === 'all' ? photos : photos.filter((p) => p.albumId === selectedAlbum);

  const handleDelete = (id: number) => {
    if (confirm('Удалить фото?')) {
      setPhotos(photos.filter((p) => p.id !== id));
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // In a real implementation, upload to S3 here.
    alert(`Выбрано ${files.length} файлов. Загрузка требует подключения к API.`);
  };

  return (
    <AdminLayout title="Фото">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedAlbum === 'all' ? 'bg-brand-red text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            Все ({photos.length})
          </button>
          {mockAlbums.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAlbum(a.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedAlbum === a.id ? 'bg-brand-red text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {a.title}
            </button>
          ))}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary text-sm px-4 py-2"
          >
            Загрузить фото
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((photo) => (
          <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-200">
            <Image
              src={photo.thumbnailUrl}
              alt={photo.caption}
              fill
              className="object-cover"
              sizes="200px"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => handleDelete(photo.id)}
                className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
