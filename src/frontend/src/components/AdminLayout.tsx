'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Обзор', icon: '📊' },
  { href: '/admin/pages', label: 'Страницы', icon: '📄' },
  { href: '/admin/coaches', label: 'Тренеры', icon: '👥' },
  { href: '/admin/news', label: 'Новости', icon: '📰' },
  { href: '/admin/photos', label: 'Фото', icon: '🖼️' },
  { href: '/admin/groups', label: 'Группы', icon: '⚽' },
  { href: '/admin/messages', label: 'Сообщения', icon: '✉️' },
  { href: '/admin/settings', label: 'Настройки', icon: '⚙️' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const Sidebar = () => (
    <aside className="w-64 bg-brand-blue text-white flex-shrink-0 flex flex-col min-h-screen">
      <div className="p-5 border-b border-blue-700">
        <div className="font-black text-lg">ФК Арсенал-92</div>
        <div className="text-xs text-blue-300">Панель управления</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === item.href
                ? 'bg-brand-red text-white font-semibold'
                : 'text-blue-200 hover:bg-blue-700 hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-blue-300 hover:text-white hover:bg-blue-700 rounded-lg text-sm transition-colors"
        >
          <span>🚪</span>
          Выйти
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 bottom-0" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-800"
              onClick={() => setSidebarOpen(true)}
              aria-label="Открыть меню"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {title && <h1 className="text-lg font-bold text-gray-800">{title}</h1>}
          </div>
          <Link href="/" target="_blank" className="text-sm text-brand-red hover:underline">
            Открыть сайт
          </Link>
        </header>

        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
