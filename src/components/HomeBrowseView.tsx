import React, { useMemo, useState } from 'react';
import { Play, Pause, BookOpen, Music, Heart, ChevronRight } from 'lucide-react';
import { Book, MusicTrack } from '../types/book';
import { formatTime } from '../utils/textParser';

interface HomeBrowseViewProps {
  books: Book[];
  activeBookId: string | null;
  isPlaying: boolean;
  onSelectBook: (book: Book) => void;
  onPlayBook: (book: Book) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  // Music support
  tracks?: MusicTrack[];
  currentTrack?: MusicTrack | null;
  isPlayingMusic?: boolean;
  onPlayTrack?: (track: MusicTrack) => void;
  onNavigateMusic?: () => void;
  onNavigateBookLibrary?: () => void;
}

export const HomeBrowseView: React.FC<HomeBrowseViewProps> = ({
  books,
  activeBookId,
  isPlaying,
  onSelectBook,
  onPlayBook,
  searchQuery,
  tracks = [],
  currentTrack = null,
  isPlayingMusic = false,
  onPlayTrack,
  onNavigateMusic,
  onNavigateBookLibrary,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Chào buổi sáng';
    if (hour >= 12 && hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, []);

  // Filter books by search and category
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.chapters.some((c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

      let matchCategory = true;
      if (selectedCategory === 'Sách nói') matchCategory = true;
      else if (selectedCategory === 'Kho Nhạc') matchCategory = false;
      else if (selectedCategory !== 'Tất cả') {
        matchCategory = b.category.toLowerCase().includes(selectedCategory.toLowerCase());
      }

      return matchSearch && matchCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  // Filter music tracks by search
  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    return tracks.filter((t) => {
      if (!searchQuery) return true;
      return (
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [tracks, searchQuery]);

  const categories = ['Tất cả', 'Sách nói', 'Kho Nhạc', 'Văn học', 'Kỹ năng', 'Cổ tích'];

  const customBooks = books.filter((b) => b.id.startsWith('custom-'));
  const recentQuickBooks = books.slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1f382a]/70 via-[#121212] to-[#121212] p-3 md:p-8 pb-44 md:pb-14 space-y-6 md:space-y-8 text-white select-none">
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedCategory === cat
                ? 'bg-white text-black shadow'
                : 'bg-[#232323] text-neutral-300 hover:bg-[#2c2c2c] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Greeting & Top Quick 6 Tiles (Spotify Style) */}
      {!searchQuery && selectedCategory === 'Tất cả' && (
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {greeting}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentQuickBooks.map((book) => {
              const isCurrent = activeBookId === book.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`quick-${book.id}`}
                  onClick={() => onSelectBook(book)}
                  className="group flex items-center bg-[#282828]/60 hover:bg-[#383838]/80 rounded-md overflow-hidden cursor-pointer transition-all duration-200 relative shadow-md"
                >
                  {/* Thumbnail Cover */}
                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-[#1e1e1e] relative">
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
                        <BookOpen className="w-6 h-6 text-white/80" />
                      </div>
                    )}
                  </div>

                  {/* Title & Author */}
                  <div className="flex-1 px-3 min-w-0 pr-12">
                    <h3 className="font-bold text-sm md:text-base truncate group-hover:text-white transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {book.author}
                    </p>
                  </div>

                  {/* Spotify Floating Green Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayBook(book);
                    }}
                    className={`absolute right-3 w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg transition-all transform ${
                      isCurrentPlaying
                        ? 'opacity-100 scale-100'
                        : 'opacity-100 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 hover:scale-105 active:scale-95'
                    }`}
                    title={isCurrentPlaying ? 'Tạm dừng' : 'Nghe ngay'}
                  >
                    {isCurrentPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 🎵 SPOTIFY MUSIC SHELF: Kho Nhạc Thiếu Nhi & Gia Đình */}
      {(selectedCategory === 'Tất cả' || selectedCategory === 'Kho Nhạc') && tracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-[#1ed760]" />
                <span>Kho Nhạc Thiếu Nhi & Gia Đình</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760]">
                  {tracks.length} bài
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Các bài hát đồng dao, nhạc tiếng Anh, khúc ru ngủ và bài ca do gia đình tự thêm
              </p>
            </div>

            {onNavigateMusic && (
              <button
                onClick={onNavigateMusic}
                className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors group"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredTracks.slice(0, 6).map((track) => {
              const isPlayingThisTrack = isPlayingMusic && currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack?.(track)}
                  className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg cursor-pointer transition-all duration-300 flex flex-col relative shadow hover:shadow-xl"
                >
                  <div className="w-full aspect-square rounded-md overflow-hidden bg-[#242424] relative shadow mb-3">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${track.coverGradient} flex items-center justify-center`}
                      >
                        <Music className="w-10 h-10 text-white/70" />
                      </div>
                    )}

                    {/* Spotify Floating Green Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack?.(track);
                      }}
                      className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-2xl transition-all transform ${
                        isPlayingThisTrack
                          ? 'opacity-100 scale-100'
                          : 'opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 hover:scale-105 active:scale-95'
                      }`}
                      title={isPlayingThisTrack ? 'Tạm dừng' : 'Phát bài hát'}
                    >
                      {isPlayingThisTrack ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  <h4
                    className={`font-bold text-sm truncate ${
                      currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white'
                    }`}
                    title={track.title}
                  >
                    {track.title}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate mt-1">{track.artist}</p>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                    <span className="capitalize">
                      {track.category === 'vui_nhon' ? 'Vui nhộn' : track.category === 'ru_ngu' ? 'Ru ngủ' : track.category}
                    </span>
                    <span>{formatTime(track.durationSec || 60)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Custom User Books Shelf (Thêm bằng văn bản) */}
      {selectedCategory !== 'Kho Nhạc' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Sách của bạn (Tự thêm văn bản)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760]">
                  {customBooks.length} tác phẩm
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Những cuốn sách do chính bạn nhập nội dung văn bản và tạo giọng đọc AI
              </p>
            </div>
          </div>

          {customBooks.length === 0 ? (
            <div className="p-6 md:p-8 rounded-xl bg-[#181818] border border-[#282828] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1ed760]/10 flex items-center justify-center text-[#1ed760] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Bạn chưa thêm tác phẩm tự tạo nào</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Sử dụng nút <strong className="text-[#1ed760]">"Thêm sách bằng văn bản"</strong> ở thanh menu bên trái để dán truyện ngắn, bài viết hoặc tài liệu bạn muốn nghe!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {customBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isCurrentActive={activeBookId === book.id}
                  isPlaying={isPlaying}
                  onSelect={() => onSelectBook(book)}
                  onPlay={() => onPlayBook(book)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Filtered / Curated Books Grid */}
      {selectedCategory !== 'Kho Nhạc' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>{searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}" (${filteredBooks.length})` : 'Kho Sách Hay Khuyên Đọc'}</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Các tác phẩm văn học thiếu nhi, ngụ ngôn đạo đức và tản văn cuộc sống
              </p>
            </div>

            {onNavigateBookLibrary && (
              <button
                onClick={onNavigateBookLibrary}
                className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors group"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-neutral-500" />
              <p className="font-semibold text-base">Không tìm thấy sách phù hợp</p>
              <p className="text-xs text-neutral-500 mt-1">
                Hãy thử tìm kiếm với từ khóa khác hoặc chọn mục "Kho Nhạc"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isCurrentActive={activeBookId === book.id}
                  isPlaying={isPlaying}
                  onSelect={() => onSelectBook(book)}
                  onPlay={() => onPlayBook(book)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

interface BookCardProps {
  book: Book;
  isCurrentActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPlay: () => void;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  isCurrentActive,
  isPlaying,
  onSelect,
  onPlay,
}) => {
  const isPlayingThis = isCurrentActive && isPlaying;

  return (
    <div
      onClick={onSelect}
      className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg cursor-pointer transition-all duration-300 flex flex-col relative shadow hover:shadow-xl"
    >
      {/* Square Cover container */}
      <div className="w-full aspect-square rounded-md overflow-hidden bg-[#242424] relative shadow mb-3">
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

        {/* Favorite indicator badge */}
        {book.isFavorite && (
          <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 backdrop-blur-sm">
            <Heart className="w-3.5 h-3.5 fill-[#1ed760] text-[#1ed760]" />
          </div>
        )}

        {/* Chapters badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-medium text-neutral-300">
          {book.chapters.length} chương
        </div>

        {/* Spotify Floating Green Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
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

      {/* Author & Category */}
      <p className="text-xs text-neutral-400 truncate mt-1">{book.author}</p>
      <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-[#262626]">
        <span className="text-amber-300 font-medium">
          {book.readCount ? `${book.readCount.toLocaleString()} đọc` : '3.4k đọc'}
        </span>
        <span className="flex items-center gap-1 text-rose-400 font-medium">
          <Heart className="w-3 h-3 fill-rose-500" />
          {book.likesCount || 890}
        </span>
      </div>
    </div>
  );
};
