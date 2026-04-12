'use client';

export const dynamic = 'force-dynamic';

import AdminLayout from '@/components/AdminLayout';
import { mockDashboardStats } from '@/lib/mock-data';
import Link from 'next/link';

const stats = [
  {
    label: 'Новые сообщения',
    value: mockDashboardStats.newMessages,
    href: '/admin/messages',
    color: 'bg-blue-500',
  },
  {
    label: 'Заявки на запись',
    value: mockDashboardStats.newTryoutRequests,
    href: '/admin/messages',
    color: 'bg-brand-red',
  },
  {
    label: 'Тренеры',
    value: mockDashboardStats.totalCoaches,
    href: '/admin/coaches',
    color: 'bg-green-500',
  },
  {
    label: 'Новостей',
    value: mockDashboardStats.totalNewsArticles,
    href: '/admin/news',
    color: 'bg-yellow-500',
  },
  {
    label: 'Фотографий',
    value: mockDashboardStats.totalPhotos,
    href: '/admin/photos',
    color: 'bg-purple-500',
  },
];

const quickLinks = [
  { href: '/admin/news', label: 'Добавить новость' },
  { href: '/admin/photos', label: 'Загрузить фото' },
  { href: '/admin/messages', label: 'Просмотреть заявки' },
  { href: '/admin/coaches', label: 'Управление тренерами' },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Обзор">
      <div className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-lg mb-3`} />
              <div className="text-3xl font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Быстрые действия</h2>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((l) => (
              <Link key={l.href} href={l.href} className="btn-secondary text-sm px-4 py-2">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Placeholder notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          Панель управления работает в режиме демо. Подключите API бэкенда для работы с реальными данными.
        </div>
      </div>
    </AdminLayout>
  );
}
