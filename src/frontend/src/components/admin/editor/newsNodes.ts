import { Node, mergeAttributes } from '@tiptap/core';

// ─────────────────────────────────────────────────────────────────────────
// NewsImage — атомарный узел одного изображения внутри галереи.
// Разметка (byte-for-byte, задана эталоном): без <figure>-обёртки.
// ─────────────────────────────────────────────────────────────────────────

export interface NewsImageAttrs {
  src: string;
  alt: string;
}

export const NewsImage = Node.create({
  name: 'newsImage',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('src') ?? '',
      },
      alt: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('alt') ?? '',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ node }) {
    return [
      'img',
      mergeAttributes({
        loading: 'lazy',
        style: 'width:100%;height:auto;border-radius:12px',
        src: node.attrs.src,
        alt: node.attrs.alt,
      }),
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '4px';

      const img = document.createElement('img');
      img.setAttribute('loading', 'lazy');
      img.setAttribute('style', 'width:100%;height:auto;border-radius:12px;display:block');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt;
      wrapper.appendChild(img);

      const caption = document.createElement('input');
      caption.type = 'text';
      caption.value = node.attrs.alt;
      caption.placeholder = 'без описания';
      caption.className = 'news-image-caption';
      caption.style.cssText =
        'width:100%;margin-top:4px;font-size:12px;padding:2px 4px;border:1px solid #e5e7eb;border-radius:4px;color:#374151';

      caption.addEventListener('change', () => {
        if (typeof getPos !== 'function') return;
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            alt: caption.value,
          })
        );
      });

      wrapper.appendChild(caption);

      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'newsImage') return false;
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt;
          if (document.activeElement !== caption) {
            caption.value = updatedNode.attrs.alt;
          }
          return true;
        },
      };
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────
// NewsGallery — контейнер из newsImage+, grid-раскладка (эталонная разметка).
// ─────────────────────────────────────────────────────────────────────────

export const NewsGallery = Node.create({
  name: 'newsGallery',
  group: 'block',
  content: 'newsImage+',
  draggable: false,

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (el) => {
          const style = (el as HTMLElement).getAttribute('style') ?? '';
          return style.includes('grid-template-columns') ? {} : false;
        },
      },
    ];
  },

  renderHTML() {
    return [
      'div',
      {
        style:
          'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px',
      },
      0,
    ];
  },
});

// ─────────────────────────────────────────────────────────────────────────
// NewsVideo — атомарный узел видео (video/mp4, без транскодирования).
// ─────────────────────────────────────────────────────────────────────────

export const NewsVideo = Node.create({
  name: 'newsVideo',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (el) => {
          const source = (el as HTMLElement).querySelector('source');
          return source?.getAttribute('src') ?? '';
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video' }];
  },

  renderHTML({ node }) {
    return [
      'div',
      { style: 'display:grid;gap:16px;margin-top:24px' },
      [
        'video',
        {
          controls: '',
          preload: 'metadata',
          playsinline: '',
          style: 'width:100%;border-radius:12px;background:#000',
        },
        ['source', { src: node.attrs.src, type: 'video/mp4' }],
        'Ваш браузер не поддерживает воспроизведение видео.',
      ],
    ];
  },
});
