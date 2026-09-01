'use client';

import { reachGoal } from '@/lib/analytics';

interface MapLinksProps {
  address: string;
}

export default function MapLinks({ address }: MapLinksProps) {
  const q = encodeURIComponent(address);
  const links: { service: 'yandex' | '2gis'; label: string; href: string }[] = [
    { service: 'yandex', label: 'Маршрут в Яндекс.Картах', href: `https://yandex.ru/maps/?text=${q}` },
    { service: '2gis', label: 'Открыть в 2ГИС', href: `https://2gis.ru/search/${q}` },
  ];

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {links.map((l) => (
        <a
          key={l.service}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => reachGoal('map_click', { service: l.service })}
          className="btn-primary text-sm"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
