import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Cloud,
  Check,
  RefreshCw,
  Moon,
  LogOut,
  Mail,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Edit3,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Mic,
} from 'lucide-react';
import { UserAccount, VoiceSettings, ZODIAC_ANIMALS, ADMIN_SUPER_EMAIL } from '../types/book';
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
  onResetPassword?: (identifier: string, newPass: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onLogout: () => void;
  onOpenVoiceSettings: () => void;
  totalBooksCount: number;
  totalTracksCount: number;
  totalCustomCount: number;
  sleepTimerOption: SleepTimerOption;
  sleepTimerFormatted: string | null;
  onSetSleepTimer: (option: SleepTimerOption) => void;
  voiceSettings: VoiceSettings;
  initialNotice?: string | null;
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
  onResetPassword,
  onLogout,
  onOpenVoiceSettings,
  totalBooksCount,
  totalTracksCount,
  totalCustomCount,
  sleepTimerOption,
  sleepTimerFormatted,
  onSetSleepTimer,
  initialNotice,
}) => {
  // Tabs for Logged-In User: 'profile' (Hồ sơ & Con giáp), 'security' (Tên use & Đổi pass), 'timer' (Cài đặt hẹn giờ)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'timer'>('profile');

  // Auth Modes for Guest: 'gmail' | 'credentials' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState<'gmail' | 'credentials' | 'register' | 'forgot'>('gmail');

  // Form states
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputConfirmPassword, setInputConfirmPassword] = useState('');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Edit states
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState<string>(user?.zodiacId || 'thin');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditUsername(user.username || '');
      if (user.zodiacId) setSelectedZodiac(user.zodiacId);
    }
  }, [user]);

  if (!isOpen) return null;

  // 1. Gmail / Google Login
  const handleGmailLogin = async (targetEmail?: string) => {
    const emailToUse = targetEmail || inputEmail.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setFormError('Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: xuanduy.cn@gmail.com)');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const ok = await onLogin(emailToUse, inputName.trim() || undefined);
      if (ok) {
        setFormSuccess('Đăng nhập Gmail thành công!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setFormError('Không thể đăng nhập, vui lòng kiểm tra lại');
      }
    } catch {
      setFormError('Lỗi kết nối khi đăng nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Username & Password Login
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim() || !inputPassword.trim()) {
      setFormError('Vui lòng nhập Tên use (hoặc Email) và Mật khẩu');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (onLoginWithCredentials) {
        const res = await onLoginWithCredentials(inputUsername.trim(), inputPassword.trim());
        const ok = typeof res === 'boolean' ? res : res.success;
        if (ok) {
          setFormSuccess('Đăng nhập thành công!');
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setFormError(typeof res === 'object' && res.error ? res.error : 'Tên use hoặc mật khẩu chưa chính xác');
        }
      }
    } catch {
      setFormError('Lỗi kết nối khi đăng nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Register New Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim() || !inputEmail.includes('@')) {
      setFormError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    if (!inputPassword.trim() || inputPassword.length < 4) {
      setFormError('Mật khẩu cần tối thiểu 4 ký tự');
      return;
    }
    if (inputPassword !== inputConfirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const ok = await onLogin(inputEmail.trim(), inputName.trim() || inputUsername.trim() || undefined);
      if (ok && onUpdateProfile) {
        await onUpdateProfile({
          name: inputName.trim() || inputEmail.split('@')[0],
          username: inputUsername.trim() || inputEmail.split('@')[0],
          password: inputPassword.trim(),
        });
        setFormSuccess('Đăng ký tài khoản thành viên thành công!');
        setTimeout(() => onClose(), 800);
      }
    } catch {
      setFormError('Lỗi đăng ký tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Password Recovery / Reset (Quên pass phục hồi)
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      setFormError('Vui lòng nhập Email hoặc Tên use cần phục hồi mật khẩu');
      return;
    }
    if (!recoveryNewPassword.trim() || recoveryNewPassword.length < 4) {
      setFormError('Mật khẩu mới cần tối thiểu 4 ký tự');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      if (onResetPassword) {
        const res = await onResetPassword(recoveryIdentifier.trim(), recoveryNewPassword.trim());
        if (res.success) {
          setFormSuccess(res.message || 'Phục hồi và đặt lại mật khẩu thành công! Đang đăng nhập...');
          setTimeout(() => onClose(), 1200);
        } else {
          setFormError(res.error || 'Không tìm thấy tài khoản với thông tin này');
        }
      }
    } catch {
      setFormError('Lỗi phục hồi mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Update Profile (Name & Zodiac)
  const handleSaveProfileInfo = async () => {
    if (!onUpdateProfile) return;
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    const zodiac = ZODIAC_ANIMALS.find((z) => z.id === selectedZodiac);
    const res = await onUpdateProfile({
      name: editName.trim() || user?.name,
      zodiacId: selectedZodiac,
      zodiacEmoji: zodiac?.emoji,
    });
    setIsSubmitting(false);
    const ok = typeof res === 'boolean' ? res : res.success;
    if (ok) {
      setFormSuccess('✓ Đã lưu thay đổi thông tin và ảnh đại diện con giáp!');
      setTimeout(() => setFormSuccess(null), 3500);
    }
  };

  // 6. Update Credentials (Tên use riêng & Đổi pass mới)
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    if (editNewPassword && editNewPassword !== editConfirmPassword) {
      setFormError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const updatePayload: any = {};
    if (editUsername.trim()) updatePayload.username = editUsername.trim();
    if (editNewPassword.trim()) updatePayload.password = editNewPassword.trim();

    const res = await onUpdateProfile(updatePayload);
    setIsSubmitting(false);
    const ok = typeof res === 'boolean' ? res : res.success;
    if (ok) {
      setFormSuccess('✓ Đã cập nhật Tên use và Mật khẩu mới thành công!');
      setEditNewPassword('');
      setEditConfirmPassword('');
      setTimeout(() => setFormSuccess(null), 3500);
    } else {
      setFormError(typeof res === 'object' && res.error ? res.error : 'Cập nhật thất bại');
    }
  };

  const currentZodiac = ZODIAC_ANIMALS.find((z) => z.id === (user?.zodiacId || selectedZodiac)) || ZODIAC_ANIMALS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-[#2a2a2a] rounded-3xl w-full max-w-md sm:max-w-lg flex flex-col text-white shadow-2xl overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between bg-[#191919]">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${
                user?.isAdmin ? 'from-amber-400 to-yellow-500 text-black' : currentZodiac.color
              } flex items-center justify-center text-2xl shadow-md border border-white/20 shrink-0`}
            >
              {user ? (user.zodiacEmoji || (user.isAdmin ? '👑' : currentZodiac.emoji)) : '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {user?.isLoggedIn
                    ? user.name
                    : 'Đăng Nhập Tài Khoản'}
                </h3>
                {user?.isLoggedIn && (
                  user.isAdmin ? (
                    <span className="text-[10px] bg-amber-400 text-neutral-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      👑 Quản Trị Viên
                    </span>
                  ) : null
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {user?.isLoggedIn
                  ? user.email || `@${user.username || 'thanh_vien'}`
                  : 'Đăng nhập để tải audio và lưu vào kho'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice for guests attempting restricted actions */}
        {initialNotice && !user?.isLoggedIn && (
          <div className="px-5 py-2.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span className="font-medium">{initialNotice}</span>
          </div>
        )}

        {/* Tab switchers for LOGGED-IN users */}
        {user?.isLoggedIn && (
          <div className="flex border-b border-[#242424] bg-[#121212] px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Hồ Sơ &amp; Con Giáp</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'security'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Tên Use &amp; Đổi Pass</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'timer'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Cài Đặt Hẹn Giờ</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-5 text-xs sm:text-sm overflow-y-auto max-h-[calc(92vh-140px)]">
          {/* ======================================================== */}
          {/* CASE A: GUEST USER (MÀN HÌNH ĐĂNG NHẬP / PHỤC HỒI) */}
          {/* ======================================================== */}
          {!user?.isLoggedIn ? (
            <div className="space-y-4">
              {/* Auth Mode Tabs */}
              <div className="grid grid-cols-3 bg-[#1e1e1e] p-1 rounded-2xl text-xs font-bold border border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('gmail');
                    setFormError(null);
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === 'gmail' ? 'bg-amber-400 text-neutral-950 font-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Bằng Gmail
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('credentials');
                    setFormError(null);
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === 'credentials' ? 'bg-amber-400 text-neutral-950 font-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Tên Use / Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setFormError(null);
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === 'forgot' ? 'bg-amber-400 text-neutral-950 font-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Quên Pass
                </button>
              </div>

              {/* Feedback messages */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold">
                  {formSuccess}
                </div>
              )}

              {/* MODE 1: GMAIL LOGIN */}
              {authMode === 'gmail' && (
                <div className="space-y-4 pt-1">
                  {/* Google Quick Button */}
                  <button
                    onClick={() => handleGmailLogin('xuanduy.cn@gmail.com')}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-98 cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                    <span>Đăng Nhập Nhanh Bằng Gmail (Admin / Chủ Sở Hữu)</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-neutral-800" />
                    <span className="text-[11px] text-neutral-500 uppercase font-bold">Hoặc Nhập Gmail Khác</span>
                    <div className="flex-1 h-px bg-neutral-800" />
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGmailLogin();
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Địa chỉ Gmail</label>
                      <input
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder="tenban@gmail.com"
                        className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Tên hiển thị (Tùy chọn)</label>
                      <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="Họ và tên của bạn"
                        className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#1ed760] hover:bg-[#1fdf64] text-neutral-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang kết nối...' : 'Tiếp Tục Bằng Gmail Này'}
                    </button>
                  </form>
                </div>
              )}

              {/* MODE 2: USERNAME & PASSWORD LOGIN */}
              {authMode === 'credentials' && (
                <form onSubmit={handleCredentialsLogin} className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Tên use hoặc Email</label>
                    <input
                      type="text"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      placeholder="Nhập tên use của bạn (ví dụ: admin, xuanduy...)"
                      className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Mật khẩu</label>
                    <input
                      type="password"
                      value={inputPassword}
                      onChange={(e) => setInputPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-purple-400 hover:underline cursor-pointer font-bold"
                    >
                      Tạo tài khoản mới
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'}
                  </button>
                </form>
              )}

              {/* MODE 3: REGISTER NEW ACCOUNT */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Tên hiển thị</label>
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="Họ và tên của bạn"
                      className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Địa chỉ Email</label>
                    <input
                      type="email"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="email@gmail.com"
                      className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Tên use riêng</label>
                    <input
                      type="text"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      placeholder="ví dụ: dino_user"
                      className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Mật khẩu</label>
                      <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Xác nhận</label>
                      <input
                        type="password"
                        value={inputConfirmPassword}
                        onChange={(e) => setInputConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản Thành Viên'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('credentials')}
                      className="text-neutral-400 hover:text-white text-xs underline cursor-pointer"
                    >
                      Đã có tài khoản? Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}

              {/* MODE 4: FORGOT PASSWORD (QUÊN PASS PHỤC HỒI) */}
              {authMode === 'forgot' && (
                <form onSubmit={handlePasswordRecovery} className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs">
                    💡 Nhập Email hoặc Tên use đã đăng ký để đặt lại mật khẩu mới ngay lập tức.
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Email hoặc Tên use cần phục hồi</label>
                    <input
                      type="text"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="Email hoặc Tên use của bạn"
                      className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Mật khẩu mới muốn đặt</label>
                    <input
                      type="password"
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full bg-[#181818] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang khôi phục...' : 'Đặt Lại Mật Khẩu Mới'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('credentials')}
                      className="text-neutral-400 hover:text-white text-xs underline cursor-pointer"
                    >
                      Nhớ mật khẩu? Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* CASE B: LOGGED IN USER (HỒ SƠ, CON GIÁP, BẢO MẬT, HẸN GIỜ) */
            /* ======================================================== */
            <div className="space-y-5">
              {/* Messages */}
              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold">
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              {/* TAB 1: HỒ SƠ & CON GIÁP */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {/* 12 Con Giap Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chọn Ảnh Đại Diện 12 Con Giáp</span>
                      </label>
                      <span className="text-[11px] text-amber-400 font-bold">
                        {currentZodiac.emoji} {currentZodiac.name} ({currentZodiac.animal})
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
                            className={`p-2 rounded-2xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                                : 'bg-[#181818] border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <span className="text-2xl">{zodiac.emoji}</span>
                            <span className="text-[10px] font-bold text-neutral-300">{zodiac.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Edit Display Name */}
                  <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 space-y-3">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chỉnh Sửa Tên Hiển Thị</span>
                    </label>

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Tên của bạn"
                      className="w-full bg-[#121212] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleSaveProfileInfo}
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow active:scale-98 cursor-pointer"
                    >
                      {isSubmitting ? 'Đang lưu...' : 'Lưu Tên & Con Giáp'}
                    </button>
                  </div>

                  {/* Super admin status info */}
                  {user.isAdmin && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="text-xs text-amber-200">
                        <strong className="text-amber-300">Quản Trị Viên Hệ Thống:</strong> Tài khoản toàn quyền xuất bản, quản lý và xóa nội dung.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TÊN USE & ĐỔI PASS */}
              {activeTab === 'security' && (
                <form onSubmit={handleSaveCredentials} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 space-y-3">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>Tên Use Riêng</span>
                    </label>

                    <div>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Đặt tên use riêng (ví dụ: xuanduy)"
                        className="w-full bg-[#121212] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white outline-none"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Dùng tên use này để đăng nhập nhanh mà không cần gõ địa chỉ email.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 space-y-3">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Đổi Mật Khẩu Mới</span>
                    </label>

                    <div className="space-y-2.5">
                      <input
                        type="password"
                        value={editNewPassword}
                        onChange={(e) => setEditNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full bg-[#121212] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white outline-none"
                      />
                      <input
                        type="password"
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu mới"
                        className="w-full bg-[#121212] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow active:scale-98 cursor-pointer"
                    >
                      {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Tên Use & Mật Khẩu Mới'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CÀI ĐẶT HẸN GIỜ (SLEEP TIMER) */}
              {activeTab === 'timer' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span>Hẹn Giờ Tự Tắt Nhạc &amp; Sách</span>
                      </div>
                      {sleepTimerFormatted && (
                        <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>Còn {sleepTimerFormatted}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-400">
                      Khi hết thời gian hẹn giờ, âm thanh sách nói và nhạc sẽ tự động tạm dừng êm ái giúp bạn yên giấc ngủ ngon.
                    </p>

                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {([null, 15, 30, 45, 60] as SleepTimerOption[]).map((opt) => (
                        <button
                          key={String(opt)}
                          type="button"
                          onClick={() => onSetSleepTimer(opt)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            sleepTimerOption === opt
                              ? 'bg-indigo-600 text-white font-black shadow-md'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          {opt === null ? 'Tắt' : `${opt}p`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cloud Sync Status */}
                  <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="font-bold text-xs text-white">Đồng Bộ Đám Mây</h4>
                        <p className="text-[10px] text-neutral-400">
                          {syncStatus === 'syncing' ? 'Đang đồng bộ...' : 'Đã đồng bộ tác phẩm trên mọi thiết bị'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onManualSync}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold text-neutral-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>Đồng Bộ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DƯỚI CÙNG: NÚT ĐĂNG XUẤT */}
              <div className="pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản? Bạn sẽ trở về chế độ khách.')) {
                      onLogout();
                      onClose();
                    }
                  }}
                  className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-red-200 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-98"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng Xuất (Thoát Hẳn Tài Khoản)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
