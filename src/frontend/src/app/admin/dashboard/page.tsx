'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getAdminDashboardStats } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  newMessages: number;
  newTryouts: number;
  totalCoaches: number;
  totalNews: number;
  totalPhotos: number;
}

const quickLinks = [
  { href: '/admin/news', label: 'Добавить новость' },
  { href: '/admin/photos', label: 'Загрузить фото' },
  { href: '/admin/messages', label: 'Просмотреть заявки' },
  { href: '/admin/coaches', label: 'Управление тренерами' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await getAdminDashboardStats();
      setData(stats);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = data
    ? [
        { label: 'Новые сообщения', value: data.newMessages, href: '/admin/messages', color: 'bg-blue-500' },
        { label: 'Заявки на запись', value: data.newTryouts, href: '/admin/messages', color: 'bg-brand-red' },
        { label: 'Тренеры', value: data.totalCoaches, href: '/admin/coaches', color: 'bg-green-500' },
        { label: 'Новостей', value: data.totalNews, href: '/admin/news', color: 'bg-yellow-500' },
        { label: 'Фотографий', value: data.totalPhotos, href: '/admin/photos', color: 'bg-purple-500' },
      ]
    : [];

  return (
    <AdminLayout title="Обзор">
      <div className="space-y-6">
        {/* Stats grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
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
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            Не удалось загрузить статистику. Проверьте подключение к API.
          </div>
        )}

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
      </div>
    </AdminLayout>
  );
}
