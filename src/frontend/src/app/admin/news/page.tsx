'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatDate } from '@/lib/utils';
import {
  getAdminNews,
  createAdminNews,
  updateAdminNews,
  deleteAdminNews,
} from '@/lib/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type Mode = 'list' | 'edit' | 'new';

interface AdminNewsDto {
  id: string;
  slug: string;
  titleRu: string;
  excerptRu: string;
  contentRu?: string;
  coverImage?: string | null;
  tags: string[];
  publishedAt?: string | null;
}

function NewsEditor({
  article,
  onSave,
  onCancel,
  saving,
}: {
  article?: Partial<AdminNewsDto>;
  onSave: (data: { titleRu: string; excerptRu: string; contentRu: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(article?.titleRu ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerptRu ?? '');

  const editor = useEditor({
    extensions: [StarterKit],
    content: article?.contentRu ?? '<p>Начните писать...</p>',
  });

  const handleSave = () => {
    onSave({
      titleRu: title,
      excerptRu: excerpt,
      contentRu: editor?.getHTML() ?? '',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Содержание</label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex gap-2">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 font-bold"
            >
              B
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 italic"
            >
              I
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
            >
              H2
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
            >
              List
            </button>
          </div>
          <EditorContent
            editor={editor}
            className="p-3 min-h-[200px] text-sm prose max-w-none focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
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
      const data = await getAdminNews();
      const items: AdminNewsDto[] = data?.items ?? data ?? [];
      setNews(Array.isArray(items) ? items : []);
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
  }) => {
    setSaving(true);
    let ok: boolean;

    if (editing) {
      ok = await updateAdminNews(editing.id, {
        titleRu: data.titleRu,
        excerptRu: data.excerptRu,
        contentRu: data.contentRu,
      });
    } else {
      ok = await createAdminNews({
        titleRu: data.titleRu,
        excerptRu: data.excerptRu,
        contentRu: data.contentRu,
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
                          onClick={() => {
                            setEditing(article);
                            setMode('edit');
                          }}
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
