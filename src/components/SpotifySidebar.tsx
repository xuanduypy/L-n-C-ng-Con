import React, { useState } from 'react';
import {
  Home,
  Search,
  BookOpen,
  Music,
  Plus,
  Heart,
  Volume2,
  Disc,
  Flame,
} from 'lucide-react';
import { Book, ViewMode } from '../types/book';

interface SpotifySidebarProps {
  books: Book[];
  activeBookId: string | null;
  isPlaying: boolean;
  currentView: ViewMode;
  onNavigateHome: () => void;
  onNavigateSearch: () => void;
  onNavigateMusic: () => void;
  onNavigateBookLibrary: () => void;
  onSelectBook: (book: Book) => void;
  onOpenAddModal: () => void;
  onOpenAddMusicModal?: () => void;
}

export const SpotifySidebar: React.FC<SpotifySidebarProps> = ({
  books,
  activeBookId,
  isPlaying,
  currentView,
  onNavigateHome,
  onNavigateSearch,
  onNavigateMusic,
  onNavigateBookLibrary,
  onSelectBook,
  onOpenAddModal,
  onOpenAddMusicModal: _onOpenAddMusicModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites' | 'custom' | 'top'>('all');

  const filteredBooks = books.filter((b) => {
    if (filter === 'favorites') return b.isFavorite;
    if (filter === 'custom') return b.id.startsWith('custom-');
    if (filter === 'top') return (b.likesCount || 0) > 800 || (b.readCount || 0) > 3000;
    return true;
  });

  return (
    <aside className="hidden md:flex w-64 md:w-72 bg-black flex-col h-full select-none border-r border-[#1f1f1f] text-[#b3b3b3] p-2 gap-2 shrink-0">
      {/* Top Nav Box */}
      <div className="bg-[#121212] rounded-2xl p-4 flex flex-col gap-4">
        {/* DiNo Brand Header */}
        <div className="flex items-center gap-3 px-1 cursor-pointer" onClick={onNavigateHome}>
          <img
            src="/icon.svg"
            alt="DiNo"
            className="w-11 h-11 rounded-2xl shadow-lg border border-amber-300/40 object-cover"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
              DiNo
              <span className="text-[10px] uppercase font-black tracking-widest text-black bg-amber-400 px-1.5 py-0.5 rounded">
                STUDIO
              </span>
            </span>
            <span className="text-xs text-neutral-400">Đọc sách & Kho nhạc AI</span>
          </div>
        </div>

        {/* Navigation Items: Trang chủ, Kho Nhạc, Kho Sách, Tìm kiếm */}
        <nav className="flex flex-col gap-1 mt-1">
          <button
            onClick={onNavigateHome}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors text-left ${
              currentView === 'home'
                ? 'text-white bg-[#282828]'
                : 'hover:text-white'
            }`}
          >
            <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-[#1ed760]' : ''}`} />
            <span>Trang chủ</span>
          </button>

          <button
            onClick={onNavigateMusic}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors text-left ${
              currentView === 'music-library'
                ? 'text-white bg-[#282828]'
                : 'hover:text-white'
            }`}
          >
            <Music className={`w-5 h-5 ${currentView === 'music-library' ? 'text-[#1ed760]' : 'text-blue-400'}`} />
            <span className="flex items-center justify-between flex-1">
              <span>Kho nhạc</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                Album
              </span>
            </span>
          </button>

          <button
            onClick={onNavigateBookLibrary}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors text-left ${
              currentView === 'book-library'
                ? 'text-white bg-[#282828]'
                : 'hover:text-white'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${currentView === 'book-library' ? 'text-[#1ed760]' : 'text-amber-400'}`} />
            <span className="flex items-center justify-between flex-1">
              <span>Kho sách</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                {books.length} sách
              </span>
            </span>
          </button>

          <button
            onClick={onNavigateSearch}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors text-left ${
              currentView === 'search'
                ? 'text-white bg-[#282828]'
                : 'hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Tìm kiếm</span>
          </button>
        </nav>
      </div>

      {/* Library Box */}
      <div className="bg-[#121212] rounded-2xl flex-1 flex flex-col overflow-hidden">
        {/* Library Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2.5 font-bold text-sm text-[#b3b3b3] hover:text-white transition-colors">
            <Disc className="w-5 h-5 text-amber-400" />
            <span>Thư viện của bạn</span>
          </div>
          <button
            onClick={onOpenAddModal}
            title="Thêm sách hoặc dán văn bản"
            className="p-1.5 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Create Book */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenAddModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm sách bằng văn bản</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-3 py-3 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filter === 'all'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('top')}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1 ${
              filter === 'top'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Top hot</span>
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1 ${
              filter === 'favorites'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            <span>Yêu thích</span>
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filter === 'custom'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Tự thêm
          </button>
        </div>

        {/* Scrollable Books List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-neutral-400">
              Không tìm thấy sách nào trong mục này. Bấm nút phía trên để thêm tác phẩm bạn thích!
            </div>
          ) : (
            filteredBooks.map((book) => {
              const isSelected = activeBookId === book.id;
              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#282828] text-white'
                      : 'hover:bg-[#1a1a1a] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {/* Thumbnail Cover */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#282828] relative shadow">
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
                        <BookOpen className="w-5 h-5 text-white/70" />
                      </div>
                    )}

                    {/* Playing indicator overlay */}
                    {isSelected && isPlaying && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-1 bg-[#1ed760] animate-pulse h-full"></span>
                          <span className="w-1 bg-[#1ed760] animate-bounce h-2/3"></span>
                          <span className="w-1 bg-[#1ed760] animate-pulse h-full"></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title & Author */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-[#1ed760]' : 'group-hover:text-white'
                      }`}
                    >
                      {book.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                      <span>{book.author}</span>
                      {book.likesCount && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5 fill-rose-500" />
                            {book.likesCount}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {isSelected && (
                    <Volume2 className="w-4 h-4 text-[#1ed760] shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
