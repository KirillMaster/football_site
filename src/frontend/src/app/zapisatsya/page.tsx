import type { Metadata } from 'next';
import TryoutForm from '@/components/TryoutForm';

export const metadata: Metadata = {
  title: 'Записаться',
  description:
    'Запишите ребёнка на пробное занятие в футбольный клуб «Арсенал» Севастополь. Первое занятие бесплатно. Группы для детей 6–16 лет.',
};

export default function ZapisatsyaPage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Записаться</h1>
          <p className="text-blue-300 text-lg">
            Первое пробное занятие — бесплатно
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-brand-blue mb-6">
                Заявка на пробное занятие
              </h2>
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <TryoutForm />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-brand-blue text-white rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-4">Как это работает</h3>
                <ol className="space-y-3">
                  {[
                    'Заполните форму или позвоните нам',
                    'Мы свяжемся с вами для подтверждения',
                    'Ребёнок приходит на бесплатное пробное занятие',
                    'Выбираете подходящую группу и оплачиваете',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-brand-red rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-blue-100 text-sm mt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">Что взять с собой</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Спортивную форму (шорты, футболку)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Бутсы или кроссовки с резиновой подошвой
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Бутылку с водой
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Хорошее настроение
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">Или позвоните нам</h3>
                <div className="space-y-2">
                  {['+7-978-813-09-82', '+7-978-812-64-32', '+7-978-10-40-940'].map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                      className="block text-brand-red hover:underline font-medium"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
