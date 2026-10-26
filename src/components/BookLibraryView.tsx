import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Play,
  Pause,
  Heart,
  Plus,
  Flame,
  Clock,
  Sparkles,
  Headphones,
  User,
} from 'lucide-react';
import { Book } from '../types/book';

interface BookLibraryViewProps {
  books: Book[];
  activeBookId: string | null;
  isPlaying: boolean;
  onSelectBook: (book: Book) => void;
  onPlayBook: (book: Book) => void;
  onOpenAddModal: () => void;
  onToggleFavorite: (bookId: string) => void;
}

export const BookLibraryView: React.FC<BookLibraryViewProps> = ({
  books,
  activeBookId,
  isPlaying,
  onSelectBook,
  onPlayBook,
  onOpenAddModal,
  onToggleFavorite,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'Tất cả', label: 'Tất cả sách' },
    { id: 'top_reads', label: 'Đọc Nhiều Nhất 🔥' },
    { id: 'top_likes', label: 'Yêu Thích Nhất ❤️' },
    { id: 'co_tich', label: 'Cổ tích & Dân gian 🏰' },
    { id: 'ky_nang', label: 'Kỹ năng & Tri thức 💡' },
    { id: 'custom', label: 'Sách tự thêm 📂' },
  ];

  const filteredBooks = useMemo(() => {
    let list = [...books];

    if (selectedFilter === 'top_reads') {
      list.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
    } else if (selectedFilter === 'top_likes') {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (selectedFilter === 'custom') {
      list = list.filter((b) => b.id.startsWith('custom-'));
    } else if (selectedFilter === 'co_tich') {
      list = list.filter((b) => b.category.toLowerCase().includes('cổ tích') || b.category.toLowerCase().includes('thiếu nhi'));
    } else if (selectedFilter === 'ky_nang') {
      list = list.filter((b) => b.category.toLowerCase().includes('kỹ năng') || b.category.toLowerCase().includes('thế giới'));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [books, selectedFilter, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#3a2e16]/80 via-[#121212] to-[#121212] text-white select-none pb-44 md:pb-14">
      {/* 1. Spotify Ambient Header Banner for Kho Sách */}
      <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6 bg-gradient-to-b from-[#d97706]/30 to-transparent text-center md:text-left">
        {/* Cover Collage / Large Artwork */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-2xl md:rounded-2xl bg-gradient-to-br from-amber-600 via-amber-900 to-black shadow-2xl flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden group">
          <BookOpen className="w-14 h-14 md:w-20 md:h-20 text-white/90 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Header Metadata */}
        <div className="flex-1 flex flex-col justify-end min-w-0 w-full">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-amber-300">
            KHO SÁCH NÓI & TRUYỆN TRANH • DINO AUDIO
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-1 md:mt-2 mb-2 md:mb-3 text-white leading-tight">
            Kho Sách Nói AI & Giọng Người Dùng
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 line-clamp-2 mb-3 md:mb-4 max-w-2xl leading-relaxed">
            Hàng trăm tác phẩm văn học thiếu nhi kinh điển, ngụ ngôn rèn luyện nhân cách và sách do chính bạn đưa vào đọc bằng Giọng Người Dùng.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-neutral-300 font-medium">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>DiNo Studio</span>
            </span>
            <span>•</span>
            <span>{books.length} tác phẩm</span>
            <span>•</span>
            <span className="text-[#1ed760] font-semibold">Tự động ngắt nghỉ & truyền cảm xúc</span>
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-4 md:px-8 py-3 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Add Book Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm sách bằng văn bản</span>
            </button>
          </div>

          {/* Quick Search in Books */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên sách, tác giả, nội dung..."
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] text-xs text-white placeholder-neutral-400 px-3.5 py-2 rounded-full border border-neutral-700 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 active:scale-95 ${
                selectedFilter === tab.id
                  ? 'bg-white text-black shadow font-bold'
                  : 'bg-[#232323] text-neutral-300 hover:bg-[#2c2c2c] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid of Books with Plays & Likes Stats */}
      <div className="px-3 md:px-8 mt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-extrabold text-sm md:text-base text-white">
            {selectedFilter === 'top_reads'
              ? 'Tác Phẩm Được Đọc & Nghe Nhiều Nhất 🔥'
              : selectedFilter === 'top_likes'
              ? 'Tác Phẩm Được Thả Tim Nhiều Nhất ❤️'
              : 'Tất Cả Tác Phẩm Trong Kho Sách'}
          </span>
          <span className="text-xs text-neutral-400 font-semibold">({filteredBooks.length} cuốn)</span>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-3 bg-[#161616]/70 rounded-2xl border border-[#262626]">
            <BookOpen className="w-12 h-12 mx-auto text-neutral-600" />
            <p className="font-semibold text-base text-white">Chưa tìm thấy sách phù hợp</p>
            <p className="text-xs text-neutral-400">
              Hãy bấm nút <strong>"Thêm sách bằng văn bản"</strong> để tạo sách nói bằng giọng của chính bạn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => {
              const isCurrentActive = activeBookId === book.id;
              const isPlayingThis = isCurrentActive && isPlaying;

              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="group bg-[#181818] hover:bg-[#262626] p-3.5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col relative border border-[#242424] hover:border-neutral-600 shadow hover:shadow-2xl"
                >
                  {/* Square Cover container */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#242424] relative shadow mb-3">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${book.coverGradient} flex items-center justify-center`}
                      >
                        <BookOpen className="w-10 h-10 text-white/70" />
                      </div>
                    )}

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(book.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-neutral-300 hover:text-white active:scale-90"
                      title={book.isFavorite ? 'Bỏ thích' : 'Thả tim sách'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          book.isFavorite
                            ? 'fill-rose-500 text-rose-500'
                            : 'hover:text-white'
                        }`}
                      />
                    </button>

                    {/* Chapters badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-medium text-neutral-300">
                      {book.chapters.length} chương
                    </div>

                    {/* Spotify Floating Green Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayBook(book);
                      }}
                      className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-2xl transition-all transform ${
                        isPlayingThis
                          ? 'opacity-100 scale-100'
                          : 'opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 hover:scale-105 active:scale-95'
                      }`}
                      title={isPlayingThis ? 'Tạm dừng' : 'Nghe toàn bộ sách'}
                    >
                      {isPlayingThis ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Book Title */}
                  <h4
                    className={`font-bold text-sm truncate ${
                      isCurrentActive ? 'text-[#1ed760]' : 'text-white'
                    }`}
                    title={book.title}
                  >
                    {book.title}
                  </h4>

                  {/* Author & Stats */}
                  <p className="text-xs text-neutral-400 truncate mt-1">{book.author}</p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-[#2a2a2a]">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Headphones className="w-3 h-3" />
                      <span>{book.readCount ? book.readCount.toLocaleString() : '3.4k'}</span>
                    </span>

                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3 h-3 fill-rose-500" />
                      <span>{book.likesCount || 890}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
