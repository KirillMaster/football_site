'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getGroups, deleteAdminGroup } from '@/lib/api';
import { DAYS_RU } from '@/lib/utils';
import type { TrainingGroup } from '@/types';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGroups();
      setGroups(data);
    } catch {
      setError('Не удалось загрузить группы');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async (group: TrainingGroup) => {
    if (!confirm(`Удалить группу "${group.name}"?`)) return;
    const ok = await deleteAdminGroup(String(group.id));
    if (ok) {
      await fetchGroups();
    } else {
      alert('Ошибка при удалении группы');
    }
  };

  return (
    <AdminLayout title="Учебные группы">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {loading ? 'Загрузка...' : `${groups.length} групп`}
        </p>
        <button className="btn-primary text-sm px-4 py-2">+ Добавить группу</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {groups.length === 0 && !error && (
            <p className="text-center text-gray-400 py-8">Групп пока нет</p>
          )}
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-800">{group.name}</h3>
                    <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded">
                      {group.ageMin}–{group.ageMax} лет
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                  {group.coachName && (
                    <div className="text-xs text-gray-500 mb-2">Тренер: {group.coachName}</div>
                  )}
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
                  <button onClick={() => handleDelete(group)} className="text-xs text-gray-400 hover:text-red-600">Удалить</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
