import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/api';
import ContactForm from '@/components/ContactForm';
import { JsonLd } from '@/components/JsonLd';
import { getLocalBusinessSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Контакты',
  description:
    'Контакты ФК Арсенал-92 в Севастополе. Телефоны, адрес, карта проезда. Напишите нам онлайн.',
};

export default async function KontaktyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd data={getLocalBusinessSchema()} />

      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Контакты</h1>
          <p className="text-blue-300 text-lg">Мы всегда рады ответить на ваши вопросы</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-brand-blue mb-6">Наши контакты</h2>

              <div className="space-y-5">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Адрес</div>
                    <p className="text-gray-600 text-sm mt-0.5">{settings.address}</p>
                  </div>
                </div>

                {/* Phones */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Телефоны</div>
                    {settings.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                        className="block text-brand-red hover:underline text-sm mt-0.5"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Email</div>
                    <a href={`mailto:${settings.email}`} className="text-brand-red hover:underline text-sm mt-0.5 block">
                      {settings.email}
                    </a>
                  </div>
                </div>

                {/* Socials */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Социальные сети</div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {settings.socials.vk && (
                        <a href={settings.socials.vk} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline text-sm">ВКонтакте</a>
                      )}
                      {settings.socials.telegram && (
                        <a href={settings.socials.telegram} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline text-sm">Telegram</a>
                      )}
                      {settings.socials.youtube && (
                        <a href={settings.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline text-sm">YouTube</a>
                      )}
                      {settings.socials.dzen && (
                        <a href={settings.socials.dzen} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline text-sm">Дзен</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-8 h-64 bg-gray-200 rounded-xl overflow-hidden">
                {settings.mapEmbedUrl ? (
                  <iframe
                    src={settings.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Карта проезда к ФК Арсенал-92"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Карта загружается...
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-brand-blue mb-6">Напишите нам</h2>
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
