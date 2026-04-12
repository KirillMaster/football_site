'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { mockSiteSettings } from '@/lib/mock-data';
import type { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(mockSiteSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In real app: PATCH /api/sitesettings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          <button onClick={handleSave} className="btn-primary px-8 py-2.5">
            Сохранить
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Сохранено!</span>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
