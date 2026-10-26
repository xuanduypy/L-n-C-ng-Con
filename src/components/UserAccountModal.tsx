import React, { useState } from 'react';
import {
  X,
  User,
  Cloud,
  Check,
  RefreshCw,
  Sliders,
  Moon,
  Smartphone,
  Download,
  Upload,
  LogOut,
  Mail,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Heart,
  Music,
  BookOpen,
} from 'lucide-react';
import { UserAccount, VoiceSettings } from '../types/book';
import { SleepTimerOption } from '../hooks/useSleepTimer';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: number;
  onManualSync: () => void;
  onLogin: (email: string, name?: string) => Promise<boolean>;
  onLogout: () => void;
  onOpenVoiceSettings: () => void;
  // Stats
  totalBooksCount: number;
  totalTracksCount: number;
  totalCustomCount: number;
  // Sleep timer
  sleepTimerOption: SleepTimerOption;
  sleepTimerFormatted: string | null;
  onSetSleepTimer: (option: SleepTimerOption) => void;
  // Voice settings
  voiceSettings: VoiceSettings;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  syncStatus,
  lastSyncedAt,
  onManualSync,
  onLogin,
  onLogout,
  onOpenVoiceSettings,
  totalBooksCount,
  totalTracksCount,
  totalCustomCount,
  sleepTimerOption,
  sleepTimerFormatted,
  onSetSleepTimer,
  voiceSettings,
}) => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [inputEmail, setInputEmail] = useState(user?.email || '');
  const [inputName, setInputName] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'pwabuilder'>('profile');

  if (!isOpen) return null;

  const handleSaveLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) return;

    setIsSubmitting(true);
    await onLogin(inputEmail, inputName);
    setIsSubmitting(false);
    setIsEditingEmail(false);
  };

  const formattedSyncTime = new Date(lastSyncedAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div
        className="bg-[#181818] border border-[#2e2e2e] rounded-3xl w-full max-w-lg flex flex-col text-white shadow-2xl overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#282828] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-[#1ed760] text-black font-extrabold flex items-center justify-center shadow-lg text-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{user?.name || 'Tài Khoản Người Dùng'}</span>
                <span className="text-[10px] bg-[#1ed760]/20 text-[#1ed760] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  DiNo Cloud
                </span>
              </h3>
              <p className="text-xs text-neutral-400">{user?.email || 'Chưa đăng nhập email'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm overflow-y-auto">
          {/* 1. Cloud Sync Banner (Web <-> Phone) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 via-[#1e1e1e] to-[#222222] border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Đồng Bộ Đám Mây Đa Thiết Bị</h4>
                  <p className="text-[11px] text-neutral-400">
                    Tự động đồng bộ sách, nhạc và bài hát tự thêm giữa máy tính và điện thoại.
                  </p>
                </div>
              </div>

              <button
                onClick={onManualSync}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{syncStatus === 'syncing' ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-900/20 text-[11px]">
              <span className="text-neutral-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1ed760] inline-block animate-pulse" />
                Trạng thái: {syncStatus === 'synced' ? 'Đã đồng bộ mới nhất' : 'Sẵn sàng kết nối'}
              </span>
              <span className="text-neutral-500">Cập nhật lúc: {formattedSyncTime}</span>
            </div>
          </div>

          {/* 2. Email Login Form / Switch Account */}
          <div className="p-4 rounded-2xl bg-[#222222] border border-[#333333] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                Email Đồng Bộ Của Bạn
              </span>
              {!isEditingEmail ? (
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-xs text-[#1ed760] hover:underline font-semibold"
                >
                  Đổi email / Đăng nhập lại
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingEmail(false)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Hủy
                </button>
              )}
            </div>

            {isEditingEmail ? (
              <form onSubmit={handleSaveLogin} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Địa chỉ Email:</label>
                  <input
                    type="email"
                    required
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="ví dụ: xuanduy.cn@gmail.com"
                    className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-[#1ed760] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Tên hiển thị:</label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Tên của bạn hoặc bé"
                    className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-[#1ed760] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu & Đồng bộ thư viện'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a1a] border border-[#2c2c2c]">
                <div className="flex items-center gap-2.5 truncate">
                  <Mail className="w-4 h-4 text-[#1ed760] shrink-0" />
                  <span className="font-semibold text-xs text-white truncate">
                    {user?.email || 'Chưa liên kết email'}
                  </span>
                </div>
                <span className="text-[10px] text-[#1ed760] font-bold bg-[#1ed760]/10 px-2 py-0.5 rounded-full shrink-0">
                  Đã kết nối
                </span>
              </div>
            )}
          </div>

          {/* 3. Library Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-[#222222] border border-[#333333]">
              <p className="text-lg font-black text-[#1ed760]">{totalBooksCount}</p>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Sách nói</p>
            </div>
            <div className="p-3 rounded-xl bg-[#222222] border border-[#333333]">
              <p className="text-lg font-black text-blue-400">{totalTracksCount}</p>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Bài hát</p>
            </div>
            <div className="p-3 rounded-xl bg-[#222222] border border-[#333333]">
              <p className="text-lg font-black text-amber-400">{totalCustomCount}</p>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Đã tải lên</p>
            </div>
          </div>

          {/* 4. App Settings & Customizations (Các Hiệu Chỉnh Ứng Dụng) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
              Hiệu Chỉnh & Tiện Ích Ứng Dụng
            </h4>

            <div className="divide-y divide-[#2a2a2a] bg-[#222222] rounded-2xl border border-[#333333] overflow-hidden">
              {/* Option A: Voice Studio */}
              <button
                onClick={() => {
                  onClose();
                  onOpenVoiceSettings();
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Phòng Thu Giọng Người Dùng & Đọc Sách</p>
                    <p className="text-[11px] text-neutral-400">
                      Chế độ hiện tại: {voiceSettings.engine === 'user_voice' ? 'Giọng Người Dùng' : voiceSettings.engine === 'gemini' ? 'AI Studio' : 'Trình duyệt'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              {/* Option B: Sleep Timer Quick Selector */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">Hẹn Giờ Tắt Nhạc Khi Ngủ</p>
                      <p className="text-[11px] text-neutral-400">
                        {sleepTimerFormatted
                          ? `Đang đếm ngược: còn ${sleepTimerFormatted}`
                          : 'Tự động dừng khi bé ngủ ngon'}
                      </p>
                    </div>
                  </div>

                  {sleepTimerFormatted && (
                    <button
                      onClick={() => onSetSleepTimer(null)}
                      className="text-xs text-rose-400 hover:underline font-semibold"
                    >
                      Hủy hẹn giờ
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                  {([15, 30, 45, 60] as const).map((mins) => (
                    <button
                      key={mins}
                      onClick={() => onSetSleepTimer(mins)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                        sleepTimerOption === mins
                          ? 'bg-[#1ed760] text-black font-bold'
                          : 'bg-[#1c1c1c] text-neutral-300 hover:bg-[#282828]'
                      }`}
                    >
                      {mins} phút
                    </button>
                  ))}
                </div>
              </div>

              {/* Option C: PWABuilder & Lock Screen Audio Guide */}
              <button
                onClick={() => setActiveTab(activeTab === 'pwabuilder' ? 'profile' : 'pwabuilder')}
                className="w-full flex items-center justify-between p-3.5 hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Cài Đặt APK Trên Điện Thoại (PWABuilder)</p>
                    <p className="text-[11px] text-neutral-400">
                      Chơi nhạc ở màn hình chờ, logo DiNo chữ D trên nền vàng
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform ${activeTab === 'pwabuilder' ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* PWABuilder Guide Details Drawer */}
          {activeTab === 'pwabuilder' && (
            <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
              <h5 className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                Hướng dẫn đóng gói APK trên PWABuilder
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-300 leading-relaxed">
                <li>Truy cập <strong className="text-white">pwabuilder.com</strong> trên trình duyệt máy tính hoặc điện thoại.</li>
                <li>Dán đường link ứng dụng Vercel hoặc AI Studio của bạn vào thanh tìm kiếm.</li>
                <li>Hệ thống đã có sẵn manifest chuẩn: Tên <strong className="text-[#1ed760]">DiNo</strong>, logo chữ D Flutter nền vàng, theme `#FEF08A`.</li>
                <li>Bấm <strong className="text-white">"Package for Stores"</strong> &rarr; chọn <strong className="text-white">Android</strong> để tải file APK hoặc AAB về cài đặt.</li>
                <li>Ứng dụng hỗ trợ <strong className="text-[#1ed760]">Media Session API</strong> giúp bạn phát nhạc và sách nói liên tục ngay cả khi khóa màn hình điện thoại!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#282828] bg-[#1f1f1f] flex justify-between items-center">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
