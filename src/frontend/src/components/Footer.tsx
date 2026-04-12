import Link from 'next/link';
import type { SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center font-black text-white text-sm">
                92
              </div>
              <div>
                <div className="font-black text-base">ФК АРСЕНАЛ-92</div>
                <div className="text-xs text-blue-300">Детская футбольная школа</div>
              </div>
            </div>
            <p className="text-sm text-blue-300 leading-relaxed">
              Воспитываем чемпионов с 1992 года. Тренировки для детей от 5 до 17 лет в Севастополе.
            </p>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-bold text-lg mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              {settings.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hover:text-white">
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
              <li className="text-blue-300">{settings.address}</li>
            </ul>
          </div>

          {/* Links & Socials */}
          <div>
            <h3 className="font-bold text-lg mb-4">Навигация</h3>
            <ul className="space-y-1 text-sm text-blue-200 mb-6">
              {[
                { href: '/o-klube', label: 'О клубе' },
                { href: '/trenery', label: 'Тренеры' },
                { href: '/gruppy', label: 'Группы' },
                { href: '/ceny', label: 'Цены' },
                { href: '/novosti', label: 'Новости' },
                { href: '/magazin', label: 'Магазин' },
                { href: '/kontakty', label: 'Контакты' },
                { href: '/roditelyam', label: 'Родителям' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              {settings.socials.vk && (
                <a
                  href={settings.socials.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-blue-700 hover:bg-brand-red rounded flex items-center justify-center transition-colors"
                  aria-label="ВКонтакте"
                >
                  <span className="text-xs font-bold">VK</span>
                </a>
              )}
              {settings.socials.telegram && (
                <a
                  href={settings.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-blue-700 hover:bg-brand-red rounded flex items-center justify-center transition-colors"
                  aria-label="Telegram"
                >
                  <span className="text-xs font-bold">TG</span>
                </a>
              )}
              {settings.socials.youtube && (
                <a
                  href={settings.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-blue-700 hover:bg-brand-red rounded flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <span className="text-xs font-bold">YT</span>
                </a>
              )}
              {settings.socials.dzen && (
                <a
                  href={settings.socials.dzen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-blue-700 hover:bg-brand-red rounded flex items-center justify-center transition-colors"
                  aria-label="Дзен"
                >
                  <span className="text-xs font-bold">Д</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-700 text-center text-sm text-blue-400">
          <p>© {new Date().getFullYear()} ФК Арсенал-92. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
