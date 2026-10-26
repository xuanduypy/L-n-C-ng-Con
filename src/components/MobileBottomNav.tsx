import React, { useState } from 'react';
import {
  Home,
  Search,
  Music,
  BookOpen,
  Plus,
  Sliders,
  X,
  FilePlus,
  Music4,
} from 'lucide-react';
import { ViewMode } from '../types/book';

interface MobileBottomNavProps {
  currentView: ViewMode;
  onNavigateHome: () => void;
  onNavigateSearch: () => void;
  onNavigateMusic: () => void;
  onNavigateLibrary: () => void;
  onOpenAddBook: () => void;
  onOpenAddMusic: () => void;
  onOpenVoiceSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigateHome,
  onNavigateSearch,
  onNavigateMusic,
  onNavigateLibrary,
  onOpenAddBook,
  onOpenAddMusic,
  onOpenVoiceSettings,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const isHome = currentView === 'home';
  const isSearch = currentView === 'search';
  const isMusic = currentView === 'music-library';
  const isBookDetail = currentView === 'book-detail';

  return (
    <>
      {/* Mobile Quick Add Menu Overlay Sheet */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end p-4 pb-20 animate-in fade-in duration-150"
          onClick={() => setShowAddMenu(false)}
        >
          <div
            className="bg-[#181818] border border-[#2e2e2e] rounded-3xl p-5 shadow-2xl space-y-3 max-w-sm mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#282828]">
              <span className="font-bold text-sm text-neutral-300">Thêm nội dung mới</span>
              <button
                onClick={() => setShowAddMenu(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenAddBook();
              }}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#222222] hover:bg-[#2b2b2b] text-left active:scale-98 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <FilePlus className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white">Thêm Sách Nói Mới</p>
                <p className="text-xs text-neutral-400">Dán nội dung văn bản để tạo sách và giọng đọc AI</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenAddMusic();
              }}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#222222] hover:bg-[#2b2b2b] text-left active:scale-98 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Music4 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white">Thêm Bài Hát Mới</p>
                <p className="text-xs text-neutral-400">Tải tệp âm thanh, dán liên kết hoặc tạo giai điệu</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* The Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-[#262626] px-2 py-1.5 flex items-center justify-around select-none pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      >
        {/* 1. Trang chủ */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
            isHome ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'text-[#1ed760] stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium ${isHome ? 'text-white font-bold' : ''}`}>
            Trang chủ
          </span>
        </button>

        {/* 2. Tìm kiếm */}
        <button
          onClick={onNavigateSearch}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
            isSearch ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Search className={`w-5 h-5 ${isSearch ? 'text-[#1ed760] stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium ${isSearch ? 'text-white font-bold' : ''}`}>
            Tìm kiếm
          </span>
        </button>

        {/* 3. Nút Thêm Trung Tâm */}
        <button
          onClick={() => setShowAddMenu((prev) => !prev)}
          className="flex flex-col items-center justify-center px-2 py-1 -mt-3 active:scale-90 transition-transform"
          title="Thêm sách hoặc nhạc mới"
        >
          <div className="w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black shadow-lg shadow-[#1ed760]/30 flex items-center justify-center font-bold">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[9px] mt-1 font-bold text-neutral-300">Thêm mới</span>
        </button>

        {/* 4. Kho nhạc */}
        <button
          onClick={onNavigateMusic}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
            isMusic ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Music className={`w-5 h-5 ${isMusic ? 'text-[#1ed760] stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium ${isMusic ? 'text-white font-bold' : ''}`}>
            Kho nhạc
          </span>
        </button>

        {/* 5. Cài đặt Giọng đọc & Ứng dụng */}
        <button
          onClick={onOpenVoiceSettings}
          className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-neutral-400 hover:text-neutral-200 transition-all active:scale-90"
        >
          <Sliders className="w-5 h-5 hover:text-white" />
          <span className="text-[10px] mt-1 font-medium">Cài đặt</span>
        </button>
      </nav>
    </>
  );
};
