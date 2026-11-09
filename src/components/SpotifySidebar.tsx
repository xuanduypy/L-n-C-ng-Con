import React from 'react';
import {
  Mic,
  Music2,
  Headphones,
  BookOpen,
  Music,
  LayoutGrid,
  User,
} from 'lucide-react';
import { Book, ViewMode, UserAccount, ZODIAC_ANIMALS } from '../types/book';

interface SpotifySidebarProps {
  books?: Book[];
  activeBookId?: string | null;
  isPlaying?: boolean;
  currentView: ViewMode;
  onNavigateAll: () => void;
  onNavigateAudiobook: () => void;
  onNavigateAIMusic: () => void;
  onNavigateVoiceTraining: () => void;
  onNavigateMusic: () => void;
  onNavigateBookLibrary: () => void;
  onSelectBook?: (book: Book) => void;
  onOpenAddModal?: () => void;
  user?: UserAccount | null;
  onOpenUserAccount?: () => void;
}

export const SpotifySidebar: React.FC<SpotifySidebarProps> = ({
  books = [],
  currentView,
  onNavigateAll,
  onNavigateAudiobook,
  onNavigateAIMusic,
  onNavigateVoiceTraining,
  onNavigateMusic,
  onNavigateBookLibrary,
  user,
  onOpenUserAccount,
}) => {
  const currentZodiac = ZODIAC_ANIMALS.find((z) => z.id === user?.zodiacId) || ZODIAC_ANIMALS[0];

  return (
    <aside className="hidden md:flex w-64 md:w-72 bg-black flex-col h-full select-none border-r border-[#1f1f1f] text-[#b3b3b3] p-2 gap-2 shrink-0">
      {/* 1. Ảnh đại diện người dùng & Menu Cài đặt / Đăng nhập */}
      <button
        onClick={onOpenUserAccount}
        className="bg-[#121212] hover:bg-[#1a1a1a] p-3 rounded-2xl flex items-center gap-3 transition-colors border border-neutral-800/80 text-left group shadow-md cursor-pointer"
        title={user?.isLoggedIn ? 'Hồ sơ & Cài đặt DiNo' : 'Đăng nhập tài khoản'}
      >
        {user?.isLoggedIn ? (
          <>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                user.isAdmin ? 'from-amber-400 to-yellow-500 text-black' : currentZodiac.color
              } flex items-center justify-center text-xl shadow-md shrink-0 border border-white/20 group-hover:scale-105 transition-transform`}
            >
              {user.zodiacEmoji || (user.isAdmin ? '👑' : currentZodiac.emoji)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-xs truncate group-hover:text-amber-400 transition-colors">
                  {user.name ? user.name.replace(/\s*\(Admin\)/i, '') : (user.isAdmin ? 'Xuân Duy' : 'Thành viên')}
                </span>
                {user.isAdmin && (
                  <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium">
                {user.isAdmin ? 'Quản trị viên' : user.username ? `@${user.username}` : user.email || 'Cài đặt & Hồ sơ'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-[#202020] border border-neutral-700/80 flex items-center justify-center text-amber-400 shadow-md shrink-0 group-hover:scale-105 group-hover:border-amber-400 transition-all">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-amber-400 text-xs tracking-wide">
                  Đăng nhập
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium">
                Nhấn để đăng nhập / đăng ký
              </span>
            </div>
          </>
        )}
      </button>

      {/* Top Nav Section */}
      <div className="bg-[#121212] rounded-2xl p-3 flex flex-col gap-3">
        {/* KHO LƯU TRỮ */}
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
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  currentView === 'book-library' ? 'bg-black text-amber-300' : 'text-neutral-400'
                }`}
              >
                {books.length}
              </span>
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

        {/* XƯỞNG SÁNG TẠO AI */}
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
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                  currentView === 'audiobook-studio'
                    ? 'bg-black text-amber-300'
                    : 'bg-amber-400/20 text-amber-300'
                }`}
              >
                AI
              </span>
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
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                  currentView === 'aimusic-studio' ? 'bg-black text-blue-300' : 'bg-blue-400/20 text-blue-300'
                }`}
              >
                WAV
              </span>
            </button>

            <button
              onClick={onNavigateVoiceTraining}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                currentView === 'voice-training'
                  ? 'text-neutral-950 bg-purple-400 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Headphones
                className={`w-4 h-4 ${currentView === 'voice-training' ? 'text-black' : 'text-purple-400'}`}
              />
              <span className="flex-1">Phòng Thu</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                  currentView === 'voice-training' ? 'bg-black text-purple-300' : 'bg-purple-400/20 text-purple-300'
                }`}
              >
                LIVE
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Spacer pushing footer logo to bottom */}
      <div className="flex-1" />

      {/* Logo Ứng Dụng đặt dưới cùng chân trang của sidebar */}
      <div
        onClick={onNavigateAll}
        className="bg-[#121212] hover:bg-[#181818] rounded-2xl p-3 border border-neutral-800/80 transition-all cursor-pointer group shadow-lg flex items-center gap-3 select-none"
        title="DiNo - Đọc Sách & Nghe Nhạc AI (Nhấn để về trang chủ)"
      >
        <img
          src="/icon.svg"
          alt="DiNo Logo"
          className="w-10 h-10 rounded-xl shadow-md border border-amber-300/40 object-cover shrink-0 group-hover:scale-105 transition-transform"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-white text-sm tracking-tight group-hover:text-amber-400 transition-colors">
              DiNo
            </span>
            <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
              STUDIO
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium">
            Sách Nói & Nhạc AI
          </span>
        </div>
      </div>
    </aside>
  );
};
