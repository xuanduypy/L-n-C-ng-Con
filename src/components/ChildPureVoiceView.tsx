import React, { useState, useRef, useEffect } from 'react';
import { PuppyAvatar } from './PuppyAvatar';
import { PuppyMood, PuppyCostume, ActiveVocabularyPrompt } from '../types';
import { Volume2, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface ChildPureVoiceViewProps {
  puppyName: string;
  puppyMood: PuppyMood;
  isSpeaking: boolean;
  isListening: boolean;
  speechDetected: boolean;
  puppyCostume: PuppyCostume;
  onPetPuppy: () => void;
  onRequestParentOpen: () => void;
  activeVocabPrompt: ActiveVocabularyPrompt | null;
  onPlayVocabAudio?: (word: string) => void;
  onDismissVocabPrompt?: () => void;
  activeMusicTitle?: string | null;
  onStopMusic?: () => void;
}

export const ChildPureVoiceView: React.FC<ChildPureVoiceViewProps> = ({
  puppyName,
  puppyMood,
  isSpeaking,
  isListening,
  speechDetected,
  puppyCostume,
  onPetPuppy,
  onRequestParentOpen,
  activeVocabPrompt,
  onPlayVocabAudio,
  onDismissVocabPrompt,
  activeMusicTitle,
  onStopMusic,
}) => {
  // Secret 3-second press in the top-right corner
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressingCorner, setIsPressingCorner] = useState(false);
  const pressTimerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  const startCornerPress = () => {
    setIsPressingCorner(true);
    setPressProgress(0);
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setPressProgress(pct);
    }, 50);

    pressTimerRef.current = setTimeout(() => {
      clearInterval(progressIntervalRef.current);
      setPressProgress(100);
      setIsPressingCorner(false);
      onRequestParentOpen();
    }, duration);
  };

  const cancelCornerPress = () => {
    setIsPressingCorner(false);
    setPressProgress(0);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Effective mood for the puppy:
  const effectiveMood: PuppyMood = isSpeaking
    ? 'talking'
    : speechDetected
    ? 'listening'
    : activeMusicTitle
    ? 'dancing'
    : puppyMood;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-gradient-to-b from-amber-100 via-rose-50 to-orange-100 flex flex-col items-center justify-center touch-manipulation">
      {/* Background Ambience: Soft floating pastel clouds & sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-10 left-8 w-28 h-12 bg-white/70 rounded-full blur-xs" />
        <div className="absolute top-24 right-10 w-36 h-14 bg-white/70 rounded-full blur-xs" />
        <div className="absolute bottom-20 left-12 w-44 h-16 bg-white/50 rounded-full blur-xs" />

        {/* Ambient subtle sparkles */}
        <div className="absolute top-1/4 left-1/5 text-amber-300 text-2xl animate-float-star">✨</div>
        <div className="absolute top-1/3 right-1/4 text-rose-300 text-2xl animate-float-star delay-300">⭐</div>
        <div className="absolute bottom-1/3 left-1/4 text-amber-300 text-xl animate-float-star delay-500">✨</div>
      </div>

      {/* Secret Parent Corner (Top-Right): Completely invisible to child, 3s long-press */}
      <div
        onMouseDown={startCornerPress}
        onMouseUp={cancelCornerPress}
        onMouseLeave={cancelCornerPress}
        onTouchStart={startCornerPress}
        onTouchEnd={cancelCornerPress}
        onTouchCancel={cancelCornerPress}
        className="absolute top-0 right-0 w-24 h-24 z-50 flex items-center justify-center cursor-pointer"
        title=""
      >
        {/* Subtle progress ring only appears while parent is holding finger down */}
        {isPressingCorner && (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="rgba(244, 63, 94, 0.2)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#F43F5E"
                strokeWidth="4"
                fill="none"
                strokeDasharray="113"
                strokeDashoffset={113 - (113 * pressProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Music Playing Floating Banner */}
      {activeMusicTitle && (
        <div className="absolute top-6 inset-x-4 flex justify-center z-40 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border-2 border-rose-300 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <span className="text-xl animate-bounce">🎵</span>
            <div>
              <p className="text-xs font-black text-slate-800">Đang phát: {activeMusicTitle}</p>
              <p className="text-[10px] text-slate-500 font-semibold">Bé có thể nói "Dừng nhạc" bất cứ lúc nào</p>
            </div>
            {onStopMusic && (
              <button
                onClick={onStopMusic}
                className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Center Stage: The Cute Animated Puppy Character */}
      <div className="relative flex flex-col items-center justify-center p-4">
        {/* Soft radial glow under puppy */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-200/50 to-rose-200/50 blur-2xl pointer-events-none" />

        {/* The Puppy Character - Size XL/2XL */}
        <PuppyAvatar
          name={puppyName}
          mood={effectiveMood}
          isSpeaking={isSpeaking}
          costume={puppyCostume}
          size="xl"
          showNameTag={false}
          onPet={onPetPuppy}
        />

        {/* Ambient listening ripple rings (visual only, no text) */}
        {speechDetected && (
          <div className="absolute -bottom-8 w-44 h-6 rounded-full bg-rose-400/30 blur-sm animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Floating Daily Vocabulary Coaching Card (Showcase when puppy prompts a word) */}
      {activeVocabPrompt && (
        <div className="absolute bottom-6 inset-x-4 sm:inset-x-auto sm:w-[420px] mx-auto z-40 pointer-events-auto animate-in fade-in slide-in-from-bottom-6">
          <div
            className={`rounded-3xl p-4 sm:p-5 shadow-2xl border-4 backdrop-blur-md transition-all ${
              activeVocabPrompt.isCorrect
                ? 'bg-emerald-50/95 border-emerald-400 text-emerald-950'
                : 'bg-white/95 border-amber-300 text-slate-800'
            }`}
          >
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Từ Vựng Tiếng Anh Của Ngày</span>
              </div>
              {onDismissVocabPrompt && (
                <button
                  onClick={onDismissVocabPrompt}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Word Display with Big Font & Phonetics */}
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {activeVocabPrompt.iconEmoji || '🍎'}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-wide">
                    {activeVocabPrompt.word}
                  </h3>

                  {onPlayVocabAudio && (
                    <button
                      onClick={() => onPlayVocabAudio(activeVocabPrompt.word)}
                      className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition shadow-xs"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}

                  {activeVocabPrompt.isCorrect && (
                    <span className="text-emerald-600 text-sm font-black flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Chuẩn 100%!</span>
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-amber-700">{activeVocabPrompt.phonetic}</p>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Nghĩa là: <span className="text-rose-600">{activeVocabPrompt.meaning}</span>
                </p>
              </div>
            </div>

            {/* Gentle Coaching / Relatable Example */}
            {activeVocabPrompt.gentleCoachTip && (
              <div className="mt-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <p>
                  <strong>Cún nắn chỉnh cho bé nè:</strong> {activeVocabPrompt.gentleCoachTip}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
