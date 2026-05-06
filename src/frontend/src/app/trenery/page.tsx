import type { Metadata } from 'next';
import { getCoaches } from '@/lib/api';
import CoachCard from '@/components/CoachCard';
import { JsonLd } from '@/components/JsonLd';
import { getCoachSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Тренеры',
  description:
    'Тренерский состав футбольного клуба «Арсенал» Севастополь. Лицензия УЕФА категории C. Узнайте о каждом тренере клуба.',
};

export default async function TreneryPage() {
  const coaches = await getCoaches();

  return (
    <>
      <JsonLd data={coaches.map(getCoachSchema)} />

      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Тренеры</h1>
          <p className="text-blue-300 text-lg">
            Профессиональные специалисты с лицензиями UEFA и РФС
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy strip */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="section-title text-center">Наш подход</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
            Мы требовательны изначально к себе! Уделяем огромное внимание обучению тренерского
            состава на курсах академии РФС, УЕФА, постоянно пополняем клубную библиотеку
            специализированной литературой, следуя последним прогрессивным тенденциям в
            методиках тренировочного процесса.
          </p>

          <h3 className="text-center text-base font-bold uppercase tracking-wide text-brand-blue mt-12 mb-6">
            Сертификаты и лицензии
          </h3>
          <CertificatesGallery />
        </div>
      </section>
    </>
  );
}

const certificates: { src: string; title: string }[] = [
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_uefa_license_c.jpg', title: 'Лицензия категории C УЕФА' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_uefa_diploma_c.jpg', title: 'Диплом тренерской лицензии C УЕФА' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_qualification.jpg', title: 'Удостоверение о повышении квалификации' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_grassroots_2024.jpg', title: 'Сертификат Grassroots' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_adaptive_football.jpg', title: 'Сертификат: адаптивный футбол' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_rfs_mass_football_org.jpg', title: 'Сертификат РФС: организация массового футбола' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_rfs_kids_football.jpg', title: 'Сертификат: массовый детский футбол' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_effective_env_kids.jpg', title: 'Создание эффективной среды для детей' },
  { src: 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/cert_physical_literacy.jpg', title: 'Физическая грамотность' },
];

function CertificatesGallery() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
      {certificates.map((c) => (
        <a
          key={c.src}
          href={c.src}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          title={c.title}
        >
          <div className="relative w-full aspect-[3/4] bg-gray-50">
            { /* eslint-disable-next-line @next/next/no-img-element */ }
            <img src={c.src} alt={c.title} loading="lazy" className="w-full h-full object-contain" />
          </div>
          <div className="px-2 py-2 text-xs text-center text-gray-600 leading-snug">{c.title}</div>
        </a>
      ))}
    </div>
  );
}
