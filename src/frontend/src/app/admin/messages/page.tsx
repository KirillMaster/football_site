'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

type TabType = 'contact' | 'tryout';

const mockContactMessages = [
  { id: 1, name: 'Иван Петров', phone: '+7-978-100-00-01', email: 'ivan@mail.ru', message: 'Хочу узнать подробности о группе для ребёнка 8 лет', createdAt: '2026-04-10T10:00:00Z', read: false },
  { id: 2, name: 'Мария Иванова', phone: '+7-978-100-00-02', email: '', message: 'Есть ли место в группе Кадеты?', createdAt: '2026-04-09T15:30:00Z', read: true },
  { id: 3, name: 'Алексей Смирнов', phone: '+7-978-100-00-03', email: 'alex@gmail.com', message: 'Вопрос по оплате за апрель', createdAt: '2026-04-08T09:00:00Z', read: true },
];

const mockTryouts = [
  { id: 1, childName: 'Дима Козлов', age: 9, parentName: 'Сергей Козлов', phone: '+7-978-200-00-01', email: 'kozlov@mail.ru', createdAt: '2026-04-11T08:00:00Z', status: 'new' },
  { id: 2, childName: 'Аня Сидорова', age: 7, parentName: 'Ольга Сидорова', phone: '+7-978-200-00-02', email: '', createdAt: '2026-04-10T14:00:00Z', status: 'contacted' },
  { id: 3, childName: 'Миша Попов', age: 12, parentName: 'Виктор Попов', phone: '+7-978-200-00-03', email: 'popov@bk.ru', createdAt: '2026-04-09T11:00:00Z', status: 'enrolled' },
];

export default function AdminMessagesPage() {
  const [tab, setTab] = useState<TabType>('tryout');

  return (
    <AdminLayout title="Сообщения">
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('tryout')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'tryout' ? 'bg-brand-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'}`}
        >
          Заявки на запись ({mockTryouts.length})
        </button>
        <button
          onClick={() => setTab('contact')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'contact' ? 'bg-brand-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'}`}
        >
          Контактные сообщения ({mockContactMessages.length})
        </button>
      </div>

      {tab === 'tryout' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              {mockTryouts.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{t.childName}, {t.age} лет</div>
                    <div className="text-xs text-gray-500">{t.parentName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    <a href={`tel:${t.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand-red">{t.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {new Date(t.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      t.status === 'new' ? 'bg-red-100 text-red-700' :
                      t.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {t.status === 'new' ? 'Новая' : t.status === 'contacted' ? 'Связались' : 'Записан'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'contact' && (
        <div className="space-y-3">
          {mockContactMessages.map((msg) => (
            <div key={msg.id} className={`bg-white rounded-xl border shadow-sm p-5 ${!msg.read ? 'border-brand-red/30' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-800">{msg.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    <a href={`tel:${msg.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand-red">{msg.phone}</a>
                    {msg.email && <> · <a href={`mailto:${msg.email}`} className="hover:text-brand-red">{msg.email}</a></>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!msg.read && (
                    <span className="w-2 h-2 bg-brand-red rounded-full flex-shrink-0" />
                  )}
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
