import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  User,
  Cloud,
  Sparkles,
} from 'lucide-react';
import { VoiceSettings, UserAccount, ViewMode, ZODIAC_ANIMALS } from '../types/book';

interface SpotifyTopBarProps {
  currentView: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  onOpenVoiceSettings: () => void;
  onOpenAddModal?: () => void;
  onOpenUserAccount: () => void;
  user: UserAccount | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  voiceSettings: VoiceSettings;
  headerBgOpacity?: number;
  bookTitle?: string;
}

export const SpotifyTopBar: React.FC<SpotifyTopBarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onNavigateBack,
  onNavigateForward,
  onOpenVoiceSettings: _onOpenVoiceSettings,
  onOpenAddModal,
  onOpenUserAccount,
  user,
  syncStatus,
  headerBgOpacity = 0.85,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isSubView = currentView === 'book-detail';
  const currentZodiac = ZODIAC_ANIMALS.find((z) => z.id === user?.zodiacId) || ZODIAC_ANIMALS[0];

  return (
    <header
      className="sticky top-0 z-30 h-14 md:h-16 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 transition-colors duration-200 border-b border-[#242424] select-none"
      style={{
        backgroundColor: `rgba(18, 18, 18, ${Math.min(0.97, Math.max(0.75, headerBgOpacity))})`,
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
                placeholder="Tìm sách nói, nhạc AI..."
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
            {/* Left: LOGO REPLACED BY USER AVATAR & SETTINGS TRIGGER */}
            <div className="flex items-center gap-2 min-w-0">
              {isSubView ? (
                <button
                  onClick={onNavigateBack}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#222222] text-white text-xs font-bold active:scale-95 transition-transform"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
              ) : (
                <button
                  onClick={onOpenUserAccount}
                  className="flex items-center gap-2.5 p-1 pr-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-400/50 active:scale-95 transition-all group"
                  title="Tài khoản & Cài đặt DiNo"
                >
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                      user?.isAdmin
                        ? 'from-amber-400 to-yellow-500 text-black'
                        : currentZodiac.color
                    } flex items-center justify-center text-lg shadow-md shrink-0 border border-white/20`}
                  >
                    {user?.zodiacEmoji || (user?.isAdmin ? '👑' : currentZodiac.emoji)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-white text-xs tracking-tight leading-none flex items-center gap-1">
                      {user?.name ? user.name.replace(/\s*\(Admin\)/i, '') : (user?.isAdmin ? 'Xuân Duy' : 'DiNo Studio')}
                      {user?.isAdmin && (
                        <span className="text-[9px] bg-amber-400 text-black px-1 rounded font-black">
                          ADMIN
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">Cài đặt & Hồ sơ</span>
                  </div>
                </button>
              )}
            </div>

            {/* Right: Search, Create, Cloud Sync */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-full bg-[#222222] text-neutral-300 active:scale-95"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>

              {onOpenAddModal && (
                <button
                  onClick={onOpenAddModal}
                  className="p-2 rounded-full bg-amber-400 text-black font-bold active:scale-95 shadow"
                  title="Thêm nhanh"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ================= DESKTOP LAYOUT (>= md) ================= */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Left: Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onNavigateBack}
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 border border-neutral-800/80 active:scale-95"
              title="Quay lại"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateForward}
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 border border-neutral-800/80 active:scale-95"
              title="Đi tới"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="relative flex-1 max-w-md mx-4">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm sách nói, bài hát AI, tác giả..."
            className="w-full bg-[#202020] hover:bg-[#262626] focus:bg-[#2b2b2b] text-xs text-white placeholder-neutral-400 pl-10 pr-8 py-2 rounded-full border border-neutral-800 focus:border-amber-400 outline-none transition-all"
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

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 text-neutral-950 text-xs font-bold hover:bg-amber-300 transition-all active:scale-95 shadow"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Thêm mới</span>
            </button>
          )}

          {/* Sync indicator */}
          <div
            onClick={onOpenUserAccount}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs cursor-pointer hover:border-neutral-700 hover:text-white transition-colors"
            title="Đồng bộ đám mây"
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                syncStatus === 'syncing'
                  ? 'text-blue-400 animate-spin'
                  : syncStatus === 'synced'
                  ? 'text-emerald-400'
                  : 'text-neutral-500'
              }`}
            />
          </div>

          {/* User Profile & Settings Trigger (Desktop) */}
          <button
            onClick={onOpenUserAccount}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/50 transition-all text-xs font-bold text-white group cursor-pointer active:scale-95"
            title="Tài khoản & Cài đặt DiNo"
          >
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
                user?.isAdmin ? 'from-amber-400 to-yellow-500 text-black' : currentZodiac.color
              } flex items-center justify-center text-sm shadow shrink-0 border border-white/20`}
            >
              {user?.zodiacEmoji || (user?.isAdmin ? '👑' : currentZodiac.emoji)}
            </div>
            <span className="truncate max-w-[120px]">
              {user?.name ? user.name.replace(/\s*\(Admin\)/i, '') : (user?.isAdmin ? 'Xuân Duy' : 'Tài khoản')}
            </span>
            {user?.isAdmin && (
              <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black tracking-wider">
                ADMIN
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
