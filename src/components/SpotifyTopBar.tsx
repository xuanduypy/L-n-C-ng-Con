import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  User,
  Cloud,
  Check,
  RefreshCw,
} from 'lucide-react';
import { VoiceSettings, UserAccount } from '../types/book';

interface SpotifyTopBarProps {
  currentView: string;
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
  searchQuery,
  onSearchChange,
  onNavigateBack,
  onNavigateForward,
  onOpenVoiceSettings,
  onOpenAddModal,
  onOpenUserAccount,
  user,
  syncStatus,
  voiceSettings: _voiceSettings,
  headerBgOpacity = 0.8,
  bookTitle: _bookTitle,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isSubView = currentView === 'book-detail' || currentView === 'music-library' || currentView === 'book-library';

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
            {/* Left: Back button or App Logo DiNo */}
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
                <div className="flex items-center gap-2.5">
                  <img
                    src="/icon.svg"
                    alt="DiNo"
                    className="w-8 h-8 rounded-xl shadow-md border border-amber-300/40 object-cover shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-white text-sm tracking-tight leading-none flex items-center gap-1">
                      DiNo
                      <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black tracking-wider">
                        AUDIO
                      </span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">Sách & Kho nhạc</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons for Mobile: Search, Add, and User Profile with Settings */}
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
                  title="Thêm sách hoặc bài hát"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* User Profile Avatar with Settings */}
              <button
                onClick={onOpenUserAccount}
                className="flex items-center gap-1.5 p-1 rounded-full bg-[#222222] border border-[#3e3e3e]/60 active:scale-90 transition-transform relative"
                title="Tài khoản & Cài đặt ứng dụng"
              >
                <div className={`w-7 h-7 rounded-full ${user?.isAdmin ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-black' : 'bg-gradient-to-tr from-amber-400 to-[#1ed760] text-black'} font-extrabold text-[11px] flex items-center justify-center`}>
                  {user?.isAdmin ? '👑' : (user?.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-3.5 h-3.5" />)}
                </div>
                {/* Sync status indicator badge */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                    syncStatus === 'syncing'
                      ? 'bg-blue-400 animate-spin'
                      : syncStatus === 'synced'
                      ? 'bg-[#1ed760]'
                      : 'bg-neutral-500'
                  }`}
                />
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
              placeholder="Bạn muốn nghe album nhạc hay đọc sách gì trên DiNo?"
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

        {/* Right: Add Action & User Account Menu Button */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all active:scale-95 shadow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm mới</span>
            </button>
          )}

          {/* User Icon with Settings and Account popup trigger */}
          <button
            onClick={onOpenUserAccount}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${user?.isAdmin ? 'bg-[#282417] border-amber-500/40 text-amber-200' : 'bg-[#242424] border-[#3e3e3e]/60 text-white'} hover:bg-[#2e2e2e] text-xs font-semibold border transition-all hover:scale-105 active:scale-95 shadow`}
            title="Nhấn để mở Cài đặt, Hiệu chỉnh ứng dụng & Đồng bộ đám mây"
          >
            <div className={`w-6 h-6 rounded-full ${user?.isAdmin ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-black' : 'bg-gradient-to-tr from-amber-400 to-[#1ed760] text-black'} font-extrabold text-[11px] flex items-center justify-center shrink-0`}>
              {user?.isAdmin ? '👑' : (user?.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-3.5 h-3.5" />)}
            </div>
            <span className="font-bold max-w-[130px] truncate flex items-center gap-1">
              <span>{user?.name || 'Tài khoản'}</span>
              {user?.isAdmin && <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-black">ADMIN</span>}
            </span>
            <div className="flex items-center gap-1 pl-1 border-l border-[#3a3a3a] text-neutral-400">
              <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'text-blue-400 animate-spin' : syncStatus === 'synced' ? 'text-[#1ed760]' : ''}`} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
