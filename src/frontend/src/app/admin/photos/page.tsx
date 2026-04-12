'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';
import { uploadAdminPhoto, deleteAdminPhoto } from '@/lib/api';

interface PhotoDto {
  id: string;
  url: string;
  thumbnailUrl: string;
  altRu: string;
  tags: string[];
  sortOrder: number;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, isError = false) => {
    setError(isError ? msg : null);
  };

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photos?pageSize=100');
      if (!res.ok) {
        setPhotos([]);
        return;
      }
      const data = await res.json();
      // API может вернуть { items: [...] } или массив напрямую
      const items: PhotoDto[] = Array.isArray(data) ? data : data.items ?? [];
      setPhotos(items);
      setError(null);
    } catch {
      showToast('Не удалось загрузить фото', true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      const result = await uploadAdminPhoto(files[i]);
      if (!result) {
        hasError = true;
      }
    }

    // Сбрасываем input чтобы можно было загрузить тот же файл повторно
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setUploading(false);

    if (hasError) {
      showToast('Некоторые файлы не удалось загрузить', true);
    }

    await fetchPhotos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить фото?')) return;
    const ok = await deleteAdminPhoto(id);
    if (ok) {
      await fetchPhotos();
    } else {
      showToast('Ошибка при удалении фото', true);
    }
  };

  return (
    <AdminLayout title="Фото">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {loading ? 'Загрузка...' : `${photos.length} фото`}
        </p>
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
            disabled={uploading}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {uploading ? 'Загрузка...' : 'Загрузить фото'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden aspect-square bg-gray-200"
            >
              <Image
                src={photo.thumbnailUrl || photo.url}
                alt={photo.altRu || ''}
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
          {photos.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Нет фото. Нажмите «Загрузить фото» для добавления.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
