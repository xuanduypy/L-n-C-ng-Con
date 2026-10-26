import React, { useState } from 'react';
import {
  Play,
  Pause,
  Clock,
  Heart,
  Plus,
  Trash2,
  FileText,
  BookOpen,
  Volume2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Book, Chapter } from '../types/book';
import { formatTime } from '../utils/textParser';

interface BookDetailViewProps {
  book: Book;
  activeChapterId?: string;
  isPlaying: boolean;
  onPlayBook: (book: Book, chapter?: Chapter) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (bookId: string) => void;
  onOpenReader: (chapter?: Chapter) => void;
  onOpenAddChapter: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onDeleteChapter: (bookId: string, chapterId: string) => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  activeChapterId,
  isPlaying,
  onPlayBook,
  onTogglePlay,
  onToggleFavorite,
  onOpenReader,
  onOpenAddChapter,
  onDeleteBook,
  onDeleteChapter,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'book' | 'chapter';
    chapterId?: string;
    title: string;
  } | null>(null);

  const totalWords = book.chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const totalDurationSec = book.chapters.reduce(
    (sum, c) => sum + (c.estimatedDurationSec || 0),
    0
  );

  const isCurrentBookPlaying =
    isPlaying && book.chapters.some((c) => c.id === activeChapterId);

  return (
    <div className="flex-1 overflow-y-auto select-none pb-36 md:pb-12 text-white">
      {/* 1. Spotify Ambient Header */}
      <div
        className="p-4 sm:p-6 md:p-8 pt-6 md:pt-16 pb-6 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6 text-center md:text-left transition-all"
        style={{
          background: `linear-gradient(to bottom, ${book.coverBgColor || '#1f382a'} 0%, rgba(18, 18, 18, 0.95) 100%)`,
        }}
      >
        {/* Cover Art */}
        <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl md:rounded-lg overflow-hidden shrink-0 shadow-2xl bg-[#1e1e1e] border border-white/10 relative group">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${book.coverGradient} flex items-center justify-center`}
            >
              <BookOpen className="w-14 h-14 md:w-16 md:h-16 text-white/80" />
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="flex-1 flex flex-col justify-end min-w-0 w-full">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-neutral-300">
            SÁCH NÓI • AUDIO BOOK
          </span>

          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tight mt-1 md:mt-2 mb-2 md:mb-3 text-white leading-tight">
            {book.title}
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 line-clamp-2 md:line-clamp-3 mb-3 md:mb-4 max-w-3xl leading-relaxed">
            {book.description || 'Nội dung sách nói tự dán văn bản.'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-neutral-300 font-medium">
            <span className="font-bold text-white">{book.author}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
              {book.category}
            </span>
            <span>•</span>
            <span>{book.chapters.length} chương</span>
            <span>•</span>
            <span>{totalWords.toLocaleString('vi-VN')} từ</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1ed760] font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(totalDurationSec)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="px-4 md:px-8 py-3 md:py-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#282828] bg-[#121212]/95 sticky top-14 md:top-16 z-20 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5 md:gap-4 w-full sm:w-auto">
          {/* Main Big Play/Pause Button */}
          <button
            onClick={() => {
              if (isCurrentBookPlaying) {
                onTogglePlay();
              } else {
                onPlayBook(book);
              }
            }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-xl transition-all active:scale-95 shrink-0"
            title={isCurrentBookPlaying ? 'Tạm dừng' : 'Nghe toàn bộ tác phẩm'}
          >
            {isCurrentBookPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(book.id)}
            className="p-2.5 text-neutral-400 hover:text-white transition-all active:scale-90"
            title={book.isFavorite ? 'Bỏ thích' : 'Yêu thích tác phẩm'}
          >
            <Heart
              className={`w-6 h-6 ${
                book.isFavorite ? 'fill-[#1ed760] text-[#1ed760]' : 'hover:text-white'
              }`}
            />
          </button>

          {/* Read Text Mode */}
          <button
            onClick={() => onOpenReader()}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2f2f2f] text-white text-xs font-bold border border-[#3e3e3e]/40 transition-all active:scale-95 shadow"
            title="Đọc văn bản toàn bộ sách và theo dõi dòng đọc"
          >
            <FileText className="w-4 h-4 text-[#1ed760]" />
            <span>Chế độ đọc chữ</span>
          </button>

          {/* Add Chapter */}
          <button
            onClick={() => onOpenAddChapter(book)}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2f2f2f] text-neutral-200 hover:text-white text-xs font-bold border border-[#3e3e3e]/40 transition-all active:scale-95"
            title="Thêm một chương mới vào cuốn sách này"
          >
            <Plus className="w-4 h-4 text-[#1ed760]" />
            <span>Thêm chương</span>
          </button>
        </div>

        {/* Delete Book (if custom book) */}
        {book.id.startsWith('custom-') && (
          <button
            onClick={() =>
              setDeleteConfirm({
                type: 'book',
                title: book.title,
              })
            }
            className="p-2.5 rounded-full hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors ml-auto sm:ml-0"
            title="Xóa cuốn sách này"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3. Chapters Table List */}
      <div className="px-3 md:px-8 py-3">
        <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2 px-2">
          Danh Sách Các Chương ({book.chapters.length})
        </h3>

        <div className="divide-y divide-[#242424] bg-[#161616]/60 rounded-2xl border border-[#262626] overflow-hidden">
          {book.chapters.map((chap, idx) => {
            const isCurrentChap = activeChapterId === chap.id;
            const isChapPlaying = isCurrentChap && isPlaying;

            return (
              <div
                key={chap.id}
                onClick={() => onPlayBook(book, chap)}
                className={`flex items-center justify-between p-3 sm:p-3.5 cursor-pointer transition-colors active:bg-[#2a2a2a] ${
                  isCurrentChap ? 'bg-[#242424] text-white' : 'hover:bg-[#1c1c1c] text-neutral-300'
                }`}
              >
                {/* Left: Play/Pause/Index + Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center shrink-0">
                    {isChapPlaying ? (
                      <Volume2 className="w-4 h-4 text-[#1ed760] animate-pulse" />
                    ) : (
                      <span className="text-xs font-bold text-neutral-400">{idx + 1}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrentChap ? 'text-[#1ed760]' : 'text-white'
                      }`}
                    >
                      {chap.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{chap.wordCount.toLocaleString('vi-VN')} từ</span>
                      <span>•</span>
                      <span>{formatTime(chap.estimatedDurationSec)}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReader(chap);
                    }}
                    className="p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white"
                    title="Đọc văn bản"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </button>

                  {book.id.startsWith('custom-') && book.chapters.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({
                          type: 'chapter',
                          chapterId: chap.id,
                          title: chap.title,
                        });
                      }}
                      className="p-2 rounded-full hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400"
                      title="Xóa chương này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-app Confirmation Modal (No window.confirm) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-white">Xác nhận xóa</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'book' ? 'sách' : 'chương'}{' '}
                <strong>"{deleteConfirm.title}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-full bg-[#2a2a2a] text-xs font-bold text-neutral-300 hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'book') {
                    onDeleteBook(book.id);
                  } else if (deleteConfirm.chapterId) {
                    onDeleteChapter(book.id, deleteConfirm.chapterId);
                  }
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
