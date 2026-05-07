'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SubLink {
  href: string;
  label: string;
}

interface NavLink {
  href: string;
  label: string;
  children?: SubLink[];
}

const navLinks: NavLink[] = [
  { href: '/o-klube', label: 'О клубе' },
  {
    href: '/prodvizhenie',
    label: 'Proдвижение юных футболистов',
    children: [
      { href: '/prodvizhenie/sbory', label: 'Сборы — подготовка к просмотру в Европе' },
      { href: '/prodvizhenie/tryout-serbia', label: 'Просмотр в Сербии' },
      { href: '/prodvizhenie/stazhirovki', label: 'Стажировки в Европе' },
    ],
  },
  { href: '/trenery', label: 'Тренеры' },
  { href: '/gruppy', label: 'Группы' },
  { href: '/raspisanie', label: 'Расписание' },
  { href: '/novosti', label: 'Новости' },
  { href: '/foto', label: 'Фото' },
  { href: '/video', label: 'Видео' },
  { href: '/magazin', label: 'Экипировка' },
  { href: '/ceny', label: 'Цены' },
  { href: '/kontakty', label: 'Контакты' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="bg-brand-blue text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/logo_arsenal_new_96.png"
              alt="Футбольный клуб «Арсенал» Севастополь"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="hidden sm:block">
              <div className="font-black text-sm leading-tight">Футбольный клуб</div>
              <div className="text-xs text-blue-300">«Арсенал» Севастополь</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {openDropdown === link.href && (
                    <div className="absolute left-0 top-full pt-1 w-80">
                      <div className="bg-blue-900 rounded-md shadow-xl border border-blue-700 py-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/zapisatsya"
              className="hidden sm:inline-flex btn-primary text-sm px-4 py-2"
            >
              Записаться
            </Link>
            <button
              className="lg:hidden p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-800"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300',
          menuOpen ? 'max-h-[820px]' : 'max-h-0'
        )}
      >
        <nav className="px-4 pt-2 pb-6 flex flex-col gap-1 bg-blue-900 border-t border-blue-700">
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-blue-800 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="pl-4 border-l-2 border-blue-700 ml-3 mt-1 mb-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-3 py-1.5 text-xs text-blue-300 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/zapisatsya"
            className="mt-2 btn-primary text-center text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Записаться
          </Link>
        </nav>
      </div>
    </header>
  );
}
