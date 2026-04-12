'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getAdminMessages, getAdminTryouts, markMessageRead, updateTryoutStatus } from '@/lib/api';

type TabType = 'contact' | 'tryout';

interface ContactMsg {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface Tryout {
  id: string;
  childName: string;
  childAge: number;
  parentName: string;
  phone: string;
  email: string;
  message?: string;
  createdAt: string;
  status: string; // Pending, Contacted, Enrolled, Rejected
}

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Новая',
  Contacted: 'Связались',
  Enrolled: 'Записан',
  Rejected: 'Отклонена',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-red-100 text-red-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Enrolled: 'bg-green-100 text-green-700',
  Rejected: 'bg-gray-100 text-gray-500',
};

const STATUS_OPTIONS = ['Pending', 'Contacted', 'Enrolled', 'Rejected'];

export default function AdminMessagesPage() {
  const [tab, setTab] = useState<TabType>('tryout');
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [msgs, trys] = await Promise.all([getAdminMessages(), getAdminTryouts()]);
      setMessages(msgs as unknown as ContactMsg[]);
      setTryouts(trys as unknown as Tryout[]);
    } catch {
      // данные останутся пустыми
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = async (id: string) => {
    const ok = await markMessageRead(id);
    if (ok) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const ok = await updateTryoutStatus(id, newStatus);
    if (ok) {
      setTryouts((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <AdminLayout title="Сообщения">
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('tryout')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'tryout' ? 'bg-brand-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'}`}
        >
          Заявки на запись ({tryouts.length})
        </button>
        <button
          onClick={() => setTab('contact')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'contact' ? 'bg-brand-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'}`}
        >
          Контактные сообщения ({messages.length}){unreadCount > 0 && (
            <span className="ml-1 inline-block w-5 h-5 bg-white text-brand-red rounded-full text-xs leading-5 font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'tryout' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {tryouts.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Заявок пока нет</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Ребёнок / Родитель</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Телефон</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Дата</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tryouts.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{t.childName}, {t.childAge} лет</div>
                          <div className="text-xs text-gray-500">{t.parentName}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                          <a href={`tel:${t.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand-red">{t.phone}</a>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                          {new Date(t.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className={`px-2 py-0.5 rounded text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Сообщений пока нет</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`bg-white rounded-xl border shadow-sm p-5 ${!msg.isRead ? 'border-brand-red/30' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-gray-800">{msg.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <a href={`tel:${msg.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand-red">{msg.phone}</a>
                          {msg.email && <> &middot; <a href={`mailto:${msg.email}`} className="hover:text-brand-red">{msg.email}</a></>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkRead(msg.id)}
                            className="text-xs text-brand-red hover:underline font-medium whitespace-nowrap"
                          >
                            Прочитано
                          </button>
                        )}
                        {!msg.isRead && (
                          <span className="w-2 h-2 bg-brand-red rounded-full flex-shrink-0" />
                        )}
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
