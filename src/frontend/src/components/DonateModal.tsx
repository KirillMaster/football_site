'use client';

import { useState } from 'react';

const QR_URL =
  'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/qr_payment.jpg';

// Реквизиты из платёжного QR (ST00012) — должны совпадать с ним.
export const DONATE_REQUISITES = [
  { label: 'Получатель', value: 'АНО «Футбольный клуб «Арсенал»' },
  { label: 'ИНН', value: '9200012105' },
  { label: 'КПП', value: '920001001' },
  { label: 'Расчётный счёт', value: '40703810400000727852' },
  { label: 'Банк', value: 'АО «ТБанк»' },
  { label: 'БИК', value: '044525974' },
  { label: 'Корр. счёт', value: '30101810145250000974' },
  { label: 'Назначение', value: 'Пожертвование на строительство футбольного поля' },
] as const;

export const DONATE_REQUISITES_TEXT = DONATE_REQUISITES.map((r) => `${r.label}: ${r.value}`).join('\n');

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="flex-shrink-0 text-xs font-semibold text-brand-blue hover:text-brand-red transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 rounded px-1"
    >
      {copied ? 'Скопировано ✓' : 'Копировать'}
    </button>
  );
}

export default function DonateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
          aria-label="Закрыть"
        >
          ×
        </button>
        <div className="text-brand-red text-sm font-bold uppercase tracking-wide mb-1">Поддержка проекта</div>
        <h2 className="text-xl font-black text-brand-blue mb-2 leading-tight">
          Финансовая поддержка на строительство футбольного поля
        </h2>
        <p className="text-gray-600 text-sm mb-5 leading-relaxed">
          Отсканируйте QR-код приложением вашего банка, укажите удобную сумму и совершите перевод.
          Средства поступят непосредственно на счёт АНО «Футбольный клуб «Арсенал»».
        </p>

        <div className="flex justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_URL}
            alt="QR-код для пожертвования АНО ФК Арсенал Севастополь"
            loading="lazy"
            className="w-52 h-52 object-contain border border-gray-200 rounded-xl p-2"
          />
        </div>
        <p className="text-xs text-gray-500 text-center mb-5 sm:hidden">
          С телефона: сохраните QR-код и загрузите его в приложение банка или скопируйте реквизиты ниже.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-gray-900">Реквизиты для перевода</div>
            <CopyButton text={DONATE_REQUISITES_TEXT} label="Скопировать все реквизиты" />
          </div>
          <dl className="space-y-2">
            {DONATE_REQUISITES.map((r) => (
              <div key={r.label} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500">{r.label}</dt>
                  <dd className="font-medium text-gray-900 break-words">{r.value}</dd>
                </div>
                <CopyButton text={r.value} label={`Скопировать: ${r.label}`} />
              </div>
            ))}
          </dl>
          <div className="text-gray-500 text-xs mt-3">Сумму укажите самостоятельно при оплате</div>
        </div>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Пожертвование носит добровольный характер. По вопросам сотрудничества:&nbsp;
          <a href="mailto:ars2011sev@mail.ru" className="text-brand-blue hover:underline">
            ars2011sev@mail.ru
          </a>
        </p>
      </div>
    </div>
  );
}
