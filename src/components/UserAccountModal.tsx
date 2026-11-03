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
  LogOut,
  Mail,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { UserAccount, VoiceSettings, ZODIAC_ANIMALS, ZodiacOption } from '../types/book';
import { SleepTimerOption } from '../hooks/useSleepTimer';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: number;
  onManualSync: () => void;
  onLogin: (email: string, name?: string) => Promise<boolean>;
  onLoginWithCredentials?: (username: string, pass: string) => Promise<{ success: boolean; error?: string } | boolean>;
  onUpdateProfile?: (data: {
    name?: string;
    username?: string;
    password?: string;
    zodiacId?: string;
    zodiacEmoji?: string;
  }) => Promise<{ success: boolean; error?: string } | boolean>;
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
  onLoginWithCredentials,
  onUpdateProfile,
  onLogout,
  onOpenVoiceSettings,
  totalBooksCount,
  totalTracksCount,
  totalCustomCount,
  sleepTimerOption,
  sleepTimerFormatted,
  onSetSleepTimer,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'apk'>('profile');
  const [authMode, setAuthMode] = useState<'email' | 'credentials'>('email');

  // Login form state
  const [inputEmail, setInputEmail] = useState(user?.email || '');
  const [inputName, setInputName] = useState(user?.name || '');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editPassword, setEditPassword] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState<string>(user?.zodiacId || 'ty');
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  // Digital Asset Links State
  const [pkgName, setPkgName] = useState('com.dino.app');
  const [shaFingerprint, setShaFingerprint] = useState(
    '14:6D:E9:DE:3C:94:0A:14:D0:68:55:04:1E:73:96:AC:76:A4:7B:6A:E7:E2:B0:92:B5:14:CE:BA:7D:6F:E1:90'
  );
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [saveAssetMsg, setSaveAssetMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditUsername(user.username || '');
      if (user.zodiacId) setSelectedZodiac(user.zodiacId);
    }
  }, [user]);

  // Load existing assetlinks
  useEffect(() => {
    if (isOpen) {
      fetch('/api/assetlinks')
        .then((res) => res.json())
        .then((data) => {
          if (data?.items?.length > 0) {
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

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) {
      setLoginError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    setLoginError(null);
    setIsSubmitting(true);
    const ok = await onLogin(inputEmail, inputName.trim() || undefined);
    setIsSubmitting(false);
    if (!ok) setLoginError('Đăng nhập không thành công, vui lòng thử lại');
  };

  const handleGoogleQuickLogin = async () => {
    // Fast 1-click Google account connector
    setIsSubmitting(true);
    const email = prompt('Nhập địa chỉ Gmail của bạn:', user?.email || 'xuanduy.cn@gmail.com');
    if (email && email.includes('@')) {
      await onLogin(email.trim(), email.split('@')[0]);
    }
    setIsSubmitting(false);
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername || !inputPassword) {
      setLoginError('Vui lòng nhập Tên use và Mật khẩu');
      return;
    }
    setLoginError(null);
    setIsSubmitting(true);
    if (onLoginWithCredentials) {
      const ok = await onLoginWithCredentials(inputUsername.trim(), inputPassword.trim());
      if (!ok) setLoginError('Tên use hoặc mật khẩu chưa chính xác');
    }
    setIsSubmitting(false);
  };

  const handleSaveProfile = async () => {
    if (!onUpdateProfile) return;
    const zodiac = ZODIAC_ANIMALS.find((z) => z.id === selectedZodiac);
    const ok = await onUpdateProfile({
      name: editName.trim() || user?.name,
      username: editUsername.trim() || undefined,
      password: editPassword.trim() || undefined,
      zodiacId: selectedZodiac,
      zodiacEmoji: zodiac?.emoji,
    });
    if (ok) {
      setProfileSavedMsg('✓ Đã cập nhật hồ sơ & con giáp!');
      setEditPassword('');
      setTimeout(() => setProfileSavedMsg(null), 3000);
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
      if (res.ok) {
        setSaveAssetMsg('✓ Đã lưu cấu hình xoá thanh URL cho APK!');
      } else {
        setSaveAssetMsg('Lỗi khi lưu cấu hình');
      }
    } catch {
      setSaveAssetMsg('Lỗi kết nối máy chủ');
    } finally {
      setIsSavingAsset(false);
    }
  };

  const currentZodiac = ZODIAC_ANIMALS.find((z) => z.id === (user?.zodiacId || selectedZodiac)) || ZODIAC_ANIMALS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div
        className="bg-[#161616] border border-[#2a2a2a] rounded-3xl w-full max-w-lg flex flex-col text-white shadow-2xl overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between bg-[#1c1c1c]">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${currentZodiac.color} flex items-center justify-center text-2xl shadow-md border border-white/20 shrink-0`}
            >
              {user?.zodiacEmoji || currentZodiac.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {user?.name || (user?.isAdmin ? 'Xuân Duy' : 'Tài Khoản DiNo')}
                </h3>
                {user?.isAdmin ? (
                  <span className="text-[10px] bg-amber-400 text-neutral-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    👑 Quản Trị Viên
                  </span>
                ) : (
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 font-semibold px-2 py-0.5 rounded-full">
                    Thành viên
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {user?.email || (user?.username ? `@${user.username}` : 'Chưa đăng nhập')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#242424] bg-[#141414] px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Hồ Sơ & Con Giáp
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Cài Đặt & Hẹn Giờ
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Xoá URL Trên APK
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-5 space-y-5 text-xs sm:text-sm overflow-y-auto max-h-[calc(92vh-130px)]">
          {activeTab === 'profile' && (
            <>
              {/* If NOT logged in, show clean login options */}
              {!user?.isLoggedIn ? (
                <div className="space-y-4">
                  {/* Google 1-click button */}
                  <button
                    onClick={handleGoogleQuickLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Đăng Nhập Nhanh Bằng Gmail
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-neutral-800" />
                    <span className="text-[11px] text-neutral-500 uppercase">Hoặc</span>
                    <div className="flex-1 h-px bg-neutral-800" />
                  </div>

                  {/* Mode switcher: Email vs Username */}
                  <div className="flex bg-neutral-900 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAuthMode('email')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        authMode === 'email' ? 'bg-[#262626] text-white' : 'text-neutral-400'
                      }`}
                    >
                      Bằng Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('credentials')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        authMode === 'credentials' ? 'bg-[#262626] text-white' : 'text-neutral-400'
                      }`}
                    >
                      Bằng Tên Use & Pass
                    </button>
                  </div>

                  {authMode === 'email' ? (
                    <form onSubmit={handleEmailLogin} className="space-y-3">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Địa chỉ Email</label>
                        <input
                          type="email"
                          value={inputEmail}
                          onChange={(e) => setInputEmail(e.target.value)}
                          placeholder="ví dụ: xuanduy.cn@gmail.com"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Tên hiển thị (tuỳ chọn)</label>
                        <input
                          type="text"
                          value={inputName}
                          onChange={(e) => setInputName(e.target.value)}
                          placeholder="ví dụ: Duy Nguyễn"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {loginError && <p className="text-red-400 text-xs">{loginError}</p>}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-bold transition-colors"
                      >
                        {isSubmitting ? 'Đang kết nối...' : 'Tiếp Tục Bằng Email'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleCredentialsLogin} className="space-y-3">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Tên use</label>
                        <input
                          type="text"
                          value={inputUsername}
                          onChange={(e) => setInputUsername(e.target.value)}
                          placeholder="Tên use của bạn"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Pass</label>
                        <input
                          type="password"
                          value={inputPassword}
                          onChange={(e) => setInputPassword(e.target.value)}
                          placeholder="Mật khẩu"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {loginError && <p className="text-red-400 text-xs">{loginError}</p>}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-bold transition-colors"
                      >
                        {isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* LOGGED IN USER PROFILE MANAGEMENT */
                <div className="space-y-5">
                  {/* 12 CON GIAP SELECTOR */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Chọn Ảnh Đại Diện 12 Con Giáp</span>
                      </label>
                      <span className="text-[11px] text-amber-400 font-bold">
                        Đang chọn: {currentZodiac.emoji} {currentZodiac.name} ({currentZodiac.animal})
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {ZODIAC_ANIMALS.map((zodiac) => {
                        const isSelected = selectedZodiac === zodiac.id;
                        return (
                          <button
                            key={zodiac.id}
                            type="button"
                            onClick={() => setSelectedZodiac(zodiac.id)}
                            className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 border transition-all ${
                              isSelected
                                ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <span className="text-2xl">{zodiac.emoji}</span>
                            <span className="text-[10px] font-bold text-neutral-300">{zodiac.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* EDIT DISPLAY NAME & CREDENTIALS */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Chỉnh Sửa Thông Tin
                    </h4>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Tên hiển thị</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Tên của bạn"
                          className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Tên use riêng</label>
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="ví dụ: xuanduy"
                            className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Pass riêng mới</label>
                          <input
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {profileSavedMsg && (
                      <p className="text-emerald-400 text-xs font-bold">{profileSavedMsg}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Lưu Thay Đổi Hồ Sơ & Con Giáp
                    </button>
                  </div>

                  {/* Super admin status info */}
                  {user.isAdmin && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="text-xs text-amber-200">
                        <strong className="text-amber-300">Tài Khoản Admin Cao Nhất:</strong> Bạn có quyền xoá sách và nhạc mặc định, đồng bộ toàn hệ thống.
                      </div>
                    </div>
                  )}

                  {/* LOGOUT BUTTON - KHI THOAT LA THOAT HAN */}
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn đăng xuất và thoát hẳn phiên làm việc?')) {
                        onLogout();
                        onClose();
                      }
                    }}
                    className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-xs"
                  >
                    <LogOut className="w-4 h-4" /> Thoát Hẳn Tài Khoản
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Sleep timer */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                    <Moon className="w-4 h-4 text-indigo-400" /> Hẹn Giờ Tự Tắt Nhạc & Sách
                  </div>
                  {sleepTimerFormatted && (
                    <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                      Còn {sleepTimerFormatted}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {([null, 15, 30, 45, 60] as SleepTimerOption[]).map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => onSetSleepTimer(opt)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        sleepTimerOption === opt
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {opt === null ? 'Tắt' : `${opt}p`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloud Sync */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">Đồng Bộ Dữ Liệu Web & Điện Thoại</h4>
                    <p className="text-[11px] text-neutral-400">
                      {syncStatus === 'syncing' ? 'Đang đồng bộ...' : 'Tự động đồng bộ sách và nhạc'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onManualSync}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold text-neutral-200 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /> Đồng Bộ
                </button>
              </div>

              {/* Shortcut to Voice Training */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVoiceSettings();
                }}
                className="w-full p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between text-left hover:border-amber-400/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-lg shadow">
                    🎙️
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">Phòng Thu & Huấn Luyện Giọng</h4>
                    <p className="text-[11px] text-neutral-400">Thu âm giọng đọc cá nhân để đọc sách audio</p>
                  </div>
                </div>
                <span className="text-amber-400 text-xs font-bold">Mở →</span>
              </button>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <form onSubmit={handleSaveAssetLinks} className="space-y-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Package Name APK</label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">SHA-256 Fingerprint</label>
                  <input
                    type="text"
                    value={shaFingerprint}
                    onChange={(e) => setShaFingerprint(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                  />
                </div>

                {saveAssetMsg && <p className="text-emerald-400 text-xs font-bold">{saveAssetMsg}</p>}

                <button
                  type="submit"
                  disabled={isSavingAsset}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors"
                >
                  {isSavingAsset ? 'Đang lưu...' : 'Lưu Cấu Hình Ẩn Thanh URL'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
