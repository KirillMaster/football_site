import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Видео',
  description: 'Видеогалерея футбольного клуба «Арсенал» Севастополь — лучшие моменты тренировок и матчей.',
};

const S3_BASE = 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads';

const mockVideos = [
  {
    id: 1,
    title: 'ДФК Арсенал — тренировки и матчи',
    rutubeId: '1335a9553dac12ea586c0ce0a90456cf',
    date: '2026-04-01',
  },
];

export default function VideoPage() {
  return (
    <>
      <section className="bg-brand-blue text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Видео</h1>
          <p className="text-blue-300 text-lg">Видеогалерея клуба</p>
        </div>
      </section>

      {/* Featured — Arsenal Sevastopol promo */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-6 text-center">Арсенал Севастополь</h2>
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              controls
              preload="metadata"
              poster={`${S3_BASE}/arsenal_full_poster.jpg`}
              className="absolute inset-0 w-full h-full object-contain"
            >
              <source src={`${S3_BASE}/arsenal_full.mp4`} type="video/mp4" />
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            Промо-ролик футбольного клуба «Арсенал» Севастополь
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-8 text-center">Другие видео</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative aspect-video bg-gray-200">
                  <iframe
                    src={`https://rutube.ru/play/embed/${video.rutubeId}/`}
                    title={video.title}
                    className="w-full h-full"
                    allow="clipboard-write; autoplay"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm">{video.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{video.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
