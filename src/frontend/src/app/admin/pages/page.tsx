'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getAdminPages, getAdminPageBySlug, updateAdminPage } from '@/lib/api';
import type { AdminPage } from '@/types';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [editing, setEditing] = useState<AdminPage | null>(null);
  const [form, setForm] = useState({ titleRu: '', contentRu: '', metaDescriptionRu: '', isPublished: true });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminPages().then((data) => {
      setPages(data);
      setLoading(false);
    });
  }, []);

  const startEdit = async (page: AdminPage) => {
    // Load full page content (summary DTO doesn't include contentRu)
    const full = await getAdminPageBySlug(page.slug);
    const data = full ?? page;
    setEditing(data);
    setForm({ titleRu: data.titleRu, contentRu: data.contentRu, metaDescriptionRu: data.metaDescriptionRu, isPublished: data.isPublished });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const ok = await updateAdminPage(editing.id, form);
    if (ok) {
      setPages(pages.map((p) => p.id === editing.id ? { ...p, ...form } : p));
      setEditing(null);
    } else {
      alert('Ошибка сохранения');
    }
    setSaving(false);
  };

  if (editing) {
    return (
      <AdminLayout title={`Редактировать: ${editing.slug}`}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок (RU)</label>
            <input
              type="text"
              value={form.titleRu}
              onChange={(e) => setForm({ ...form, titleRu: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Содержимое (HTML)</label>
            <textarea
              rows={20}
              value={form.contentRu}
              onChange={(e) => setForm({ ...form, contentRu: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta-описание</label>
            <input
              type="text"
              value={form.metaDescriptionRu}
              onChange={(e) => setForm({ ...form, metaDescriptionRu: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 text-brand-red"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">Опубликовано</label>
          </div>
          <div className="flex gap-3">
            <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm px-6 py-2 disabled:opacity-60">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button onClick={() => setEditing(null)} className="btn-outline text-sm px-6 py-2">Отмена</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="CMS-страницы">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Загрузка...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Нет страниц. Убедитесь, что вы авторизованы.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Страница</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Slug</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{page.titleRu}</div>
                    <div className="text-xs text-gray-400">{page.isPublished ? 'Опубликовано' : 'Черновик'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{page.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(page)} className="text-brand-red hover:underline text-xs font-medium">
                      Редактировать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
