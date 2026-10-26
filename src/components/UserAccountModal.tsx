import React, { useState, useEffect } from 'react';
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
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
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

  // Digital Asset Links State for removing APK URL bar
  const [pkgName, setPkgName] = useState('com.dino.app');
  const [shaFingerprint, setShaFingerprint] = useState(
    '14:6D:E9:DE:3C:94:0A:14:D0:68:55:04:1E:73:96:AC:76:A4:7B:6A:E7:E2:B0:92:B5:14:CE:BA:7D:6F:E1:90'
  );
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [saveAssetMsg, setSaveAssetMsg] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load existing assetlinks from server
  useEffect(() => {
    if (isOpen) {
      fetch('/api/assetlinks')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.items && data.items.length > 0) {
            const first = data.items[0];
            if (first.target?.package_name) setPkgName(first.target.package_name);
            if (first.target?.sha256_cert_fingerprints?.[0]) {
              setShaFingerprint(first.target.sha256_cert_fingerprints[0]);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleTestAssetLinks = async () => {
    setTestStatus('checking');
    try {
      const res = await fetch('/.well-known/assetlinks.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTestStatus('success');
        setTestResult(
          `Đã kết nối thành công! Đang phục vụ ${data.length} gói Android (gồm ${data
            .map((d: any) => d.target?.package_name)
            .filter(Boolean)
            .join(', ')}). Android sẽ tự động xác thực và ẩn thanh URL.`
        );
      } else {
        throw new Error('Dữ liệu assetlinks không đúng định dạng');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestResult(`Không thể xác thực: ${e.message}`);
    }
  };

  const handleSaveAssetLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shaFingerprint) return;
    setIsSavingAsset(true);
    setSaveAssetMsg(null);
    try {
      const res = await fetch('/api/assetlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: pkgName.trim() || 'com.dino.app',
          sha256Fingerprint: shaFingerprint.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveAssetMsg('✓ Đã cập nhật Digital Asset Links thành công! Mở lại APK trên điện thoại để hoàn tất.');
        handleTestAssetLinks();
      } else {
        setSaveAssetMsg(`Lỗi: ${data.error || 'Không thể lưu'}`);
      }
    } catch (e: any) {
      setSaveAssetMsg(`Lỗi kết nối: ${e.message}`);
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleDownloadAssetJson = () => {
    const jsonStr = JSON.stringify(
      [
        {
          relation: ['delegate_permission/common.handle_all_urls'],
          target: {
            namespace: 'android_app',
            package_name: pkgName.trim() || 'com.dino.app',
            sha256_cert_fingerprints: [shaFingerprint.trim()],
          },
        },
      ],
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assetlinks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <div className={`w-11 h-11 rounded-full ${user?.isAdmin ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-black' : 'bg-gradient-to-tr from-blue-500 to-emerald-400 text-white'} font-extrabold flex items-center justify-center shadow-lg text-sm shrink-0`}>
              {user?.isAdmin ? '👑' : (user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />)}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{user?.name || (user?.isAdmin ? 'Xuân Duy' : 'Tài Khoản')}</span>
                {user?.isAdmin ? (
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    👑 Admin Cao Nhất
                  </span>
                ) : (
                  <span className="text-[10px] bg-neutral-700 text-neutral-300 font-bold px-2 py-0.5 rounded-full uppercase">
                    Thành Viên
                  </span>
                )}
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

          {/* Role & Permissions Details */}
          <div className={`p-4 rounded-2xl border ${user?.isAdmin ? 'bg-amber-950/20 border-amber-600/30' : 'bg-[#222222] border-[#333333]'} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs flex items-center gap-1.5 text-white">
                <ShieldCheck className={`w-4 h-4 ${user?.isAdmin ? 'text-amber-400' : 'text-blue-400'}`} />
                <span>Quyền Hạn Tài Khoản:</span>
                {user?.isAdmin ? (
                  <span className="text-amber-400 font-black">Admin Cao Nhất 👑</span>
                ) : (
                  <span className="text-neutral-300 font-bold">Thành Viên DiNo</span>
                )}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {user?.isAdmin ? 'Toàn quyền quản trị' : 'Chỉ xem & thêm'}
              </span>
            </div>

            {user?.isAdmin ? (
              <div className="text-[11px] text-neutral-300 space-y-1.5 leading-relaxed bg-black/25 p-3 rounded-xl border border-amber-500/10">
                <p className="text-amber-300 font-semibold flex items-center gap-1">
                  ✓ Quyền xóa sách & chương: Kể cả sách mặc định và sách tự thêm.
                </p>
                <p className="text-amber-300 font-semibold flex items-center gap-1">
                  ✓ Quyền xóa bài hát: Kể cả bài hát mặc định và bài hát tự thêm.
                </p>
                <p className="text-neutral-400 text-[10px]">
                  * Các lệnh xóa của bạn sẽ được đồng bộ và cập nhật vĩnh viễn trên toàn bộ hệ thống & thiết bị khác.
                </p>
              </div>
            ) : (
              <div className="text-[11px] text-neutral-300 space-y-1.5 leading-relaxed bg-black/25 p-3 rounded-xl border border-white/5">
                <p className="text-emerald-400 font-medium">
                  ✓ Quyền nghe sách, nghe nhạc không giới hạn.
                </p>
                <p className="text-emerald-400 font-medium">
                  ✓ Thêm sách mới, thêm nhạc mới và đồng bộ cá nhân lên cloud.
                </p>
                <p className="text-rose-400 font-medium">
                  ✕ Không có quyền xóa: Nút xóa bị ẩn để bảo vệ toàn vẹn kho nội dung. Chỉ email <strong>xuanduy.cn@gmail.com</strong> mới có quyền xóa.
                </p>
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

          {/* Option C: PWABuilder & Lock Screen Audio Guide + Remove URL Bar Tool */}
              <button
                onClick={() => setActiveTab(activeTab === 'pwabuilder' ? 'profile' : 'pwabuilder')}
                className="w-full flex items-center justify-between p-3.5 hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span>Cài Đặt APK & Bỏ Dấu URL Trên Điện Thoại</span>
                      <span className="text-[9px] bg-[#1ed760] text-black font-black px-1.5 py-0.2 rounded-full">
                        MỚI
                      </span>
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Bỏ thanh URL phía trên, phát nhạc màn hình chờ, logo DiNo chữ D nền vàng
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform ${activeTab === 'pwabuilder' ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* PWABuilder & Remove URL Bar Details Drawer */}
          {activeTab === 'pwabuilder' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1c1c] border border-amber-500/40 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <h5 className="font-bold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Xóa Dấu URL Trên File APK Điện Thoại</span>
                </h5>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Digital Asset Links Đã Sẵn Sàng
                </span>
              </div>

              {/* Giải thích nguyên nhân và cách hoạt động */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-300 space-y-2 leading-relaxed">
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Vì sao ứng dụng APK trên điện thoại còn hiện thanh URL?</span>
                </p>
                <p>
                  File APK tạo từ <strong>PWABuilder</strong> sử dụng công nghệ <strong>Trusted Web Activity (TWA)</strong> của Google. Android yêu cầu website phải cung cấp file xác thực <code className="text-[#1ed760] bg-neutral-900 px-1 rounded">/.well-known/assetlinks.json</code> chứa đúng <strong>Mã vân tay SHA-256</strong> của file APK.
                </p>
                <p className="text-emerald-300">
                  ✓ Ứng dụng DiNo đã tự động cấu hình và mở sẵn endpoint này trên server. Khi mã vân tay khớp, Android sẽ <strong>lập tức ẩn thanh URL</strong>, biến app thành 100% Native toàn màn hình!
                </p>
              </div>

              {/* Form cấu hình & kiểm tra mã vân tay SHA-256 */}
              <form onSubmit={handleSaveAssetLinks} className="space-y-3 p-3.5 rounded-xl bg-[#222222] border border-[#333333]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cấu hình Mã Vân Tay APK của bạn</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleTestAssetLinks}
                    disabled={testStatus === 'checking'}
                    className="text-[11px] text-[#1ed760] hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${testStatus === 'checking' ? 'animate-spin' : ''}`} />
                    <span>Kiểm tra kết nối</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Tên gói ứng dụng (Package ID):
                  </label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="ví dụ: com.dino.app hoặc app.pwabuilder.dino"
                    className="w-full bg-[#161616] border border-[#3a3a3a] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Mã vân tay chứng chỉ SHA-256 (SHA-256 Fingerprint):
                  </label>
                  <textarea
                    rows={2}
                    value={shaFingerprint}
                    onChange={(e) => setShaFingerprint(e.target.value)}
                    placeholder="Dán chuỗi SHA-256 từ PWABuilder (ví dụ: 14:6D:E9:...)"
                    className="w-full bg-[#161616] border border-[#3a3a3a] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono break-all leading-tight"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    * Trong file zip tải về từ PWABuilder, bạn mở file <strong className="text-white">assetlinks.json</strong> (hoặc mở rộng mục Signing trên web PWABuilder) để copy dòng sha256_cert_fingerprints.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSavingAsset}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isSavingAsset ? 'Đang lưu...' : 'Lưu & Kích Hoạt Bỏ Dấu URL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAssetJson}
                    className="py-2 px-3 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] text-neutral-200 text-xs font-semibold transition-all border border-neutral-700 flex items-center gap-1.5"
                    title="Tải file assetlinks.json về máy"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file</span>
                  </button>
                </div>

                {saveAssetMsg && (
                  <p className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-lg">
                    {saveAssetMsg}
                  </p>
                )}

                {testResult && (
                  <div className={`p-2.5 rounded-lg text-[11px] ${testStatus === 'success' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'}`}>
                    {testResult}
                  </div>
                )}
              </form>

              {/* Các bước đóng gói chuẩn trên PWABuilder */}
              <div className="pt-2 border-t border-[#2a2a2a] space-y-2">
                <p className="text-xs font-bold text-amber-300">
                  3 bước nhanh để cài APK không còn thanh URL:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-300 leading-relaxed">
                  <li>Truy cập <strong className="text-white">pwabuilder.com</strong> &rarr; dán link trang web của ứng dụng.</li>
                  <li>Bấm <strong className="text-white">Package for Stores</strong> &rarr; chọn <strong className="text-white">Android</strong> &rarr; tải file APK về cài đặt vào điện thoại.</li>
                  <li>Nếu sau khi cài vẫn còn thanh URL, bạn chỉ cần copy dòng <strong>SHA-256</strong> từ PWABuilder vào ô trên và bấm <strong>Lưu & Kích Hoạt</strong>, sau đó khởi động lại app trên điện thoại là thanh URL sẽ mất hoàn toàn!</li>
                </ol>
              </div>
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
