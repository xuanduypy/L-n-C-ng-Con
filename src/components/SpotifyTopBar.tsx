import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
} from 'lucide-react';
import { VoiceSettings, UserAccount, ViewMode } from '../types/book';

interface SpotifyTopBarProps {
  currentView: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  onOpenVoiceSettings?: () => void;
  onOpenAddModal?: () => void;
  onOpenUserAccount?: () => void;
  user?: UserAccount | null;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  voiceSettings?: VoiceSettings;
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
  onOpenAddModal,
  headerBgOpacity = 0.85,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isSubView = currentView === 'book-detail';

  const navTabs: { id: ViewMode; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'book-library', label: 'Kho sách' },
    { id: 'music-library', label: 'Kho nhạc' },
  ];

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
            {/* Left: SubView Back button OR Library Tabs on Mobile Top Bar */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto no-scrollbar">
              {isSubView ? (
                <button
                  onClick={onNavigateBack}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#222222] text-white text-xs font-bold active:scale-95 transition-transform shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  {navTabs.map((tab) => {
                    const isActive = currentView === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onViewChange?.(tab.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                          isActive
                            ? 'bg-amber-400 text-black shadow-sm font-extrabold'
                            : 'bg-[#222222] text-neutral-300 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Search */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-full bg-[#222222] text-neutral-300 active:scale-95"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ================= DESKTOP LAYOUT (>= md) ================= */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Left: Library Tabs (Tất cả, Kho sách, Kho nhạc) */}
        <div className="flex items-center shrink-0">
          {/* Library Tabs on TopBar: Tất cả, Kho sách, Kho nhạc */}
          <div className="flex items-center gap-1 p-1 bg-[#181818] rounded-full border border-neutral-800/80">
            {navTabs.map((tab) => {
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onViewChange?.(tab.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-black shadow-sm font-extrabold'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
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

        {/* Right slot spacer for visual balance */}
        <div className="w-8 shrink-0" />
      </div>
    </header>
  );
};
