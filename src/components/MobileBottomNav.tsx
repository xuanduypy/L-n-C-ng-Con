import React from 'react';
import {
  Mic,
  Music2,
  Headphones,
  FolderOpen,
} from 'lucide-react';
import { ViewMode } from '../types/book';

interface MobileBottomNavProps {
  currentView: ViewMode;
  onNavigateAudiobook: () => void;
  onNavigateAIMusic: () => void;
  onNavigateVoiceTraining: () => void;
  onNavigateLibrary: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigateAudiobook,
  onNavigateAIMusic,
  onNavigateVoiceTraining,
  onNavigateLibrary,
}) => {
  const isAudiobook = currentView === 'audiobook-studio';
  const isMusic = currentView === 'aimusic-studio';
  const isVoice = currentView === 'voice-training';
  const isLibrary = currentView === 'all' || currentView === 'book-library' || currentView === 'music-library' || currentView === 'book-detail';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/98 backdrop-blur-xl border-t border-[#262626] px-2 pt-1.5 flex items-center justify-around select-none pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl h-[calc(56px+env(safe-area-inset-bottom,0px))]"
    >
      {/* 1. Tạo Sách Audio */}
      <button
        onClick={onNavigateAudiobook}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all active:scale-95 ${
          isAudiobook ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Mic className={`w-5 h-5 ${isAudiobook ? 'text-amber-400 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-1 font-semibold">Tạo Sách</span>
      </button>

      {/* 2. Tạo Nhạc AI */}
      <button
        onClick={onNavigateAIMusic}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all active:scale-95 ${
          isMusic ? 'text-blue-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Music2 className={`w-5 h-5 ${isMusic ? 'text-blue-400 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-1 font-semibold">Tạo Nhạc AI</span>
      </button>

      {/* 3. Luyện Giọng */}
      <button
        onClick={onNavigateVoiceTraining}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all active:scale-95 ${
          isVoice ? 'text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Headphones className={`w-5 h-5 ${isVoice ? 'text-purple-400 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-1 font-semibold">Luyện Giọng</span>
      </button>

      {/* 4. Kho Lưu Trữ */}
      <button
        onClick={onNavigateLibrary}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all active:scale-95 ${
          isLibrary ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <FolderOpen className={`w-5 h-5 ${isLibrary ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-1 font-semibold">Kho Lưu</span>
      </button>
    </nav>
  );
};
