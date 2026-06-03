'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryProps {
  screenshots: { id: string; url: string; caption: string | null }[];
  title: string;
}

export default function Gallery({ screenshots, title }: GalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (screenshots.length === 0) return null;

  return (
    <div>
      <div
        className="relative aspect-video rounded-xl overflow-hidden bg-black/30 cursor-pointer group"
        onClick={() => setLightbox(true)}
      >
        <img
          src={screenshots[current].url}
          alt={screenshots[current].caption || `${title} screenshot`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-lg text-sm">
            View Fullscreen
          </span>
        </div>
      </div>

      {screenshots.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {screenshots.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-cyan-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={s.url} alt={s.caption || ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(false)}>
            <X className="w-6 h-6" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            onClick={e => { e.stopPropagation(); setCurrent(prev => (prev - 1 + screenshots.length) % screenshots.length); }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img
            src={screenshots[current].url}
            alt={screenshots[current].caption || ''}
            className="max-w-5xl max-h-[80vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            onClick={e => { e.stopPropagation(); setCurrent(prev => (prev + 1) % screenshots.length); }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 text-white/50 text-sm">{current + 1} / {screenshots.length}</div>
        </div>
      )}
    </div>
  );
}
