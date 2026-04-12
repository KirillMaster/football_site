import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Видео',
  description: 'Видеогалерея ФК Арсенал-92 — лучшие моменты тренировок и матчей.',
};

const mockVideos = [
  {
    id: 1,
    title: 'Городской турнир 2026 — лучшие голы',
    youtubeId: 'dQw4w9WgXcQ',
    date: '2026-03-16',
  },
  {
    id: 2,
    title: 'Тренировка группы Кадеты',
    youtubeId: 'dQw4w9WgXcQ',
    date: '2026-03-10',
  },
  {
    id: 3,
    title: 'Интервью с главным тренером',
    youtubeId: 'dQw4w9WgXcQ',
    date: '2026-02-28',
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

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative aspect-video bg-gray-200">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
