import React from 'react';
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
  const totalWords = book.chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const totalDurationSec = book.chapters.reduce(
    (sum, c) => sum + (c.estimatedDurationSec || 0),
    0
  );

  const isCurrentBookPlaying =
    isPlaying && book.chapters.some((c) => c.id === activeChapterId);

  return (
    <div className="flex-1 overflow-y-auto select-none pb-12">
      {/* Big Spotify Header with Ambient Gradient */}
      <div
        className="p-6 md:p-8 pt-12 md:pt-16 pb-6 flex flex-col md:flex-row items-start md:items-end gap-6 transition-all"
        style={{
          background: `linear-gradient(to bottom, ${book.coverBgColor || '#1f382a'} 0%, rgba(18, 18, 18, 0.95) 100%)`,
        }}
      >
        {/* Cover Art */}
        <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-lg overflow-hidden shrink-0 shadow-2xl bg-[#1e1e1e] border border-white/10 relative group">
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
              <BookOpen className="w-16 h-16 text-white/80" />
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="flex-1 flex flex-col justify-end text-white min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-300">
            Sách Nói • Audio Book
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-2 mb-3 text-white">
            {book.title}
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 line-clamp-2 md:line-clamp-3 mb-4 max-w-3xl leading-relaxed">
            {book.description || 'Nội dung sách nói tự dán văn bản.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300 font-medium">
            <span className="font-bold text-white hover:underline cursor-pointer">
              {book.author}
            </span>
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

      {/* Action Bar */}
      <div className="px-6 md:px-8 py-5 flex items-center justify-between gap-4 border-b border-[#282828] bg-[#121212]/90 sticky top-16 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Main Big Play/Pause Button */}
          <button
            onClick={() => {
              if (isCurrentBookPlaying) {
                onTogglePlay();
              } else {
                onPlayBook(book);
              }
            }}
            className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
            title={isCurrentBookPlaying ? 'Tạm dừng' : 'Nghe toàn bộ tác phẩm'}
          >
            {isCurrentBookPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(book.id)}
            className="p-3 text-neutral-400 hover:text-white transition-all hover:scale-110 active:scale-95"
            title={book.isFavorite ? 'Bỏ thích' : 'Yêu thích tác phẩm'}
          >
            <Heart
              className={`w-7 h-7 ${
                book.isFavorite
                  ? 'fill-[#1ed760] text-[#1ed760]'
                  : 'hover:text-white'
              }`}
            />
          </button>

          {/* Read Text Mode */}
          <button
            onClick={() => onOpenReader()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2f2f2f] text-white text-xs font-bold border border-[#3e3e3e]/40 transition-all hover:scale-105 active:scale-95 shadow"
            title="Đọc văn bản toàn bộ sách và theo dõi dòng đọc"
          >
            <FileText className="w-4 h-4 text-[#1ed760]" />
            <span>Chế độ đọc chữ</span>
          </button>

          {/* Add Chapter to this Book */}
          <button
            onClick={() => onOpenAddChapter(book)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2f2f2f] text-neutral-200 hover:text-white text-xs font-bold border border-[#3e3e3e]/40 transition-all hover:scale-105 active:scale-95"
            title="Thêm một chương mới vào cuốn sách này"
          >
            <Plus className="w-4 h-4 text-[#1ed760]" />
            <span>Thêm chương</span>
          </button>
        </div>

        {/* Delete Book (if custom book) */}
        {book.id.startsWith('custom-') && (
          <button
            onClick={() => {
              if (window.confirm(`Bạn có chắc chắn muốn xóa sách "${book.title}"?`)) {
                onDeleteBook(book.id);
              }
            }}
            className="p-2.5 rounded-full hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
            title="Xóa cuốn sách này"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Chapters Table (Spotify Tracklist format) */}
      <div className="px-4 md:px-8 py-4">
        <table className="w-full text-left text-xs md:text-sm text-neutral-400 border-collapse">
          <thead>
            <tr className="border-b border-[#282828] text-[11px] uppercase tracking-wider font-semibold text-neutral-400 pb-2">
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-3">Tiêu đề chương</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Số từ</th>
              <th className="py-2.5 px-3">Thời lượng</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {book.chapters.map((chap, idx) => {
              const isCurrentChap = activeChapterId === chap.id;
              const isChapPlaying = isCurrentChap && isPlaying;

              return (
                <tr
                  key={chap.id}
                  onClick={() => onPlayBook(book, chap)}
                  className={`group rounded-md cursor-pointer transition-colors ${
                    isCurrentChap
                      ? 'bg-[#282828] text-white'
                      : 'hover:bg-[#1a1a1a] text-neutral-300 hover:text-white'
                  }`}
                >
                  {/* # or Play button */}
                  <td className="py-3 px-3 text-center w-12 font-medium">
                    <span className="group-hover:hidden">
                      {isChapPlaying ? (
                        <Volume2 className="w-4 h-4 text-[#1ed760] mx-auto animate-pulse" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <button
                      className="hidden group-hover:flex items-center justify-center mx-auto text-white"
                      title={isChapPlaying ? 'Tạm dừng' : 'Nghe chương này'}
                    >
                      {isChapPlaying ? (
                        <Pause className="w-4 h-4 fill-current text-[#1ed760]" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-3 font-semibold text-white">
                    <span
                      className={`line-clamp-1 ${
                        isCurrentChap ? 'text-[#1ed760]' : ''
                      }`}
                    >
                      {chap.title}
                    </span>
                    <span className="sm:hidden text-[11px] text-neutral-400 block mt-0.5">
                      {chap.wordCount} từ
                    </span>
                  </td>

                  {/* Words */}
                  <td className="py-3 px-3 hidden sm:table-cell text-neutral-400">
                    {chap.wordCount.toLocaleString('vi-VN')} từ
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-3 tabular-nums text-neutral-400 font-medium">
                    {formatTime(chap.estimatedDurationSec)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReader(chap);
                        }}
                        className="p-1.5 rounded hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors"
                        title="Đọc văn bản chương này"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {book.id.startsWith('custom-') && book.chapters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Xóa chương "${chap.title}"?`)) {
                              onDeleteChapter(book.id, chap.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                          title="Xóa chương này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
