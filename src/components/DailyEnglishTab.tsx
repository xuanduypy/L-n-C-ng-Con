import React, { useState } from 'react';
import { EnglishWord, ChildProfile } from '../types';
import {
  Volume2,
  Sparkles,
  Star,
  CheckCircle2,
  Plus,
  Compass,
  Trophy,
  Search,
} from 'lucide-react';

interface DailyEnglishTabProps {
  words: EnglishWord[];
  childProfile: ChildProfile;
  onOpenPronounceModal: (word: string, phonetic: string, meaning: string) => void;
  onPlayWordAudio: (word: string) => void;
  onAskPuppyAboutWord: (word: string) => void;
  onAddNewCustomWord: (newWord: EnglishWord) => void;
  isSpeakingAudio: boolean;
}

export const DailyEnglishTab: React.FC<DailyEnglishTabProps> = ({
  words,
  childProfile,
  onOpenPronounceModal,
  onPlayWordAudio,
  onAskPuppyAboutWord,
  onAddNewCustomWord,
  isSpeakingAudio,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Daily spotlight word: pick the first unmastered word or first word
  const spotlightWord = words.find((w) => !w.mastered) || words[0];

  const categories = ['Tất cả', ...Array.from(new Set(words.map((w) => w.category)))];

  const filteredWords = words.filter((w) => {
    const matchCategory = selectedCategory === 'Tất cả' || w.category === selectedCategory;
    const matchSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const masteredCount = words.filter((w) => w.mastered).length;

  const handleGenerateWordForChild = async () => {
    setIsGeneratingWord(true);
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Hãy gợi ý cho bé ${childProfile.name} (${childProfile.age} tuổi) 1 từ vựng tiếng Anh mới lạ, vui nhộn và phù hợp với trẻ em.`,
          puppyName: childProfile.puppyName,
          childName: childProfile.name,
          mode: 'english',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.englishWord) {
          const newWord: EnglishWord = {
            id: `custom-${Date.now()}`,
            word: data.englishWord,
            phonetic: data.englishPhonetic || '/.../',
            vietnamese: data.vietnameseMeaning || 'Từ mới thú vị',
            category: 'Khám phá',
            exampleSentence: data.practicePrompt || `This is a ${data.englishWord}.`,
            exampleVietnamese: `Đây là ${data.vietnameseMeaning || data.englishWord}.`,
            iconEmoji: '✨',
            mastered: false,
          };
          onAddNewCustomWord(newWord);
        }
      }
    } catch (e) {
      console.warn('Failed to auto-generate word:', e);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-16 space-y-5">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
            Hành Trình Song Ngữ Nhí
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Tiếng Anh Hằng Ngày</h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Mỗi ngày 1 từ mới cùng chú cún {childProfile.puppyName}
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-xs p-3 rounded-2xl text-center border border-white/30 shrink-0">
          <div className="flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4 text-amber-200" />
            <span className="text-lg font-black">{masteredCount}/{words.length}</span>
          </div>
          <p className="text-[10px] text-white/90 font-bold">Từ thành thạo</p>
        </div>
      </div>

      {/* Today's Spotlight Word */}
      {spotlightWord && (
        <div className="bg-white rounded-3xl p-5 shadow-md border-3 border-amber-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 font-black text-[11px] px-3.5 py-1 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <span>⭐ Từ Của Ngày Hôm Nay</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl sm:text-5xl shadow-inner shrink-0 mx-auto sm:mx-0">
              {spotlightWord.iconEmoji}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-3xl font-black text-rose-600 tracking-wide">
                  {spotlightWord.word}
                </h3>
                <button
                  onClick={() => onPlayWordAudio(spotlightWord.word)}
                  disabled={isSpeakingAudio}
                  className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-xs"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs font-bold text-amber-700 mt-0.5">{spotlightWord.phonetic}</p>
              <p className="text-sm font-extrabold text-slate-800 mt-1">
                Nghĩa là: <span className="text-rose-500">{spotlightWord.vietnamese}</span>
              </p>

              <p className="text-xs text-slate-500 italic mt-1.5 bg-slate-50 p-2 rounded-xl">
                "{spotlightWord.exampleSentence}" ({spotlightWord.exampleVietnamese})
              </p>
            </div>
          </div>

          {/* Action Buttons for Spotlight */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                onOpenPronounceModal(
                  spotlightWord.word,
                  spotlightWord.phonetic,
                  spotlightWord.vietnamese
                )
              }
              className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white py-2.5 px-4 rounded-2xl font-black text-xs shadow-md shadow-rose-200 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Luyện Phát Âm Với Cún (AI Chấm Điểm)</span>
            </button>

            <button
              onClick={() => onAskPuppyAboutWord(spotlightWord.word)}
              className="flex items-center justify-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 py-2.5 px-4 rounded-2xl font-bold text-xs active:scale-95 transition"
            >
              <Compass className="w-4 h-4" />
              <span>Hỏi Cún Về Từ Này</span>
            </button>
          </div>
        </div>
      )}

      {/* Vocabulary Categories & Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-800">Kho Từ Vựng Của Bé</h3>
          <button
            onClick={handleGenerateWordForChild}
            disabled={isGeneratingWord}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isGeneratingWord ? 'Đang tạo...' : 'Thêm từ mới'}</span>
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Words Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredWords.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-3.5 border-2 transition shadow-xs hover:shadow-md flex items-center justify-between gap-3 ${
                item.mastered ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl shrink-0 p-2 bg-amber-50 rounded-xl">
                  {item.iconEmoji}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-slate-800">{item.word}</span>
                    {item.mastered && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-amber-700 font-semibold">{item.phonetic}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{item.vietnamese}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => onPlayWordAudio(item.word)}
                  disabled={isSpeakingAudio}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    onOpenPronounceModal(item.word, item.phonetic, item.vietnamese)
                  }
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition font-bold text-[10px] flex items-center gap-1"
                  title="Luyện đọc"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đọc</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
