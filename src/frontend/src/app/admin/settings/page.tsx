'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getAdminSettings, updateAdminSettings } from '@/lib/api';
import type { SiteSettings } from '@/types';

const emptySocials = { vk: '', telegram: '', youtube: '', dzen: '' };

const defaultSettings: SiteSettings = {
  phones: [''],
  email: '',
  address: '',
  socials: { ...emptySocials },
  heroVideoRutubeId: '',
  mapEmbedUrl: '',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await getAdminSettings();
      if (raw) {
        const data = raw as unknown as SiteSettings;
        setSettings({
          phones: data.phones?.length ? data.phones : [''],
          email: data.email ?? '',
          address: data.address ?? '',
          socials: { ...emptySocials, ...data.socials },
          heroVideoRutubeId: data.heroVideoRutubeId ?? '',
          mapEmbedUrl: data.mapEmbedUrl ?? '',
        });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Не удалось загрузить настройки' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    const ok = await updateAdminSettings(settings as unknown as Record<string, unknown>);
    setSaving(false);
    if (ok) {
      setFeedback({ type: 'success', text: 'Сохранено!' });
    } else {
      setFeedback({ type: 'error', text: 'Ошибка при сохранении' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) {
    return (
      <AdminLayout title="Настройки сайта">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Настройки сайта">
      <div className="max-w-2xl space-y-6">
        {/* Contacts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Контактные данные</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            {settings.phones.map((phone, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон {i + 1}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    const phones = [...settings.phones];
                    phones[i] = e.target.value;
                    setSettings({ ...settings, phones });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Video */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Главная страница</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID видео Rutube (героический баннер)
            </label>
            <input
              type="text"
              value={settings.heroVideoRutubeId ?? ''}
              onChange={(e) => setSettings({ ...settings, heroVideoRutubeId: e.target.value })}
              placeholder="Например: a1b2c3d4e5f6..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <p className="text-xs text-gray-400 mt-1">
              Вставьте ID из URL Rutube-видео (часть после /video/)
            </p>
          </div>
        </div>

        {/* Socials */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Социальные сети</h2>
          <div className="space-y-4">
            {(Object.keys(settings.socials) as Array<keyof SiteSettings['socials']>).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key}
                </label>
                <input
                  type="url"
                  value={settings.socials[key] ?? ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, [key]: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  placeholder={`https://...`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-2.5 disabled:opacity-50">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          {feedback && (
            <span className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.text}
            </span>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
