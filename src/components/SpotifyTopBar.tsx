import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sliders,
  Plus,
  Sparkles,
  X,
  BookOpen,
} from 'lucide-react';
import { VoiceSettings } from '../types/book';

interface SpotifyTopBarProps {
  currentView: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  onOpenVoiceSettings: () => void;
  onOpenAddModal?: () => void;
  voiceSettings: VoiceSettings;
  headerBgOpacity?: number;
  bookTitle?: string;
}

export const SpotifyTopBar: React.FC<SpotifyTopBarProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  onNavigateBack,
  onNavigateForward,
  onOpenVoiceSettings,
  onOpenAddModal,
  voiceSettings,
  headerBgOpacity = 0.8,
  bookTitle,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isSubView = currentView === 'book-detail' || currentView === 'music-library';

  return (
    <header
      className="sticky top-0 z-30 h-14 md:h-16 px-3 md:px-8 flex items-center justify-between gap-2 md:gap-4 transition-colors duration-200 border-b border-[#282828]/40 select-none"
      style={{
        backgroundColor: `rgba(18, 18, 18, ${Math.min(0.96, Math.max(0.7, headerBgOpacity))})`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* ================= MOBILE LAYOUT (< md) ================= */}
      <div className="flex md:hidden items-center justify-between w-full gap-2">
        {mobileSearchOpen ? (
          <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm sách, tác giả, bài hát..."
                className="w-full bg-[#242424] text-xs text-white placeholder-neutral-400 pl-9 pr-8 py-2 rounded-full border border-neutral-600 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 p-1"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                onSearchChange('');
              }}
              className="p-1.5 text-neutral-300 text-xs font-semibold"
            >
              Hủy
            </button>
          </div>
        ) : (
          <>
            {/* Left: Back button or App Logo */}
            <div className="flex items-center gap-2 min-w-0">
              {isSubView ? (
                <button
                  onClick={onNavigateBack}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#222222] text-white text-xs font-bold active:scale-90 transition-transform"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src="/apple-touch-icon.png"
                    alt="Lớn Cùng Con"
                    className="w-8 h-8 rounded-lg shadow-sm border border-amber-300/40 object-cover shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-white text-sm tracking-tight leading-none">
                      Lớn Cùng Con
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">Đọc sách & Nghe nhạc</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons for Mobile */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-full bg-[#222222] text-neutral-300 active:scale-90"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>

              {onOpenAddModal && (
                <button
                  onClick={onOpenAddModal}
                  className="p-2 rounded-full bg-[#222222] text-white active:scale-90"
                  title="Thêm sách mới"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onOpenVoiceSettings}
                className="p-2 rounded-full bg-[#222222] text-[#1ed760] active:scale-90"
                title="Cài đặt giọng đọc"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ================= DESKTOP LAYOUT (>= md) ================= */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Left: History buttons + Search input */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onNavigateBack}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-[#b3b3b3] hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Quay lại"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNavigateForward}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-[#b3b3b3] hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Đi tới"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Search input field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Bạn muốn nghe hoặc đọc sách gì?"
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#333333] text-sm text-white placeholder-neutral-400 pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-neutral-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Settings & Add Action */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all active:scale-95 shadow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm sách</span>
            </button>
          )}

          <button
            onClick={onOpenVoiceSettings}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-semibold border border-[#3e3e3e]/60 transition-all hover:scale-105 active:scale-95 shadow"
            title="Cài đặt giọng đọc, phòng thu và ứng dụng"
          >
            <Sliders className="w-4 h-4 text-[#1ed760]" />
            <span>Cài đặt giọng đọc</span>
          </button>
        </div>
      </div>
    </header>
  );
};
