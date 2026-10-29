'use client';

import { useState } from 'react';
import type { CoachScheduleSlot } from '@/lib/api';

export interface ReassignCoach {
  id: string;
  nameRu: string;
}

const DAY_NAMES: Record<string, string> = {
  Monday: 'пн',
  Tuesday: 'вт',
  Wednesday: 'ср',
  Thursday: 'чт',
  Friday: 'пт',
  Saturday: 'сб',
  Sunday: 'вс',
};

export function ReassignDialog({
  coach,
  slots,
  candidates,
  busy,
  onConfirm,
  onCancel,
}: {
  coach: ReassignCoach;
  slots: CoachScheduleSlot[];
  candidates: ReassignCoach[];
  busy: boolean;
  onConfirm: (reassignTo: string) => void;
  onCancel: () => void;
}) {
  const [target, setTarget] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-bold text-brand-blue">Удаление тренера «{coach.nameRu}»</h3>
        <p className="text-sm text-gray-600">
          Тренер ведёт занятия ({slots.length}). Выберите, кому их передать:
        </p>
        <ul className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
          {slots.map((s, i) => (
            <li key={i}>
              {s.groupName} — {DAY_NAMES[s.dayOfWeek] ?? s.dayOfWeek} {s.startTime}
            </li>
          ))}
        </ul>
        <label className="block text-sm font-medium text-gray-700">
          Новый тренер
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            <option value="">— выберите тренера —</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameRu}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onConfirm(target)}
            disabled={!target || busy}
            className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
          >
            {busy ? 'Удаление...' : 'Передать и удалить'}
          </button>
          <button onClick={onCancel} disabled={busy} className="btn-outline text-sm px-6 py-2">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
