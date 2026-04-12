import type { Metadata } from 'next';
import Link from 'next/link';
import { getGroups } from '@/lib/api';
import { formatPrice, DAYS_RU } from '@/lib/utils';
import { JsonLd } from '@/components/JsonLd';
import { getCourseSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Группы и расписание',
  description:
    'Тренировочные группы ФК Арсенал-92: Малыши (5–7 лет), Юниоры (8–10 лет), Кадеты (11–13 лет), Юноши (14–17 лет). Расписание и цены.',
};

export default async function GruppyPage() {
  const groups = await getGroups();

  return (
    <>
      <JsonLd data={groups.map(getCourseSchema)} />

      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Группы</h1>
          <p className="text-blue-300 text-lg">
            Для детей от 5 до 17 лет — выберите подходящую группу
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {groups.map((group) => (
              <article
                key={group.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
              >
                {/* Header */}
                <div className="bg-brand-blue text-white px-6 py-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black">{group.name}</h2>
                    <p className="text-blue-300 text-sm mt-1">
                      {group.ageMin}–{group.ageMax} лет · Тренер: {group.coachName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-brand-red">
                      {formatPrice(group.price)}
                    </div>
                    <div className="text-xs text-blue-300">/месяц</div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {group.description}
                  </p>

                  {/* Schedule */}
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3">
                    Расписание
                  </h3>
                  <div className="space-y-2 mb-5">
                    {group.schedule.map((slot, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-8 h-8 bg-brand-red/10 text-brand-red rounded font-bold text-center leading-8 flex-shrink-0">
                          {DAYS_RU[slot.dayOfWeek]}
                        </span>
                        <span className="font-medium text-gray-700">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="text-gray-400">{slot.location}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/zapísatsya" className="btn-primary w-full text-center block py-2.5 text-sm">
                    Записаться в группу
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
