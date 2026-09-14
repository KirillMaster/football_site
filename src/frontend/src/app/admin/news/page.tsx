'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatDate } from '@/lib/utils';
import {
  getAdminNews,
  getAdminNewsById,
  createAdminNews,
  updateAdminNews,
  deleteAdminNews,
} from '@/lib/api';
import { NewsEditor, type AdminNewsDto } from './NewsEditor';

type Mode = 'list' | 'edit' | 'new';

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
  const suffix = Date.now().toString(36);
  return base ? `${base}-${suffix}` : `news-${suffix}`;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<AdminNewsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [editing, setEditing] = useState<AdminNewsDto | null>(null);

  const showToast = (msg: string, isError = false) => {
    setError(isError ? msg : null);
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await getAdminNews();
      const raw = data?.items ?? data ?? [];
      const items = (Array.isArray(raw) ? raw : []) as AdminNewsDto[];
      setNews(items);
      setError(null);
    } catch {
      showToast('Не удалось загрузить новости', true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSave = async (data: {
    titleRu: string;
    excerptRu: string;
    contentRu: string;
    coverImage: string | null;
  }) => {
    setSaving(true);
    let ok: boolean;

    if (editing) {
      // UpdateNewsCommand требует полный набор полей; неотредактированные
      // берём из загруженной новости, чтобы не затереть теги/публикацию.
      // coverImage — из редактора (T008), чтобы «Заменить»/«Удалить» сохранялись.
      ok = await updateAdminNews(editing.id, {
        titleRu: data.titleRu,
        titleEn: editing.titleEn ?? '',
        excerptRu: data.excerptRu,
        excerptEn: editing.excerptEn ?? '',
        contentRu: data.contentRu,
        contentEn: editing.contentEn ?? '',
        metaTitle: editing.metaTitle || data.titleRu.slice(0, 160),
        metaDescription: editing.metaDescription || data.excerptRu.slice(0, 300),
        tags: editing.tags ?? [],
        isPublished: editing.isPublished ?? true,
        coverImage: data.coverImage,
      });
    } else {
      // CreateNewsCommand на бэкенде требует полный набор non-nullable полей,
      // slug — только [a-z0-9-]
      ok = await createAdminNews({
        slug: slugify(data.titleRu),
        titleRu: data.titleRu,
        titleEn: '',
        excerptRu: data.excerptRu,
        excerptEn: '',
        contentRu: data.contentRu,
        contentEn: '',
        metaTitle: data.titleRu.slice(0, 160),
        metaDescription: data.excerptRu.slice(0, 300),
        tags: [],
        isPublished: true,
        publishedAt: null,
        coverImage: data.coverImage,
      });
    }

    setSaving(false);

    if (ok) {
      setMode('list');
      setEditing(null);
      await fetchNews();
    } else {
      showToast(
        editing ? 'Ошибка при обновлении новости' : 'Ошибка при создании новости',
        true
      );
    }
  };

  // Список отдаёт только summary (без contentRu и meta) — перед редактированием
  // загружаем полную новость, иначе редактор откроется с пустым содержанием.
  const openEdit = async (article: AdminNewsDto) => {
    setLoading(true);
    const full = (await getAdminNewsById(article.id)) as AdminNewsDto | null;
    setLoading(false);
    if (!full) {
      showToast('Не удалось загрузить новость для редактирования', true);
      return;
    }
    setEditing(full);
    setMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить новость?')) return;
    const ok = await deleteAdminNews(id);
    if (ok) {
      await fetchNews();
    } else {
      showToast('Ошибка при удалении новости', true);
    }
  };

  return (
    <AdminLayout title="Новости и события">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {mode === 'list' && (
        <div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            Новости и события — одна сущность. Записи из этого раздела отображаются в блоке
            «События школы» на главной странице.
          </div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {loading ? 'Загрузка...' : `${news.length} статей`}
            </p>
            <button
              onClick={() => {
                setEditing(null);
                setMode('new');
              }}
              className="btn-primary text-sm px-4 py-2"
            >
              + Добавить
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Заголовок</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                      Дата
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {news.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{article.titleRu}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{article.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {article.publishedAt ? formatDate(article.publishedAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(article)}
                          className="text-brand-red hover:underline text-xs font-medium mr-3"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-gray-400 hover:text-red-600 text-xs"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                  {news.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                        Нет новостей
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(mode === 'edit' || mode === 'new') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-5">
            {mode === 'new' ? 'Новая статья' : 'Редактировать'}
          </h2>
          <NewsEditor
            key={editing?.id ?? 'new'}
            article={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => {
              setMode('list');
              setEditing(null);
            }}
            saving={saving}
          />
        </div>
      )}
    </AdminLayout>
  );
}
