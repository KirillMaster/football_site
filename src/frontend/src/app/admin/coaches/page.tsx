'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { mockCoaches } from '@/lib/mock-data';
import type { Coach } from '@/types';
import Image from 'next/image';

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>(mockCoaches);

  const handleDelete = (id: number) => {
    if (confirm('Удалить тренера?')) {
      setCoaches(coaches.filter((c) => c.id !== id));
    }
  };

  return (
    <AdminLayout title="Тренеры">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{coaches.length} тренеров</p>
        <button className="btn-primary text-sm px-4 py-2">+ Добавить</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => (
          <div key={coach.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="relative h-40 bg-gray-200">
              <Image
                src={coach.photoUrl}
                alt={coach.name}
                fill
                className="object-cover object-top"
                sizes="300px"
              />
            </div>
            <div className="p-4">
              <div className="font-bold text-gray-800 text-sm">{coach.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{coach.role}</div>
              <div className="text-xs text-gray-400 mt-1">Опыт: {coach.experience} лет</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {coach.licenses.map((l) => (
                  <span key={l} className="text-xs bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded">
                    {l}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-xs text-brand-red hover:underline font-medium">Изменить</button>
                <button onClick={() => handleDelete(coach.id)} className="text-xs text-gray-400 hover:text-red-600">Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
