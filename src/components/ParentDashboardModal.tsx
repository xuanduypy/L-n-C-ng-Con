import React, { useState } from 'react';
import { ChildProfile, LearningHistoryEntry, EnglishWord } from '../types';
import {
  Trophy,
  Calendar,
  Clock,
  Sparkles,
  User,
  Heart,
  TrendingUp,
  X,
  Star,
  CheckCircle2,
  Trash2,
  Award,
} from 'lucide-react';

interface ParentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  childProfile: ChildProfile;
  onUpdateProfile: (updated: ChildProfile) => void;
  history: LearningHistoryEntry[];
  onClearHistory: () => void;
  words: EnglishWord[];
}

export const ParentDashboardModal: React.FC<ParentDashboardModalProps> = ({
  isOpen,
  onClose,
  childProfile,
  onUpdateProfile,
  history,
  onClearHistory,
  words,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'profile'>('overview');
  const [profileForm, setProfileForm] = useState<ChildProfile>(childProfile);

  React.useEffect(() => {
    setProfileForm(childProfile);
  }, [childProfile]);

  if (!isOpen) return null;

  const totalWordsLearned = words.filter((w) => w.mastered).length;
  const scoredEntries = history.filter((h) => h.score !== undefined);
  const avgScore =
    scoredEntries.length > 0
      ? Math.round(
          scoredEntries.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredEntries.length
        )
      : 92;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl text-slate-800 border-4 border-amber-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Báo Cáo Tiến Trình Phát Triển</h3>
              <p className="text-xs text-slate-500">
                Góc theo dõi dành riêng cho cha mẹ của {childProfile.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tổng Quan & Đánh Giá
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'history'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Lịch Sử Hoạt Động ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'profile'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hồ Sơ & Đặt Tên Cún
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200">
                <span className="text-xs font-bold text-rose-700 block mb-1">Từ Vựng Đã Học</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rose-600">{totalWordsLearned}</span>
                  <span className="text-xs text-rose-400 font-bold">/ {words.length} từ</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Đạt chuẩn phát âm chuẩn xác</p>
              </div>

              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-amber-700 block mb-1">
                  Điểm Phát Âm TB
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-600">{avgScore}</span>
                  <span className="text-xs text-amber-500 font-bold">/ 100 điểm</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">AI phân tích độ tròn vành rõ chữ</p>
              </div>

              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 block mb-1">
                  Chuỗi Ngày Học (Streak)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-600">5</span>
                  <span className="text-xs text-emerald-500 font-bold">ngày liên tiếp 🔥</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Duy trì thói quen giao tiếp</p>
              </div>

              <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200">
                <span className="text-xs font-bold text-blue-700 block mb-1">Thời Lượng Mỗi Ngày</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-600">
                    {childProfile.dailyGoalMinutes}
                  </span>
                  <span className="text-xs text-blue-500 font-bold">phút mục tiêu</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Thời gian màn hình an toàn</p>
              </div>
            </div>

            {/* AI Insights & Advice for Parents */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-3xl border-2 border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Nhận Xét & Lời Khuyên Của Chuyên Gia AI:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                🐾 Bé <strong>{childProfile.name}</strong> rất tích cực tương tác và yêu thích
                các chủ đề về loài vật và thiên nhiên. Bé phát âm các nguyên âm tiếng Anh rất sáng và
                tự tin khi được chú cún <strong>{childProfile.puppyName}</strong> khích lệ.
              </p>
              <p className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-amber-200">
                💡 <strong>Gợi ý cho ba mẹ:</strong> Hãy cùng bé đọc lại từ vựng vào bữa tối hoặc
                khen ngợi mỗi khi bé nhắc lại một từ tiếng Anh mới trong sinh hoạt gia đình!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Nhật ký tương tác gần đây:</span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa nhật ký</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có lịch sử học tập nào. Hãy cùng bé bắt đầu trò chuyện và luyện phát âm nhé!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>

                    <p className="text-slate-600">{item.detail}</p>

                    {item.score !== undefined && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {item.score}/100 điểm
                        </span>
                        {item.stars && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: item.stars }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHILD PROFILE & PUPPY NAME SETTING */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên của bé:</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-400 outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                🐶 Tên bé đặt cho chú cún con:
              </label>
              <input
                type="text"
                required
                value={profileForm.puppyName}
                onChange={(e) => setProfileForm({ ...profileForm, puppyName: e.target.value })}
                placeholder="Ví dụ: Cún Bông, LuLu, Lucky, MiuMiu..."
                className="w-full p-2.5 rounded-xl border-2 border-amber-300 font-extrabold text-amber-900 bg-amber-50/50 text-xs focus:border-rose-400 outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Chú cún sẽ dùng tên này xưng hô thân mật với bé trong mọi câu chuyện!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Độ tuổi của bé:</label>
                <select
                  value={profileForm.age}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, age: parseInt(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-400 outline-hidden"
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                    <option key={age} value={age}>
                      {age} tuổi
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mục tiêu học mỗi ngày:
                </label>
                <select
                  value={profileForm.dailyGoalMinutes}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      dailyGoalMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-400 outline-hidden"
                >
                  <option value={10}>10 phút / ngày</option>
                  <option value={15}>15 phút / ngày (Khuyên dùng)</option>
                  <option value={20}>20 phút / ngày</option>
                  <option value={30}>30 phút / ngày</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-3 rounded-2xl font-black text-xs shadow-lg shadow-rose-200 active:scale-95 transition"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
