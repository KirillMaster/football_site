import type { Metadata } from 'next';
import { getGroups } from '@/lib/api';
import WeeklySchedule from '@/components/WeeklySchedule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Расписание тренировок',
  description:
    'Актуальное расписание тренировок футбольного клуба «Арсенал» Севастополь на неделю. Группы для детей 6–16 лет.',
};

export default async function RaspisaniePage() {
  const groups = await getGroups();

  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Расписание</h1>
          <p className="text-blue-300 text-lg">
            Еженедельное расписание тренировок
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeeklySchedule groups={groups} />

          {/* Legend */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-1">
            <p className="font-medium">Место проведения тренировок:</p>
            <p>Спорткомплекс школы №61, ул. Косарева, д.12</p>
            <p className="text-gray-500 pt-2">
              U-17: пн/ср/пт 18:00–19:30 — групповая тренировка; вт/чт 17:00–18:00 — физическая подготовка.
            </p>
            <p className="text-gray-500">
              U-12 и U-10: вт/чт 18:00–19:30, сб 12:00–13:30 — групповые тренировки.
            </p>
            <p className="text-gray-500">
              Сб/Вс — игры на Первенство г. Севастополя, ДЮФЛ Крыма и Симферополя.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
