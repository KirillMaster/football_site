import type { TrainingGroup } from '@/types';
import { DAYS_RU_FULL } from '@/lib/utils';

interface WeeklyScheduleProps {
  groups: TrainingGroup[];
}

export default function WeeklySchedule({ groups }: WeeklyScheduleProps) {
  // Build a 7-column schedule grid
  const slotsByDay: Record<number, { group: TrainingGroup; slot: TrainingGroup['schedule'][0] }[]> =
    {};
  for (let d = 0; d < 7; d++) slotsByDay[d] = [];

  for (const group of groups) {
    for (const slot of group.schedule) {
      slotsByDay[slot.dayOfWeek].push({ group, slot });
    }
  }

  // Sort each day by start time
  for (let d = 0; d < 7; d++) {
    slotsByDay[d].sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime));
  }

  const activeDays = Array.from({ length: 7 }, (_, i) => i).filter(
    (d) => slotsByDay[d].length > 0
  );

  // Mobile: cards per day
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {activeDays.map((d) => (
                <th
                  key={d}
                  className="bg-brand-blue text-white px-4 py-3 text-center font-semibold"
                >
                  {DAYS_RU_FULL[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {activeDays.map((d) => (
                <td key={d} className="align-top px-2 py-3 border border-gray-200">
                  {slotsByDay[d].length === 0 ? (
                    <span className="text-gray-400 text-xs">—</span>
                  ) : (
                    <div className="space-y-2">
                      {slotsByDay[d].map(({ group, slot }, i) => (
                        <div
                          key={i}
                          className="bg-brand-red/10 border-l-4 border-brand-red rounded-r-lg p-2"
                        >
                          <div className="font-semibold text-brand-red text-xs">
                            {slot.startTime}–{slot.endTime}
                          </div>
                          <div className="font-bold text-gray-800 text-sm">{group.name}</div>
                          <div className="text-gray-500 text-xs">
                            {group.ageMin}–{group.ageMax} лет
                          </div>
                          <div className="text-gray-400 text-xs mt-0.5">{slot.location}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {activeDays.map((d) => (
          <div key={d}>
            <h3 className="font-bold text-brand-blue text-base mb-2">{DAYS_RU_FULL[d]}</h3>
            <div className="space-y-2">
              {slotsByDay[d].map(({ group, slot }, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white rounded-lg border border-gray-200 p-3"
                >
                  <div className="text-center min-w-[60px]">
                    <div className="font-bold text-brand-red text-sm">{slot.startTime}</div>
                    <div className="text-gray-400 text-xs">{slot.endTime}</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{group.name}</div>
                    <div className="text-sm text-gray-500">
                      {group.ageMin}–{group.ageMax} лет
                    </div>
                    <div className="text-xs text-gray-400">{slot.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
