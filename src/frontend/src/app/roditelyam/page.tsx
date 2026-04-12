import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Родителям',
  description:
    'Информация для родителей о занятиях в ФК Арсенал-92: безопасность, медицинский осмотр, форма, расписание.',
};

const sections = [
  {
    title: 'Безопасность',
    content:
      'Все тренировки проводятся под постоянным надзором лицензированных тренеров. На стадионе дежурит медработник. Мы строго следуем возрастным нормам нагрузок.',
  },
  {
    title: 'Медицинский осмотр',
    content:
      'Перед началом занятий необходимо предоставить медицинскую справку от педиатра (форма 086). Справка действительна 1 год. Помогаем организовать осмотр при необходимости.',
  },
  {
    title: 'Форма и экипировка',
    content:
      'Форма клуба включена в стоимость тарифов Standard+ и PRO. Для плана Standard её можно приобрести отдельно. Для первых занятий достаточно любой спортивной одежды.',
  },
  {
    title: 'Оплата',
    content:
      'Оплата ежемесячно до 5-го числа. Принимаем наличные и переводы на карту. Скидка 10% при записи двух и более детей из одной семьи.',
  },
  {
    title: 'Пропуски тренировок',
    content:
      'Пропущенные тренировки не компенсируются, кроме случаев болезни (при наличии справки). В этом случае производится перерасчёт.',
  },
  {
    title: 'Связь с тренером',
    content:
      'Тренер доступен для коротких разговоров до и после тренировки. Для подробных обсуждений записывайтесь на встречу через администратора клуба.',
  },
];

export default function RoditelyamPage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Родителям</h1>
          <p className="text-blue-300 text-lg">
            Всё что нужно знать о занятиях вашего ребёнка
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {sections.map((s) => (
              <div key={s.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="font-bold text-brand-blue text-lg mb-2">{s.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="bg-brand-red/5 border border-brand-red/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-brand-blue mb-3">Есть вопросы?</h2>
            <p className="text-gray-600 mb-6">
              Позвоните нам или напишите — мы с удовольствием ответим на любые вопросы.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+79788130982" className="btn-primary">
                Позвонить
              </a>
              <Link href="/kontakty" className="btn-secondary">
                Написать
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
