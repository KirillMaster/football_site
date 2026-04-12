'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { mockPages } from '@/lib/mock-data';
import type { CmsPage } from '@/types';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<CmsPage[]>(Object.values(mockPages));
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [content, setContent] = useState('');

  const startEdit = (page: CmsPage) => {
    setEditing(page);
    setContent(page.content);
  };

  const saveEdit = () => {
    if (!editing) return;
    setPages(pages.map((p) => (p.id === editing.id ? { ...p, content } : p)));
    setEditing(null);
  };

  if (editing) {
    return (
      <AdminLayout title={`Редактировать: ${editing.title}`}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML-содержимое</label>
            <textarea
              rows={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={saveEdit} className="btn-primary text-sm px-6 py-2">Сохранить</button>
            <button onClick={() => setEditing(null)} className="btn-outline text-sm px-6 py-2">Отмена</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="CMS-страницы">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Страница</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Обновлено</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{page.title}</div>
                  <div className="text-xs text-gray-400">/api/pages/{page.slug}</div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{page.updatedAt}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(page)} className="text-brand-red hover:underline text-xs font-medium">
                    Редактировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
