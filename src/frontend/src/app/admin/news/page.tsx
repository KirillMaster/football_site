'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { mockNews } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';
import type { NewsArticle } from '@/types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type Mode = 'list' | 'edit' | 'new';

function NewsEditor({
  article,
  onSave,
  onCancel,
}: {
  article?: Partial<NewsArticle>;
  onSave: (data: Partial<NewsArticle>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(article?.title ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');

  const editor = useEditor({
    extensions: [StarterKit],
    content: article?.content ?? '<p>Начните писать...</p>',
  });

  const handleSave = () => {
    onSave({
      ...article,
      title,
      excerpt,
      content: editor?.getHTML() ?? '',
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
            <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 font-bold">B</button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 italic">I</button>
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100">H2</button>
            <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100">List</button>
          </div>
          <EditorContent editor={editor} className="p-3 min-h-[200px] text-sm prose max-w-none focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={handleSave} className="btn-primary text-sm px-6 py-2">Сохранить</button>
        <button onClick={onCancel} className="btn-outline text-sm px-6 py-2">Отмена</button>
      </div>
    </div>
  );
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [mode, setMode] = useState<Mode>('list');
  const [editing, setEditing] = useState<NewsArticle | null>(null);

  const handleSave = (data: Partial<NewsArticle>) => {
    if (editing) {
      setNews(news.map((n) => (n.id === editing.id ? { ...n, ...data } : n)));
    } else {
      const newArticle: NewsArticle = {
        id: Date.now(),
        slug: data.title?.toLowerCase().replace(/\s+/g, '-') ?? 'new',
        title: data.title ?? 'Новая статья',
        excerpt: data.excerpt ?? '',
        content: data.content ?? '',
        coverImageUrl: '/images/news/default.jpg',
        publishedAt: new Date().toISOString(),
        author: 'Администрация клуба',
        tags: [],
      };
      setNews([newArticle, ...news]);
    }
    setMode('list');
    setEditing(null);
  };

  return (
    <AdminLayout title="Новости">
      {mode === 'list' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">{news.length} статей</p>
            <button onClick={() => { setEditing(null); setMode('new'); }} className="btn-primary text-sm px-4 py-2">
              + Добавить
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Заголовок</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Дата</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{article.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{article.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditing(article); setMode('edit'); }}
                        className="text-brand-red hover:underline text-xs font-medium mr-3"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => setNews(news.filter((n) => n.id !== article.id))}
                        className="text-gray-400 hover:text-red-600 text-xs"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(mode === 'edit' || mode === 'new') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-5">
            {mode === 'new' ? 'Новая статья' : 'Редактировать'}
          </h2>
          <NewsEditor
            article={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => { setMode('list'); setEditing(null); }}
          />
        </div>
      )}
    </AdminLayout>
  );
}
