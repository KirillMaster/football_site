import Image from 'next/image';
import type { Coach } from '@/types';

interface CoachCardProps {
  coach: Coach;
}

export default function CoachCard({ coach }: CoachCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-gray-200">
        <Image
          src={coach.photoUrl}
          alt={coach.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => {}} // silently handle missing images in dev
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg leading-tight">{coach.name}</h3>
          <p className="text-sm text-blue-200">{coach.role}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{coach.bio}</p>

        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-brand-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
          </svg>
          <span className="text-sm text-gray-500">Опыт: {coach.experience} лет</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {coach.licenses.map((license) => (
            <span
              key={license}
              className="inline-block px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded"
            >
              {license}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
