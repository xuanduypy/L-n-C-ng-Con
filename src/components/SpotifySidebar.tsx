import React, { useState } from 'react';
import {
  Mic,
  Music2,
  Headphones,
  BookOpen,
  Music,
  Plus,
  Heart,
  Volume2,
  Disc,
  Flame,
  LayoutGrid,
} from 'lucide-react';
import { Book, ViewMode, UserAccount, ZODIAC_ANIMALS } from '../types/book';

interface SpotifySidebarProps {
  books: Book[];
  activeBookId: string | null;
  isPlaying: boolean;
  currentView: ViewMode;
  onNavigateAll: () => void;
  onNavigateAudiobook: () => void;
  onNavigateAIMusic: () => void;
  onNavigateVoiceTraining: () => void;
  onNavigateMusic: () => void;
  onNavigateBookLibrary: () => void;
  onSelectBook: (book: Book) => void;
  onOpenAddModal: () => void;
  user?: UserAccount | null;
  onOpenUserAccount?: () => void;
}

export const SpotifySidebar: React.FC<SpotifySidebarProps> = ({
  books,
  activeBookId,
  isPlaying,
  currentView,
  onNavigateAll,
  onNavigateAudiobook,
  onNavigateAIMusic,
  onNavigateVoiceTraining,
  onNavigateMusic,
  onNavigateBookLibrary,
  onSelectBook,
  onOpenAddModal,
  user,
  onOpenUserAccount,
}) => {
  const currentZodiac = ZODIAC_ANIMALS.find((z) => z.id === user?.zodiacId) || ZODIAC_ANIMALS[0];
  const [filter, setFilter] = useState<'all' | 'favorites' | 'custom' | 'top'>('all');

  const filteredBooks = books.filter((b) => {
    if (filter === 'favorites') return b.isFavorite;
    if (filter === 'custom') return b.id.startsWith('custom-');
    if (filter === 'top') return (b.likesCount || 0) > 800 || (b.readCount || 0) > 3000;
    return true;
  });

  return (
    <aside className="hidden md:flex w-64 md:w-72 bg-black flex-col h-full select-none border-r border-[#1f1f1f] text-[#b3b3b3] p-2 gap-2 shrink-0">
      {/* Studio Nav Section */}
      <div className="bg-[#121212] rounded-2xl p-3 flex flex-col gap-2">
        {/* User Login Avatar Button (Thay thế chữ XƯỞNG SÁNG TẠO AI) */}
        <button
          onClick={onOpenUserAccount}
          className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800/90 hover:border-amber-400/60 active:scale-[0.98] transition-all text-left group shadow-sm w-full"
          title="Tài khoản & Cài đặt"
        >
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
              user?.isAdmin
                ? 'from-amber-400 to-yellow-500 text-black'
                : currentZodiac.color
            } flex items-center justify-center text-xl shadow border border-white/20 shrink-0 group-hover:scale-105 transition-transform`}
          >
            {user?.zodiacEmoji || (user?.isAdmin ? '👑' : currentZodiac.emoji)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs tracking-tight truncate">
                {user?.name ? user.name.replace(/\s*\(Admin\)/i, '') : (user?.isAdmin ? 'Xuân Duy' : 'DiNo Studio')}
              </span>
              {user?.isAdmin ? (
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black tracking-wider shrink-0">
                  👑 ADMIN
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-bold shrink-0">
                  {currentZodiac.emoji} {currentZodiac.name}
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400 block truncate">
              {user?.isLoggedIn ? 'Tài khoản & Cài đặt' : 'Đăng nhập / Hồ sơ'}
            </span>
          </div>
        </button>

        {/* KHO LƯU TRỮ (Xếp lên trên Tạo Sách Audio) */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-2 block mb-1">
            KHO LƯU TRỮ
          </span>
          <nav className="flex flex-col gap-0.5">
            <button
              onClick={onNavigateAll}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all text-left ${
                currentView === 'all'
                  ? 'text-neutral-950 bg-emerald-400 shadow-md'
                  : 'hover:text-white text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${currentView === 'all' ? 'text-black' : 'text-emerald-400'}`} />
              <span className="flex-1">Tất cả kho</span>
            </button>

            <button
              onClick={onNavigateBookLibrary}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-colors text-left ${
                currentView === 'book-library'
                  ? 'text-neutral-950 bg-amber-400 font-bold shadow-md'
                  : 'hover:text-white text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${currentView === 'book-library' ? 'text-black' : 'text-amber-400'}`} />
              <span className="flex-1">Kho sách</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                currentView === 'book-library' ? 'bg-black text-amber-300' : 'text-neutral-400'
              }`}>{books.length}</span>
            </button>

            <button
              onClick={onNavigateMusic}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-colors text-left ${
                currentView === 'music-library'
                  ? 'text-neutral-950 bg-blue-400 font-bold shadow-md'
                  : 'hover:text-white text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <Music className={`w-4 h-4 ${currentView === 'music-library' ? 'text-black' : 'text-blue-400'}`} />
              <span>Kho nhạc</span>
            </button>
          </nav>
        </div>

        {/* XƯỞNG SÁNG TẠO AI (Xếp dưới Kho lưu trữ) */}
        <div className="pt-2 border-t border-[#1f1f1f]">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-2 block mb-1">
            XƯỞNG SÁNG TẠO AI
          </span>
          <nav className="flex flex-col gap-1">
            <button
              onClick={onNavigateAudiobook}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all text-left ${
                currentView === 'audiobook-studio'
                  ? 'text-neutral-950 bg-amber-400 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Mic className={`w-4 h-4 ${currentView === 'audiobook-studio' ? 'text-black' : 'text-amber-400'}`} />
              <span className="flex-1">Tạo Sách Audio</span>
            </button>

            <button
              onClick={onNavigateAIMusic}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all text-left ${
                currentView === 'aimusic-studio'
                  ? 'text-neutral-950 bg-blue-400 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Music2 className={`w-4 h-4 ${currentView === 'aimusic-studio' ? 'text-black' : 'text-blue-400'}`} />
              <span className="flex-1">Tạo Nhạc AI</span>
            </button>

            <button
              onClick={onNavigateVoiceTraining}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all text-left ${
                currentView === 'voice-training'
                  ? 'text-neutral-950 bg-purple-400 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Headphones className={`w-4 h-4 ${currentView === 'voice-training' ? 'text-black' : 'text-purple-400'}`} />
              <span className="flex-1">Huấn Luyện Giọng</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Library Box with Quick Sách items */}
      <div className="bg-[#121212] rounded-2xl flex-1 flex flex-col overflow-hidden">
        {/* Library Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2 font-bold text-xs text-neutral-300">
            <Disc className="w-4 h-4 text-amber-400" />
            <span>Sách Đã Tạo & Nghe Gần Đây</span>
          </div>
          <button
            onClick={onOpenAddModal}
            title="Thêm sách nhanh"
            className="p-1 rounded-full hover:bg-[#282828] text-neutral-400 hover:text-white transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 px-2.5 py-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-full transition-colors shrink-0 ${
              filter === 'all'
                ? 'bg-neutral-200 text-black font-bold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('top')}
            className={`px-2.5 py-1 rounded-full transition-colors shrink-0 flex items-center gap-1 ${
              filter === 'top'
                ? 'bg-neutral-200 text-black font-bold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" /> Top
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-2.5 py-1 rounded-full transition-colors shrink-0 flex items-center gap-1 ${
              filter === 'favorites'
                ? 'bg-neutral-200 text-black font-bold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> Thích
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={`px-2.5 py-1 rounded-full transition-colors shrink-0 ${
              filter === 'custom'
                ? 'bg-neutral-200 text-black font-bold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Tự tạo
          </button>
        </div>

        {/* Scrollable Books List */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {filteredBooks.map((book) => {
            const isSelected = activeBookId === book.id;
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className={`group flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#242424] text-white'
                    : 'hover:bg-[#1a1a1a] text-neutral-400 hover:text-white'
                }`}
              >
                {/* Thumbnail Cover */}
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-800 relative shadow">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${book.coverGradient} flex items-center justify-center text-xs`}
                    >
                      📖
                    </div>
                  )}

                  {isSelected && isPlaying && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-2.5">
                        <span className="w-0.5 bg-amber-400 animate-pulse h-full"></span>
                        <span className="w-0.5 bg-amber-400 animate-bounce h-2/3"></span>
                        <span className="w-0.5 bg-amber-400 animate-pulse h-full"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Title & Author */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-amber-400' : 'group-hover:text-white'
                    }`}
                  >
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {book.author}
                  </p>
                </div>

                {isSelected && (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
