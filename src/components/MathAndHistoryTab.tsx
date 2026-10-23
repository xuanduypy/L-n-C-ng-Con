import React, { useState } from 'react';
import { MathChallenge, HistoryTopic, ChildProfile } from '../types';
import {
  Calculator,
  Compass,
  CheckCircle2,
  Sparkles,
  Volume2,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathAndHistoryTabProps {
  mathList: MathChallenge[];
  historyList: HistoryTopic[];
  childProfile: ChildProfile;
  onAskPuppyAboutHistory: (hero: string, question: string) => void;
  onNarrateStory: (title: string, text: string) => void;
  isSpeakingAudio: boolean;
}

export const MathAndHistoryTab: React.FC<MathAndHistoryTabProps> = ({
  mathList,
  historyList,
  childProfile,
  onAskPuppyAboutHistory,
  onNarrateStory,
  isSpeakingAudio,
}) => {
  const [activeSection, setActiveSection] = useState<'math' | 'history'>('math');
  const [currentMathIndex, setCurrentMathIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [mathFeedback, setMathFeedback] = useState<{ isCorrect: boolean; message: string } | null>(
    null
  );
  const [selectedHistory, setSelectedHistory] = useState<HistoryTopic>(historyList[0]);

  const currentMath = mathList[currentMathIndex] || mathList[0];

  const handleSelectAnswer = (ans: number) => {
    setSelectedAnswer(ans);
    const isCorrect = ans === currentMath.correctAnswer;
    if (isCorrect) {
      setMathFeedback({
        isCorrect: true,
        message: `Gâu gâu! Bé ${childProfile.name} đếm chuẩn xác 100%! Cún vẫy đuôi hoan hô bé nè! 🐾`,
      });
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#EC4899', '#3B82F6'],
      });
    } else {
      setMathFeedback({
        isCorrect: false,
        message: `Gần đúng rồi bé ơi! Bé thử cùng cún đếm lại các hình vẽ trên xem nào!`,
      });
    }
  };

  const handleNextMath = () => {
    setSelectedAnswer(null);
    setMathFeedback(null);
    setCurrentMathIndex((prev) => (prev + 1) % mathList.length);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-16 space-y-5">
      {/* Tab Switcher */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl">
        <button
          onClick={() => setActiveSection('math')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeSection === 'math'
              ? 'bg-white text-amber-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Toán Học Vui Nhộn (Đếm Số & Đố Vui)</span>
        </button>

        <button
          onClick={() => setActiveSection('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeSection === 'history'
              ? 'bg-white text-rose-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Lịch Sử & Thế Giới Diệu Kỳ</span>
        </button>
      </div>

      {/* SECTION 1: MATH CHALLENGES */}
      {activeSection === 'math' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-3 border-amber-300 relative text-center">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                Câu đố {currentMathIndex + 1}/{mathList.length}
              </span>
              <span>Bé thử tài cùng cún nhé</span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-800 mt-2 leading-relaxed">
              {currentMath.question}
            </h3>

            {/* Visual counting playground */}
            <div className="bg-amber-50/70 rounded-3xl p-4 sm:p-6 my-4 border-2 border-dashed border-amber-200 flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: currentMath.visualCountA }).map((_, i) => (
                <span
                  key={`a-${i}`}
                  className="text-4xl sm:text-5xl hover:scale-125 transition-transform cursor-pointer filter drop-shadow-sm select-none"
                  title="Chạm để đếm"
                >
                  {currentMath.visualEmoji}
                </span>
              ))}

              {currentMath.operation === '+' && (
                <span className="text-3xl font-black text-amber-600 mx-2">+</span>
              )}
              {currentMath.operation === '-' && (
                <span className="text-3xl font-black text-rose-600 mx-2">-</span>
              )}

              {Array.from({ length: currentMath.visualCountB }).map((_, i) => (
                <span
                  key={`b-${i}`}
                  className="text-4xl sm:text-5xl hover:scale-125 transition-transform cursor-pointer filter drop-shadow-sm select-none"
                  title="Chạm để đếm"
                >
                  {currentMath.visualEmoji}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic mb-4">
              💡 <strong>Gợi ý của cún:</strong> {currentMath.hint}
            </p>

            {/* Answer Options */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {currentMath.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentMath.correctAnswer;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`py-4 rounded-2xl font-black text-2xl transition shadow-sm border-2 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-105'
                          : 'bg-rose-500 border-rose-600 text-white shadow-rose-200'
                        : 'bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-200 active:scale-95'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {mathFeedback && (
              <div
                className={`mt-5 p-4 rounded-2xl border text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in ${
                  mathFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="text-2xl">{mathFeedback.isCorrect ? '🎉' : '🐶'}</span>
                  <span>{mathFeedback.message}</span>
                </div>

                {mathFeedback.isCorrect && (
                  <button
                    onClick={handleNextMath}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow transition active:scale-95"
                  >
                    Câu Tiếp Theo ➔
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: HISTORY & WORLD WONDERS */}
      {activeSection === 'history' && (
        <div className="space-y-4">
          {/* History Topics Selector */}
          <div className="grid grid-cols-2 gap-2.5">
            {historyList.map((hist) => {
              const isSelected = selectedHistory.id === hist.id;
              return (
                <div
                  key={hist.id}
                  onClick={() => setSelectedHistory(hist)}
                  className={`p-3.5 rounded-2xl cursor-pointer border-2 transition ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50 shadow-md scale-[1.01]'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{hist.imageEmoji}</span>
                    <span className="font-extrabold text-xs text-slate-800 line-clamp-1">
                      {hist.hero}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {hist.title}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Story Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-3 border-rose-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                  {selectedHistory.period}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-2">
                  {selectedHistory.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Nhân vật: <strong>{selectedHistory.hero}</strong>
                </p>
              </div>

              <span className="text-4xl p-2 bg-rose-50 rounded-2xl">{selectedHistory.imageEmoji}</span>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-sm leading-relaxed text-slate-700">
              <p className="italic">"{selectedHistory.storySnippet}"</p>
            </div>

            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-200 text-xs">
              <p className="font-extrabold text-rose-700">
                🌱 Bài học nhân văn: {selectedHistory.moralLesson}
              </p>
            </div>

            {/* Narration & Q&A Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() =>
                  onNarrateStory(selectedHistory.title, selectedHistory.storySnippet)
                }
                disabled={isSpeakingAudio}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white py-2.5 px-4 rounded-2xl font-black text-xs shadow-md shadow-rose-200 active:scale-95 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Cún Kể Chuyện Này Cho Bé</span>
              </button>

              <button
                onClick={() =>
                  onAskPuppyAboutHistory(
                    selectedHistory.hero,
                    `Kể thêm cho bé nghe về ${selectedHistory.hero} và tại sao nhân vật này lại anh hùng như thế nhé!`
                  )
                }
                className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 py-2.5 px-4 rounded-2xl font-bold text-xs active:scale-95 transition"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Hỏi Cún Về Nhân Vật Này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
