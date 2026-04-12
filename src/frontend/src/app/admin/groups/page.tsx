'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { mockGroups } from '@/lib/mock-data';
import { formatPrice, DAYS_RU } from '@/lib/utils';
import type { TrainingGroup } from '@/types';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<TrainingGroup[]>(mockGroups);

  const handleDelete = (id: number) => {
    if (confirm('Удалить группу?')) {
      setGroups(groups.filter((g) => g.id !== id));
    }
  };

  return (
    <AdminLayout title="Учебные группы">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{groups.length} групп</p>
        <button className="btn-primary text-sm px-4 py-2">+ Добавить группу</button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-800">{group.name}</h3>
                  <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded">
                    {group.ageMin}–{group.ageMax} лет
                  </span>
                  <span className="text-xs font-bold text-brand-red">{formatPrice(group.price)}/мес</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                <div className="text-xs text-gray-500 mb-2">Тренер: {group.coachName}</div>
                <div className="flex flex-wrap gap-1">
                  {group.schedule.map((slot, i) => (
                    <span key={i} className="text-xs bg-gray-100 rounded px-2 py-0.5">
                      {DAYS_RU[slot.dayOfWeek]} {slot.startTime}–{slot.endTime}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="text-xs text-brand-red hover:underline font-medium">Изменить</button>
                <button onClick={() => handleDelete(group.id)} className="text-xs text-gray-400 hover:text-red-600">Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
