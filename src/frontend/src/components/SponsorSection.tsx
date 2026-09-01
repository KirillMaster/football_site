'use client';

import { useState } from 'react';
import { submitContactMessage } from '@/lib/api';
import { reachGoal } from '@/lib/analytics';

const QR_URL =
  'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/qr_payment.jpg';

function SponsorModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', org: '', message: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const leadId = await submitContactMessage(
        {
          name: form.name,
          phone: form.phone,
          email: '',
          message: `Запрос генерального спонсорства.\nОрганизация: ${form.org}\n${form.message}`,
        },
        'sponsor-modal',
      );
      if (leadId) {
        setSubmitted(true);
        reachGoal('sponsor_form_submit', { leadId });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
          aria-label="Закрыть"
        >
          ×
        </button>
        <div className="text-brand-red text-sm font-bold uppercase tracking-wide mb-1">Партнёрство</div>
        <h2 className="text-2xl font-black text-brand-blue mb-2">Стать генеральным спонсором</h2>
        <p className="text-sm text-gray-500 mb-4">
          Оставьте заявку ниже или напишите напрямую в{' '}
          <a
            href="https://t.me/garybuldi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue font-semibold hover:underline"
          >
            Telegram @Garybuldi
          </a>
        </p>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-gray-800 font-semibold text-lg mb-2">Спасибо за интерес!</p>
            <p className="text-gray-600 text-sm">Мы свяжемся с вами в ближайшее время.</p>
            <button onClick={onClose} className="btn-primary mt-6">Закрыть</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="+7 (999) 000-00-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Компания / организация</label>
              <input
                type="text"
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="ООО «Название»"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                placeholder="Расскажите о ваших целях и предпочтениях..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60"
            >
              {loading ? 'Отправка...' : 'Оставить заявку'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function DonateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
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

        {/* QR */}
        <div className="flex justify-center mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_URL}
            alt="QR-код для пожертвования АНО ФК Арсенал Севастополь"
            className="w-52 h-52 object-contain border border-gray-200 rounded-xl p-2"
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 space-y-1 mb-5">
          <div className="font-semibold text-gray-900 mb-2">Получатель:</div>
          <div>АНО «Футбольный клуб «Арсенал»»</div>
          <div className="text-gray-500 text-xs mt-1">Сумму укажите самостоятельно при оплате</div>
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

export default function SponsorSection() {
  const [modal, setModal] = useState<'sponsor' | 'donate' | null>(null);

  return (
    <>
      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-blue-300 text-sm uppercase tracking-wide mb-2">Поддержка клуба</div>
          <h2 className="text-2xl md:text-3xl font-black mb-3">Помогите нам построить будущее</h2>
          <p className="text-blue-200 text-base mb-8 max-w-2xl mx-auto leading-relaxed">
            ФК «Арсенал» развивает детский футбол в Севастополе. Вы можете помочь нам построить
            собственное футбольное поле, став спонсором или сделав пожертвование.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                reachGoal('sponsor_click');
                setModal('sponsor');
              }}
              className="bg-white text-brand-blue font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              🤝 Стать генеральным спонсором
            </button>
            <button
              onClick={() => setModal('donate')}
              className="bg-brand-red text-white font-bold px-8 py-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              💳 Поддержать строительство поля
            </button>
          </div>
        </div>
      </section>

      {modal === 'sponsor' && <SponsorModal onClose={() => setModal(null)} />}
      {modal === 'donate' && <DonateModal onClose={() => setModal(null)} />}
    </>
  );
}
