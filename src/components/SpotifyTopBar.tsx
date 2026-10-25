import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sliders,
  Plus,
  Sparkles,
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
  headerBgOpacity?: number; // Dynamic Spotify scroll opacity
}

export const SpotifyTopBar: React.FC<SpotifyTopBarProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  onNavigateBack,
  onNavigateForward,
  onOpenVoiceSettings,
  voiceSettings,
  headerBgOpacity = 0.8,
}) => {
  return (
    <header
      className="sticky top-0 z-30 h-16 px-4 md:px-8 flex items-center justify-between gap-4 transition-colors duration-200 border-b border-[#282828]/40"
      style={{
        backgroundColor: `rgba(18, 18, 18, ${Math.min(0.96, Math.max(0.6, headerBgOpacity))})`,
        backdropFilter: 'blur(16px)',
      }}
    >
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

      {/* Right: Settings Action */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          onClick={onOpenVoiceSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-semibold border border-[#3e3e3e]/60 transition-all hover:scale-105 active:scale-95 shadow"
          title="Cài đặt giọng đọc, phòng thu và ứng dụng"
        >
          <Sliders className="w-4 h-4 text-[#1ed760]" />
          <span>Cài đặt</span>
        </button>
      </div>
    </header>
  );
};
