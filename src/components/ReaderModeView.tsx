import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, ZoomIn, ZoomOut, Volume2 } from 'lucide-react';
import { Book, Chapter } from '../types/book';

interface ReaderModeViewProps {
  book: Book;
  chapter: Chapter;
  sentences: string[];
  currentSentenceIndex: number;
  isPlaying: boolean;
  onClose: () => void;
  onSeekSentence: (index: number) => void;
  onTogglePlay: () => void;
}

export const ReaderModeView: React.FC<ReaderModeViewProps> = ({
  book,
  chapter,
  sentences,
  currentSentenceIndex,
  isPlaying,
  onClose,
  onSeekSentence,
  onTogglePlay,
}) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(2); // 1 = small, 2 = medium, 3 = large, 4 = xl
  const activeSentenceRef = useRef<HTMLParagraphElement | null>(null);

  // Auto scroll into view when sentence advances
  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentSentenceIndex]);

  const fontClass =
    fontSizeLevel === 1
      ? 'text-base md:text-lg leading-relaxed'
      : fontSizeLevel === 2
      ? 'text-lg md:text-2xl leading-loose'
      : fontSizeLevel === 3
      ? 'text-xl md:text-3xl leading-loose'
      : 'text-2xl md:text-4xl leading-loose';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none text-white overflow-hidden transition-all duration-300"
      style={{
        background: `radial-gradient(circle at 50% 20%, ${book.coverBgColor || '#064e3b'} 0%, #0d0d0d 80%, #000000 100%)`,
      }}
    >
      {/* Top Controls Bar */}
      <div className="h-16 px-6 md:px-12 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded bg-[#1ed760] text-black flex items-center justify-center font-bold text-xs shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="font-bold text-sm text-white truncate">{book.title}</h3>
            <p className="text-xs text-neutral-300 truncate">{chapter.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Font Resizing */}
          <div className="flex items-center bg-black/50 rounded-full border border-white/10 px-2 py-1 gap-1">
            <button
              onClick={() => setFontSizeLevel((prev) => Math.max(1, prev - 1))}
              disabled={fontSizeLevel <= 1}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
              title="Giảm cỡ chữ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-1 text-neutral-300">
              {fontSizeLevel === 1 ? 'A' : fontSizeLevel === 2 ? 'A+' : fontSizeLevel === 3 ? 'A++' : 'MAX'}
            </span>
            <button
              onClick={() => setFontSizeLevel((prev) => Math.min(4, prev + 1))}
              disabled={fontSizeLevel >= 4}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
              title="Tăng cỡ chữ"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            title={isPlaying ? 'Tạm dừng' : 'Đọc tiếp'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Close Reader */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Đóng chế độ đọc chữ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Text Container (Spotify Lyrics style) */}
      <div className="flex-1 overflow-y-auto px-6 md:px-24 lg:px-48 py-12 md:py-20 space-y-6 scroll-smooth">
        {/* Chapter Title Headline */}
        <div className="mb-10 text-center">
          <span className="text-xs uppercase tracking-widest text-[#1ed760] font-black">
            BẢN ĐỌC ĐỒNG BỘ • AUDIOBOOK LYRICS
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-2">
            {chapter.title}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Bấm vào bất kỳ câu nào để giọng đọc nhảy tới vị trí đó
          </p>
        </div>

        {/* Sentences List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {sentences.map((sentence, idx) => {
            const isActive = idx === currentSentenceIndex;

            return (
              <p
                key={`sentence-${idx}`}
                ref={isActive ? activeSentenceRef : null}
                onClick={() => onSeekSentence(idx)}
                className={`cursor-pointer rounded-xl px-4 py-2.5 transition-all duration-300 font-medium ${fontClass} ${
                  isActive
                    ? 'text-white font-extrabold bg-[#1ed760]/20 border-l-4 border-[#1ed760] shadow-lg shadow-[#1ed760]/10 scale-[1.01]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                {sentence}
              </p>
            );
          })}
        </div>

        <div className="h-32"></div>
      </div>
    </div>
  );
};
