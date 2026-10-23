import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Star, Sparkles, X, Trophy } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import confetti from 'canvas-confetti';

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  phonetic: string;
  meaning: string;
  childName: string;
  puppyName: string;
  onPronounceSuccess: (score: number, stars: number, feedback: string) => void;
  onPlayWordAudio: (word: string) => void;
  isSpeakingAudio: boolean;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({
  isOpen,
  onClose,
  word,
  phonetic,
  meaning,
  childName,
  puppyName,
  onPronounceSuccess,
  onPlayWordAudio,
  isSpeakingAudio,
}) => {
  const { isListening, transcript, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();

  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    stars: number;
    feedback: string;
    phoneticTip: string;
    encouragement?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      resetTranscript();
    }
  }, [isOpen, word, resetTranscript]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setResult(null);
    resetTranscript();
    startListening('en-US'); // Recognize English pronunciation
  };

  const handleStopAndEvaluate = async () => {
    stopListening();
    const spoken = transcript.trim();
    if (!spoken) {
      setResult({
        score: 75,
        stars: 2,
        feedback: `Cún chưa nghe rõ tiếng bé nói rồi. Bé thử bấm mic rồi nói to từ "${word}" nhé!`,
        phoneticTip: `Bé phát âm to, tròn vành chữ "${word}" nha!`,
      });
      return;
    }

    setEvaluating(true);
    try {
      const res = await fetch('/api/gemini/evaluate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetWord: word,
          spokenText: spoken,
          childName,
          topic: 'Luyện phát âm tiếng Anh',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        onPronounceSuccess(data.score, data.stars, data.feedback);

        // Confetti celebration if 3 stars or score >= 85
        if (data.score >= 85) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2'],
          });
        }
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      // Fallback evaluation
      const isClose = spoken.toLowerCase().includes(word.toLowerCase());
      const fallbackScore = isClose ? 95 : 82;
      const fallbackStars = isClose ? 3 : 2;
      const fallbackData = {
        score: fallbackScore,
        stars: fallbackStars,
        feedback: `Gâu gâu! Bé ${childName} phát âm từ "${word}" siêu đáng yêu! Cún vẫy đuôi chúc mừng bé nè!`,
        phoneticTip: phonetic,
        encouragement: 'Bé tiếp tục phát huy nhé!',
      };
      setResult(fallbackData);
      onPronounceSuccess(fallbackScore, fallbackStars, fallbackData.feedback);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border-4 border-amber-300 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Luyện Phát Âm Chuẩn Xác Cùng Cún</span>
        </div>

        {/* Word Showcase */}
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-5 rounded-3xl border-2 border-rose-200 shadow-inner my-2">
          <h2 className="text-4xl font-black text-rose-600 tracking-wide mb-1">{word}</h2>
          <p className="text-sm font-semibold text-amber-700 mb-1">{phonetic}</p>
          <p className="text-xs text-slate-500 font-medium">Ý nghĩa: {meaning}</p>

          <button
            onClick={() => onPlayWordAudio(word)}
            disabled={isSpeakingAudio}
            className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-rose-600 font-bold text-xs shadow-sm hover:shadow active:scale-95 transition border border-rose-200"
          >
            <Volume2 className="w-4 h-4" />
            <span>Nghe mẫu chuẩn</span>
          </button>
        </div>

        {/* Recognition Status / Speech Bubble */}
        <div className="my-4 min-h-[50px] flex items-center justify-center">
          {isListening ? (
            <div className="flex flex-col items-center gap-1 text-rose-600 animate-pulse">
              <span className="text-sm font-bold">Cún đang lắng nghe bé nói... 🐾</span>
              <p className="text-xs text-slate-500 italic max-w-xs truncate">
                "{transcript || 'Bé đọc to lên nhé: ' + word}"
              </p>
            </div>
          ) : evaluating ? (
            <div className="flex items-center gap-2 text-amber-600">
              <span className="animate-spin text-lg">✨</span>
              <span className="text-sm font-bold">Cún đang chấm điểm phát âm cho bé...</span>
            </div>
          ) : transcript ? (
            <p className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700">
              Bé vừa nói: <strong className="text-slate-900">"{transcript}"</strong>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Chạm nút mic màu đỏ bên dưới rồi đọc to từ <strong>"{word}"</strong> nhé!
            </p>
          )}
        </div>

        {/* Big Mic Button */}
        <div className="flex justify-center mb-4">
          {!isListening ? (
            <button
              onClick={handleStartRecording}
              className="relative p-6 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xl hover:scale-105 active:scale-95 transition group"
            >
              <Mic className="w-8 h-8" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-extrabold text-slate-600">
                Bấm để đọc
              </span>
            </button>
          ) : (
            <button
              onClick={handleStopAndEvaluate}
              className="relative p-6 rounded-full bg-rose-600 text-white shadow-xl animate-pulse active:scale-95 transition"
            >
              <MicOff className="w-8 h-8" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-extrabold text-rose-600">
                Chạm để chấm điểm!
              </span>
            </button>
          )}
        </div>

        {/* Evaluation Results */}
        {result && (
          <div className="mt-7 pt-4 border-t border-slate-100 text-left bg-amber-50/70 p-4 rounded-2xl border border-amber-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-5 h-5 ${
                      starIdx <= result.stars
                        ? 'fill-amber-400 text-amber-400 animate-bounce'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-amber-300 text-amber-900 font-black text-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{result.score}/100 Điểm</span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-800 mb-1">{result.feedback}</p>
            <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-amber-100 leading-relaxed">
              💡 <strong>Mẹo của Cún:</strong> {result.phoneticTip}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl font-bold text-xs transition"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
