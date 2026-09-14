'use client';

import { useState, useRef } from 'react';
import { uploadAdminNewsMedia, type NewsMediaUploadResult } from '@/lib/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { NewsGallery, NewsImage, NewsVideo } from '@/components/admin/editor/newsNodes';

export interface AdminNewsDto {
  id: string;
  slug: string;
  titleRu: string;
  titleEn?: string;
  excerptRu: string;
  excerptEn?: string;
  contentRu?: string;
  contentEn?: string;
  metaTitle?: string;
  metaDescription?: string;
  coverImage?: string | null;
  tags: string[];
  isPublished?: boolean;
  publishedAt?: string | null;
}

// Имя файла без расширения — стартовое значение alt-подписи (T007, @AS-5).
function filenameToAlt(name: string): string {
  return name.replace(/\.[^./\\]+$/, '');
}

// Русский текст ошибки для нежелательного исхода загрузки (EC-1/EC-2/EC-3).
// Общий для галереи и видео — оба сценария отличаются только тем, что делают
// с успешным результатом.
function describeUploadFailure(result: NewsMediaUploadResult, fileName: string): string {
  if (result.status === 'unauthorized') return 'Сессия истекла — войдите заново';
  if (result.status === 'network_error') return `${fileName}: нет соединения с сервером`;
  if (result.status === 'rejected') return `${fileName}: ${result.message}`;
  return '';
}

// Баннер ошибки загрузки — общий для блоков «Обложка» и «Содержание».
function UploadErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
      {message}
    </div>
  );
}

export function NewsEditor({
  article,
  onSave,
  onCancel,
  saving,
}: {
  article?: Partial<AdminNewsDto>;
  onSave: (data: {
    titleRu: string;
    excerptRu: string;
    contentRu: string;
    coverImage: string | null;
  }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(article?.titleRu ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerptRu ?? '');
  const [coverImage, setCoverImage] = useState<string | null>(article?.coverImage ?? null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, NewsImage, NewsGallery, NewsVideo],
    content: article?.contentRu ?? '<p>Начните писать...</p>',
  });

  const handleSave = () => {
    onSave({
      titleRu: title,
      excerptRu: excerpt,
      contentRu: editor?.getHTML() ?? '',
      coverImage,
    });
  };

  // T008: обложка — одиночный файл, загрузка/предпросмотр/замена/удаление (@AS-1..@AS-3).
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const coverFile = files[0];

    setUploadingCover(true);
    setUploadError(null);

    const result = await uploadAdminNewsMedia(coverFile);

    if (coverInputRef.current) coverInputRef.current.value = '';
    setUploadingCover(false);

    if (result.status === 'uploaded') {
      setCoverImage(result.url);
    } else {
      setUploadError(describeUploadFailure(result, coverFile.name));
    }
  };

  const handleCoverDelete = () => {
    setCoverImage(null);
  };

  // T006/T011: множественная загрузка изображений одной галереей за один выбор
  // файлов (@AS-4). Ошибки отдельных файлов (EC-1/EC-2/EC-3) не блокируют
  // ни успешные файлы, ни уже введённый текст — редактор остаётся рабочим.
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editor) return;

    setUploadingGallery(true);
    setUploadError(null);
    const uploaded: { src: string; alt: string }[] = [];
    const failures: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await uploadAdminNewsMedia(files[i]);
      if (result.status === 'uploaded') {
        uploaded.push({ src: result.url, alt: filenameToAlt(files[i].name) });
      } else {
        failures.push(describeUploadFailure(result, files[i].name));
      }
    }

    if (galleryInputRef.current) galleryInputRef.current.value = '';
    setUploadingGallery(false);

    if (uploaded.length > 0) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'newsGallery',
          content: uploaded.map((img) => ({
            type: 'newsImage',
            attrs: { src: img.src, alt: img.alt },
          })),
        })
        .run();
    }

    if (failures.length > 0) {
      setUploadError(`Не удалось загрузить: ${failures.join('; ')}`);
    }
  };

  // T006/T011: видео — один файл video/mp4 за раз (@AS-6).
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editor) return;
    const videoFile = files[0];

    setUploadingVideo(true);
    setUploadError(null);

    const result = await uploadAdminNewsMedia(videoFile);

    if (videoInputRef.current) videoInputRef.current.value = '';
    setUploadingVideo(false);

    if (result.status === 'uploaded') {
      editor.chain().focus().insertContent({ type: 'newsVideo', attrs: { src: result.url } }).run();
    } else {
      setUploadError(describeUploadFailure(result, videoFile.name));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Обложка</label>
        <UploadErrorBanner message={uploadError} />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          aria-label="Файл обложки"
          className="hidden"
          onChange={handleCoverUpload}
        />
        {coverImage ? (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt="Обложка новости"
              className="w-40 h-24 object-cover rounded-lg border border-gray-300"
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-3 py-1.5 text-xs bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                {uploadingCover ? 'Загрузка...' : 'Заменить'}
              </button>
              <button
                type="button"
                onClick={handleCoverDelete}
                disabled={uploadingCover}
                className="px-3 py-1.5 text-xs bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 text-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="px-3 py-1.5 text-xs bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            {uploadingCover ? 'Загрузка...' : 'Загрузить обложку'}
          </button>
        )}
      </div>
      <div>
        <label htmlFor="news-title" className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
        <input
          id="news-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Содержание</label>
        <UploadErrorBanner message={uploadError} />
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex gap-2 flex-wrap">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 font-bold"
            >
              B
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 italic"
            >
              I
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
            >
              H2
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
            >
              List
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              {uploadingGallery ? 'Загрузка...' : 'Галерея'}
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingVideo}
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              {uploadingVideo ? 'Загрузка...' : 'Видео'}
            </button>
          </div>
          <EditorContent
            editor={editor}
            className="p-3 min-h-[200px] text-sm prose max-w-none focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button onClick={onCancel} disabled={saving} className="btn-outline text-sm px-6 py-2">
          Отмена
        </button>
      </div>
    </div>
  );
}
