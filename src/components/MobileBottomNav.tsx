import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  Music,
  Plus,
  User,
  X,
  FilePlus,
  Music4,
} from 'lucide-react';
import { ViewMode, UserAccount } from '../types/book';

interface MobileBottomNavProps {
  currentView: ViewMode;
  onNavigateHome: () => void;
  onNavigateMusic: () => void;
  onNavigateBookLibrary: () => void;
  onOpenAddBook: () => void;
  onOpenAddMusic: () => void;
  onOpenUserAccount: () => void;
  user: UserAccount | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigateHome,
  onNavigateMusic,
  onNavigateBookLibrary,
  onOpenAddBook,
  onOpenAddMusic,
  onOpenUserAccount,
  user,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const isHome = currentView === 'home';
  const isBooks = currentView === 'book-library' || currentView === 'book-detail';
  const isMusic = currentView === 'music-library';

  return (
    <>
      {/* Mobile Quick Add Menu Overlay Sheet */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-4 pb-[calc(70px+env(safe-area-inset-bottom,0px))] animate-in fade-in duration-150"
          onClick={() => setShowAddMenu(false)}
        >
          <div
            className="bg-[#1e1e1e] border border-[#333] rounded-3xl p-5 shadow-2xl space-y-3 max-w-sm mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d2d]">
              <span className="font-extrabold text-sm text-white">Thêm nội dung vào DiNo</span>
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
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#282828] hover:bg-[#323232] text-left active:scale-98 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FilePlus className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white">Thêm Sách Nói Mới</p>
                <p className="text-xs text-neutral-400">Dán truyện, nhập văn bản & đọc bằng Giọng Người Dùng</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenAddMusic();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#282828] hover:bg-[#323232] text-left active:scale-98 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Music4 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white">Thêm Bài Hát Mới</p>
                <p className="text-xs text-neutral-400">Tải tệp âm thanh, dán liên kết hoặc tạo nhạc</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* The Bottom Tab Bar - Ergonomic Touch Height */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/98 backdrop-blur-xl border-t border-[#262626] px-1 pt-1.5 flex items-center justify-around select-none pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl h-[calc(58px+env(safe-area-inset-bottom,0px))]"
      >
        {/* 1. Trang chủ */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all active:scale-95 ${
            isHome ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'text-[#1ed760] stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-semibold ${isHome ? 'text-[#1ed760] font-bold' : ''}`}>
            Trang chủ
          </span>
        </button>

        {/* 2. Kho Nhạc */}
        <button
          onClick={onNavigateMusic}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all active:scale-95 ${
            isMusic ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Music className={`w-5 h-5 ${isMusic ? 'text-[#1ed760] stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-semibold ${isMusic ? 'text-[#1ed760] font-bold' : ''}`}>
            Kho nhạc
          </span>
        </button>

        {/* 3. Nút Thêm Nổi Bật Ở Giữa (FAB) */}
        <button
          onClick={() => setShowAddMenu((prev) => !prev)}
          className="flex flex-col items-center justify-center px-2 py-0 -mt-4 active:scale-95 transition-transform"
          title="Thêm sách hoặc bài hát mới"
        >
          <div className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black shadow-lg shadow-[#1ed760]/30 flex items-center justify-center font-bold">
            <Plus className="w-7 h-7 stroke-[3]" />
          </div>
          <span className="text-[9px] mt-0.5 font-bold text-neutral-300">Thêm</span>
        </button>

        {/* 4. Kho Sách */}
        <button
          onClick={onNavigateBookLibrary}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all active:scale-95 ${
            isBooks ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${isBooks ? 'text-[#1ed760] stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-semibold ${isBooks ? 'text-[#1ed760] font-bold' : ''}`}>
            Kho sách
          </span>
        </button>

        {/* 5. Icon Tài Khoản & Cài Đặt */}
        <button
          onClick={onOpenUserAccount}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl text-neutral-400 hover:text-neutral-200 transition-all active:scale-95"
          title="Tài khoản & Cài đặt ứng dụng"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-[#1ed760] text-black font-extrabold text-[10px] flex items-center justify-center">
            {user?.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="text-[10px] mt-1 font-semibold">Cài đặt</span>
        </button>
      </nav>
    </>
  );
};
