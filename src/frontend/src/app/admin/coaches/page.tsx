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
  uploadAdminNewsMedia,
  type CoachScheduleSlot,
} from '@/lib/api';
import { ReassignDialog } from './ReassignDialog';

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
  photo: string;
  certifications: string;
  isActive: boolean;
}

const emptyForm: CoachFormData = {
  nameRu: '',
  positionRu: '',
  bioRu: '',
  photo: '',
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = (field: keyof CoachFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const result = await uploadAdminNewsMedia(file);
    setUploading(false);
    if (result.status === 'uploaded') {
      set('photo', result.url);
    } else if (result.status === 'rejected') {
      setUploadError(result.message);
    } else if (result.status === 'unauthorized') {
      setUploadError('Сессия истекла — войдите заново');
    } else {
      setUploadError('Нет соединения с сервером');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Фото</label>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-20 shrink-0 rounded-lg overflow-hidden bg-gray-200">
            {form.photo ? (
              <Image src={form.photo} alt={form.nameRu || 'Фото тренера'} fill className="object-cover object-top" sizes="80px" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">Нет фото</div>
            )}
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label className="btn-outline text-xs px-3 py-1.5 cursor-pointer">
              {uploading ? 'Загрузка...' : form.photo ? 'Заменить' : 'Загрузить'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading || saving}
                onChange={handlePhotoUpload}
              />
            </label>
            {form.photo && (
              <button
                type="button"
                onClick={() => set('photo', '')}
                disabled={uploading || saving}
                className="text-xs text-gray-400 hover:text-red-600"
              >
                Удалить фото
              </button>
            )}
          </div>
        </div>
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>
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
          disabled={saving || uploading || !form.nameRu.trim()}
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
  const [reassign, setReassign] = useState<{ coach: AdminCoachDto; slots: CoachScheduleSlot[] } | null>(null);

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
      photo: form.photo || null,
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
      photo: form.photo || null,
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

  const handleDelete = async (coach: AdminCoachDto) => {
    if (!confirm('Удалить тренера?')) return;
    const res = await deleteAdminCoach(coach.id);
    if (res.ok) {
      await fetchCoaches();
    } else if (res.schedules?.length) {
      setReassign({ coach, slots: res.schedules });
    } else {
      showToast('Ошибка при удалении тренера', true);
    }
  };

  const handleReassignDelete = async (reassignTo: string) => {
    if (!reassign) return;
    setSaving(true);
    const res = await deleteAdminCoach(reassign.coach.id, reassignTo);
    setSaving(false);
    if (res.ok) {
      setReassign(null);
      await fetchCoaches();
    } else {
      showToast('Не удалось передать занятия и удалить тренера', true);
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
                    photo: coach.photo ?? '',
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
                      onClick={() => handleDelete(coach)}
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

      {reassign && (
        <ReassignDialog
          coach={reassign.coach}
          slots={reassign.slots}
          candidates={coaches.filter((c) => c.id !== reassign.coach.id)}
          busy={saving}
          onConfirm={handleReassignDelete}
          onCancel={() => setReassign(null)}
        />
      )}
    </AdminLayout>
  );
}
