'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';
import {
  getAdminCoaches,
  createAdminCoach,
  updateAdminCoach,
  deleteAdminCoach,
} from '@/lib/api';

interface AdminCoachDto {
  id: string;
  nameRu: string;
  positionRu: string;
  bioRu: string;
  photo?: string | null;
  certifications: string[];
  isActive: boolean;
}

interface CoachFormData {
  nameRu: string;
  positionRu: string;
  bioRu: string;
  certifications: string;
  isActive: boolean;
}

const emptyForm: CoachFormData = {
  nameRu: '',
  positionRu: '',
  bioRu: '',
  certifications: '',
  isActive: true,
};

function CoachForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: CoachFormData;
  onSave: (data: CoachFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CoachFormData>(initial);

  const set = (field: keyof CoachFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Имя (RU)</label>
        <input
          type="text"
          value={form.nameRu}
          onChange={(e) => set('nameRu', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          placeholder="Иванов Иван Иванович"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Должность (RU)</label>
        <input
          type="text"
          value={form.positionRu}
          onChange={(e) => set('positionRu', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          placeholder="Главный тренер"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Биография (RU)</label>
        <textarea
          rows={3}
          value={form.bioRu}
          onChange={(e) => set('bioRu', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
          placeholder="Опыт работы, достижения..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Сертификаты (через запятую)
        </label>
        <input
          type="text"
          value={form.certifications}
          onChange={(e) => set('certifications', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          placeholder="UEFA B, РФС C"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => set('isActive', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Активен
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.nameRu.trim()}
          className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button onClick={onCancel} disabled={saving} className="btn-outline text-sm px-6 py-2">
          Отмена
        </button>
      </div>
    </div>
  );
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<AdminCoachDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setError(isError ? msg : null);
    if (!isError) {
      // Краткое уведомление об успехе — просто сбрасываем ошибку
      setError(null);
    }
  };

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminCoaches();
      setCoaches(data as unknown as AdminCoachDto[]);
      setError(null);
    } catch {
      showToast('Не удалось загрузить тренеров', true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const handleCreate = async (form: CoachFormData) => {
    setSaving(true);
    const ok = await createAdminCoach({
      nameRu: form.nameRu,
      positionRu: form.positionRu,
      bioRu: form.bioRu,
      certifications: form.certifications
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: form.isActive,
    });
    setSaving(false);
    if (ok) {
      setCreating(false);
      await fetchCoaches();
    } else {
      showToast('Ошибка при создании тренера', true);
    }
  };

  const handleUpdate = async (id: string, form: CoachFormData) => {
    setSaving(true);
    const ok = await updateAdminCoach(id, {
      nameRu: form.nameRu,
      positionRu: form.positionRu,
      bioRu: form.bioRu,
      certifications: form.certifications
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: form.isActive,
    });
    setSaving(false);
    if (ok) {
      setEditingId(null);
      await fetchCoaches();
    } else {
      showToast('Ошибка при обновлении тренера', true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить тренера?')) return;
    const ok = await deleteAdminCoach(id);
    if (ok) {
      await fetchCoaches();
    } else {
      showToast('Ошибка при удалении тренера', true);
    }
  };

  return (
    <AdminLayout title="Тренеры">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {loading ? 'Загрузка...' : `${coaches.length} тренеров`}
        </p>
        <button
          onClick={() => {
            setCreating(true);
            setEditingId(null);
          }}
          className="btn-primary text-sm px-4 py-2"
        >
          + Добавить
        </button>
      </div>

      {creating && (
        <div className="mb-5">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Новый тренер</h3>
          <CoachForm
            initial={emptyForm}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((coach) =>
            editingId === coach.id ? (
              <div key={coach.id}>
                <CoachForm
                  initial={{
                    nameRu: coach.nameRu,
                    positionRu: coach.positionRu,
                    bioRu: coach.bioRu,
                    certifications: (coach.certifications ?? []).join(', '),
                    isActive: coach.isActive,
                  }}
                  onSave={(form) => handleUpdate(coach.id, form)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <div
                key={coach.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="relative h-40 bg-gray-200">
                  {coach.photo ? (
                    <Image
                      src={coach.photo}
                      alt={coach.nameRu}
                      fill
                      className="object-cover object-top"
                      sizes="300px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Нет фото
                    </div>
                  )}
                  {!coach.isActive && (
                    <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-0.5 rounded">
                      Неактивен
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-800 text-sm">{coach.nameRu}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{coach.positionRu}</div>
                  {coach.bioRu && (
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{coach.bioRu}</div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(coach.certifications ?? []).map((l) => (
                      <span
                        key={l}
                        className="text-xs bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingId(coach.id);
                        setCreating(false);
                      }}
                      className="text-xs text-brand-red hover:underline font-medium"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(coach.id)}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </AdminLayout>
  );
}
