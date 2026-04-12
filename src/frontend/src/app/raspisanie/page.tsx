import type { Metadata } from 'next';
import { getGroups } from '@/lib/api';
import WeeklySchedule from '@/components/WeeklySchedule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Расписание тренировок',
  description:
    'Актуальное расписание тренировок ФК Арсенал-92 на неделю. Группы для детей от 5 до 17 лет.',
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
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">Все тренировки проводятся на:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Стадионе «Арсенал» — ул. Спортивная, 1</li>
              <li>Спортзал №2 — ул. Спортивная, 3 (в случае дождя)</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
