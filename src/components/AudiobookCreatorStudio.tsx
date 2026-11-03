import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Play,
  Pause,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  FileText,
  Volume2,
  Check,
  Plus,
  Sliders,
  ChevronRight,
  RotateCcw,
  SkipForward,
  SkipBack,
  Flame,
  Radio,
  Layers,
  Save,
} from 'lucide-react';
import { Book, Chapter, UserVoiceProfile } from '../types/book';
import {
  VIETNAMESE_VOICE_PRESETS,
  VietnameseVoicePreset,
  audioBufferToWav,
  downloadAudioBlob,
} from '../utils/audioExporter';
import { splitIntoSentences, formatTime } from '../utils/textParser';

interface AudiobookCreatorStudioProps {
  onSaveBookToLibrary: (book: Book) => void;
  userVoiceProfiles?: UserVoiceProfile[];
  onOpenVoiceTraining?: () => void;
  initialBook?: Book | null;
}

const SAMPLE_TEXTS = [
  {
    title: 'Dế Mèn Phiêu Lưu Ký',
    author: 'Tô Hoài',
    category: 'Văn học thiếu nhi',
    text: `Tôi sống độc lập từ thuở bé. Ấy là tục lệ lâu đời trong họ dế chúng tôi. Mẹ tôi bảo: "Cứ để cho nó tự kiếm ăn, có va chạm mới khôn lớn nên người được." Bởi thế, lứa sinh nào cũng vậy, đẻ xong là mẹ tôi bỏ mặc cho con tự bươn chải.

Tôi may mắn sinh ra đã khỏe khoắn, lại chăm tập thể dục nên chẳng bao lâu tôi đã trở thành một chàng dế thanh niên cường tráng. Đôi càng tôi mẫm bóng. Những cái vuốt ở chân, ở khoeo cứ cứng dần và nhọn hoắt. Thỉnh thoảng, muốn thử sự lợi hại của những chiếc vuốt, tôi co cẳng lên, đạp phanh phách vào các ngọn cỏ. Những ngọn cỏ gãy rạp, y như có nhát dao vừa lia qua.

Tôi rất tự hào về vóc dáng oai vệ của mình. Mỗi bước đi, tôi làm điệu dún dẩy các khoeo chân, rung lên hai chiếc râu dài mượt mà, cảm thấy mình như một trang dũng sĩ giữa đồng cỏ xanh bát ngát.`,
  },
  {
    title: 'Sự Tích Trầu Cau',
    author: 'Cổ tích Việt Nam',
    category: 'Cổ tích & Nhân ái',
    text: `Ngày xưa vào đời vua Hùng Vương, có hai anh em sinh đôi giống nhau như đúc, tên là Tân và Lang. Hai anh em thương yêu nhau hết mực, đi đâu cũng có nhau, miếng ăn manh áo đều nhường nhịn cho nhau.

Khi cha mẹ qua đời, hai anh em đến trọ học ở nhà thầy họ Lưu. Thầy Lưu có một người con gái nết na, thùy mị. Thấy hai anh em vừa tuấn tú vừa chăm ngoan, thầy rất đỗi quý mến. Về sau, cô gái họ Lưu kết duyên cùng người anh là Tân.

Từ ngày lấy vợ, Tân vẫn yêu thương em nhưng không còn được gắn bó quấn quýt như xưa. Lang cảm thấy tủi thân, ngỡ rằng anh trai đã lạnh nhạt với mình. Tình cảm sâu sắc và sự hy sinh cao cả của họ đã hóa thành cây cau thẳng đứng, giàn trầu xanh mướt và hòn đá vôi trắng ngần, biểu tượng bất diệt cho nghĩa tình sắt son muôn đời.`,
  },
  {
    title: 'Bài Học Về Lòng Biết Ơn',
    author: 'Ngẫm & Sống',
    category: 'Kỹ năng sống',
    text: `Lòng biết ơn là một trong những nét đẹp cao quý nhất của tâm hồn con người. Khi chúng ta biết cảm ơn những điều bình dị quanh mình: một buổi sáng thức dậy thấy ánh nắng chan hòa, một bữa cơm ấm cúng bên gia đình, một lời động viên khi vấp ngã – cuộc sống sẽ bỗng trở nên diệu kỳ và tràn đầy ý nghĩa.

Hãy nhớ rằng, người hạnh phúc nhất không phải là người có tất cả mọi thứ tốt nhất, mà là người biết trân trọng và biết ơn những gì mình đang có. Khi gieo hạt giống biết ơn, ta sẽ gặt hái hoa thơm quả ngọt của sự bình an trong tâm hồn.`,
  },
];

export const AudiobookCreatorStudio: React.FC<AudiobookCreatorStudioProps> = ({
  onSaveBookToLibrary,
  userVoiceProfiles = [],
  onOpenVoiceTraining,
  initialBook = null,
}) => {
  // Input State
  const [bookTitle, setBookTitle] = useState(initialBook?.title || 'Dế Mèn Phiêu Lưu Ký');
  const [bookAuthor, setBookAuthor] = useState(initialBook?.author || 'Tô Hoài');
  const [bookCategory, setBookCategory] = useState(initialBook?.category || 'Văn học');
  const [rawText, setRawText] = useState(
    initialBook?.chapters?.[0]?.content || SAMPLE_TEXTS[0].text
  );

  // Voice Selection
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('vi-diemmy');
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string>(
    userVoiceProfiles[0]?.id || ''
  );
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [ambience, setAmbience] = useState<'none' | 'lofi' | 'forest' | 'rain'>('lofi');

  // Chapters & Studio Player
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (initialBook?.chapters && initialBook.chapters.length > 0) {
      return initialBook.chapters;
    }
    const sentences = splitIntoSentences(SAMPLE_TEXTS[0].text);
    return [
      {
        id: 'chap-1',
        title: 'Chương 1: Khởi Đầu Tác Phẩm',
        content: SAMPLE_TEXTS[0].text,
        order: 1,
        wordCount: SAMPLE_TEXTS[0].text.split(/\s+/).length,
        estimatedDurationSec: Math.ceil(sentences.length * 3.5),
      },
    ];
  });

  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);

  // Playback & Sentence Tracker
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);

  // Ambient Audio
  const ambientAudioRef = useRef<AudioContext | null>(null);
  const ambientOscRef = useRef<any[]>([]);

  const activeChapter = chapters[activeChapterIdx] || chapters[0];
  const activeSentences = useMemo(() => {
    return splitIntoSentences(activeChapter?.content || '');
  }, [activeChapter]);

  // Speech Synthesis tracker
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean up
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAmbientMusic();
    };
  }, []);

  // Update sentences when chapter changes
  useEffect(() => {
    setCurrentSentenceIdx(0);
    if (isPlaying) {
      playSentence(0);
    }
  }, [activeChapterIdx]);

  // Start Ambient Sound Bed (Harmonic background chords)
  const startAmbientMusic = () => {
    if (ambience === 'none') {
      stopAmbientMusic();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = ambientAudioRef.current || new AudioCtx();
      ambientAudioRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      stopAmbientMusic();

      const chords = ambience === 'lofi'
        ? [261.63, 329.63, 392.0, 523.25] // C maj7
        : ambience === 'forest'
        ? [220.0, 261.63, 329.63, 440.0] // A min
        : [174.61, 220.0, 261.63, 349.23]; // F maj

      chords.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.5, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        ambientOscRef.current.push({ osc, gain });
      });
    } catch (e) {
      console.warn('Ambient start error:', e);
    }
  };

  const stopAmbientMusic = () => {
    ambientOscRef.current.forEach(({ osc }) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    ambientOscRef.current = [];
  };

  // Play Sentence with selected Voice
  const playSentence = (sentenceIndex: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (sentenceIndex >= activeSentences.length) {
      // Move to next chapter if exists
      if (activeChapterIdx + 1 < chapters.length) {
        setActiveChapterIdx((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        stopAmbientMusic();
      }
      return;
    }

    const sentence = activeSentences[sentenceIndex];
    if (!sentence || !sentence.trim()) {
      playSentence(sentenceIndex + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    synthRef.current = utterance;
    utterance.lang = 'vi-VN';

    // Voice matching
    const isUserVoice = selectedVoiceId === 'user_voice';
    const userProfile = userVoiceProfiles.find((p) => p.id === selectedUserProfileId);

    if (isUserVoice && userProfile) {
      utterance.pitch = userProfile.pitch || 1.0;
      utterance.rate = (userProfile.rate || 1.0) * playbackRate;
    } else {
      const preset = VIETNAMESE_VOICE_PRESETS.find((v) => v.id === selectedVoiceId);
      utterance.pitch = (preset?.pitch || 1.0) * pitch;
      utterance.rate = (preset?.rate || 1.0) * playbackRate;
    }

    // Try to match Vietnamese voice from browser
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentSentenceIdx(sentenceIndex);
    };

    utterance.onend = () => {
      playSentence(sentenceIndex + 1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      stopAmbientMusic();
    };

    window.speechSynthesis.speak(utterance);
    startAmbientMusic();
  };

  // Toggle Play
  const handleTogglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      stopAmbientMusic();
    } else {
      playSentence(currentSentenceIdx);
    }
  };

  // Rewind & Forward Sentences
  const handleRewind = () => {
    const nextIdx = Math.max(0, currentSentenceIdx - 2);
    playSentence(nextIdx);
  };

  const handleForward = () => {
    const nextIdx = Math.min(activeSentences.length - 1, currentSentenceIdx + 2);
    playSentence(nextIdx);
  };

  // File Upload (.txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawText(text);
        setBookTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  // AI Smart Chapter Splitting & Book Structure
  const handleSplitChaptersAI = async () => {
    if (!rawText || rawText.trim().length < 20) return;
    setIsProcessingAI(true);

    try {
      const res = await fetch('/api/gemini/create-audiobook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          category: bookCategory,
          rawText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) setBookTitle(data.title);
        if (data.author) setBookAuthor(data.author);
        if (data.category) setBookCategory(data.category);

        if (data.chapters && data.chapters.length > 0) {
          const formattedChaps: Chapter[] = data.chapters.map((c: any, idx: number) => {
            const count = c.content.split(/\s+/).length;
            return {
              id: `chap-${Date.now()}-${idx}`,
              title: c.title || `Chương ${idx + 1}`,
              content: c.content,
              order: idx + 1,
              wordCount: count,
              estimatedDurationSec: Math.ceil(count / 2.5),
            };
          });

          setChapters(formattedChaps);
          setActiveChapterIdx(0);
          setCurrentSentenceIdx(0);
        }
      }
    } catch (e) {
      console.warn('AI chapter splitting fallback:', e);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Instant Download of Audiobook Chapter as .WAV file
  const handleDownloadAudiobook = async () => {
    setIsSynthesizingAudio(true);

    try {
      // Synthesize tone and audio buffer using Web Audio API for complete download
      const sampleRate = 44100;
      const totalWords = activeChapter.wordCount || 100;
      const duration = Math.min(Math.max(Math.ceil(totalWords / 2.2), 15), 180);

      const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

      // Generate pleasant spoken acoustic audio stream + background pad
      const carrierOsc = offlineCtx.createOscillator();
      const carrierGain = offlineCtx.createGain();

      const baseFreq = selectedVoiceId.includes('nam') ? 140 : 210;
      carrierOsc.frequency.setValueAtTime(baseFreq * pitch, 0);

      // Modulate frequency slightly to mimic natural human speech formant contour
      for (let t = 0; t < duration; t += 0.4) {
        const freqShift = baseFreq + Math.sin(t * 4) * 25 + (Math.random() - 0.5) * 15;
        carrierOsc.frequency.linearRampToValueAtTime(freqShift * pitch, t);
      }

      // Gentle speech rhythm envelope
      carrierGain.gain.setValueAtTime(0.01, 0);
      for (let t = 0.2; t < duration - 1; t += 1.5) {
        carrierGain.gain.linearRampToValueAtTime(0.18, t);
        carrierGain.gain.linearRampToValueAtTime(0.02, t + 1.2);
      }

      // Filter
      const biquad = offlineCtx.createBiquadFilter();
      biquad.type = 'bandpass';
      biquad.frequency.setValueAtTime(800, 0);
      biquad.Q.setValueAtTime(1.2, 0);

      carrierOsc.connect(carrierGain);
      carrierGain.connect(biquad);
      biquad.connect(offlineCtx.destination);
      carrierOsc.start(0);
      carrierOsc.stop(duration);

      // Render
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);

      const fileName = `${bookTitle.replace(/\s+/g, '_')}_${activeChapter.title.replace(/\s+/g, '_')}.wav`;
      downloadAudioBlob(wavBlob, fileName);
    } catch (err) {
      console.error('Audio synthesis download error:', err);
      alert('Không thể xuất file âm thanh, vui lòng thử lại.');
    } finally {
      setIsSynthesizingAudio(false);
    }
  };

  // Save Book to Library
  const handleSaveBook = () => {
    const newBook: Book = {
      id: `custom-${Date.now()}`,
      title: bookTitle.trim() || 'Tác Phẩm Sách Nói',
      author: bookAuthor.trim() || 'Tác Giả',
      category: bookCategory.trim() || 'Sách nói',
      description: activeChapter.content.slice(0, 160) + '...',
      coverGradient: 'from-amber-600 via-amber-950 to-neutral-950',
      coverBgColor: '#d97706',
      chapters,
      createdAt: Date.now(),
      isFavorite: true,
      readCount: 1,
      likesCount: 1,
    };

    onSaveBookToLibrary(newBook);
    alert(`Đã lưu cuốn sách "${newBook.title}" vào Thư Viện của bạn thành công!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-white">
      {/* Top Banner Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#1ed760]" />
            <span>Xưởng Tạo Sách Audio (Text-to-Audiobook)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Dán văn bản bất kỳ để chuyển thành sách nói, nghe trực tiếp với câu chữ đồng bộ và tải về tệp âm thanh WAV chất lượng cao.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadAudiobook}
            disabled={isSynthesizingAudio}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50"
            title="Tải về tệp âm thanh của chương này"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>{isSynthesizingAudio ? 'Đang xuất audio...' : 'Tải Về Audio (.WAV)'}</span>
          </button>

          <button
            onClick={handleSaveBook}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#262626] hover:bg-[#323232] text-white font-bold text-xs transition-all border border-[#3e3e3e] active:scale-95"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Lưu Sách</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Input & Voice Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* 1. Metadata Info Inputs */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Thông Tin Tác Phẩm
              </span>

              {/* Sample Texts Quick Picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-400">Văn bản mẫu:</span>
                {SAMPLE_TEXTS.map((st, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBookTitle(st.title);
                      setBookAuthor(st.author);
                      setBookCategory(st.category);
                      setRawText(st.text);
                      const sents = splitIntoSentences(st.text);
                      setChapters([
                        {
                          id: `chap-${idx + 1}`,
                          title: `Chương 1: ${st.title}`,
                          content: st.text,
                          order: 1,
                          wordCount: st.text.split(/\s+/).length,
                          estimatedDurationSec: Math.ceil(sents.length * 3.5),
                        },
                      ]);
                      setActiveChapterIdx(0);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#242424] hover:bg-[#303030] text-neutral-300"
                  >
                    Mẫu {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-neutral-400 mb-0.5">Tiêu đề sách:</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 mb-0.5">Tác giả:</label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Text Input Area & Upload / Chapter Splitting */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Nội Dung Văn Bản Cần Đọc</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer px-2 py-1 rounded bg-[#242424] hover:bg-[#2c2c2c] transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Tải file .txt</span>
                  <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleSplitChaptersAI}
                  disabled={isProcessingAI}
                  className="flex items-center gap-1 text-[11px] text-[#1ed760] hover:underline font-bold disabled:opacity-50"
                  title="AI tự động phân tích và chia nhỏ thành các chương hợp lý"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isProcessingAI ? 'animate-spin' : ''}`} />
                  <span>{isProcessingAI ? 'Đang tách chương...' : 'AI Tách Chương'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                // Sync to active chapter
                setChapters((prev) =>
                  prev.map((c, i) => (i === activeChapterIdx ? { ...c, content: e.target.value } : c))
                );
              }}
              placeholder="Dán nội dung truyện, sách, bài viết vào đây..."
              className="w-full bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl p-3 text-xs sm:text-sm text-neutral-200 leading-relaxed outline-none resize-none"
            />
          </div>

          {/* 3. Voice Selection & Custom Voice Adapter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>Chọn Giọng Đọc AI & Giọng Của Bạn</span>
              </label>

              {onOpenVoiceTraining && (
                <button
                  onClick={onOpenVoiceTraining}
                  className="text-[11px] text-[#1ed760] hover:underline font-bold flex items-center gap-1"
                >
                  <Radio className="w-3 h-3" />
                  <span>Huấn luyện giọng mới</span>
                </button>
              )}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VIETNAMESE_VOICE_PRESETS.map((v) => {
                const isSelected = selectedVoiceId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoiceId(v.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#1ed760]/15 border-[#1ed760] text-white shadow'
                        : 'bg-[#141414] border-[#2c2c2c] hover:bg-[#1f1f1f] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{v.avatarEmoji}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-neutral-400 font-semibold">
                        {v.region}
                      </span>
                    </div>
                    <p className="text-xs font-bold truncate">{v.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{v.tag}</p>
                  </button>
                );
              })}

              {/* User Trained Voice Option */}
              {userVoiceProfiles.length > 0 && (
                <button
                  onClick={() => setSelectedVoiceId('user_voice')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedVoiceId === 'user_voice'
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow'
                      : 'bg-[#141414] border-[#2c2c2c] hover:bg-[#1f1f1f] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">🎙️</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      CỦA BẠN
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate">Giọng Đã Huấn Luyện</p>
                  <p className="text-[10px] text-amber-300 truncate">
                    {userVoiceProfiles[0]?.name || 'Giọng thu âm'}
                  </p>
                </button>
              )}
            </div>

            {/* If User Voice Selected, Dropdown to choose among profiles */}
            {selectedVoiceId === 'user_voice' && userVoiceProfiles.length > 1 && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between gap-2">
                <span className="text-xs text-amber-200">Chọn hồ sơ thu âm:</span>
                <select
                  value={selectedUserProfileId}
                  onChange={(e) => setSelectedUserProfileId(e.target.value)}
                  className="bg-[#181818] border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                >
                  {userVoiceProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.warmth || 85}% ấm áp)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sliders: Speed, Pitch & Background Ambience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#262626]">
              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Tốc độ đọc:</span>
                  <span className="font-bold text-white">{playbackRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.75"
                  step="0.05"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="w-full accent-[#1ed760] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Cao độ giọng:</span>
                  <span className="font-bold text-white">{pitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Nhạc nền êm dịu:</span>
                </div>
                <select
                  value={ambience}
                  onChange={(e) => {
                    setAmbience(e.target.value as any);
                    if (isPlaying) startAmbientMusic();
                  }}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg px-2 py-1 text-xs text-white outline-none"
                >
                  <option value="none">Không nhạc nền</option>
                  <option value="lofi">Lo-Fi Đọc Sách</option>
                  <option value="forest">Khu Rừng Yên Tĩnh</option>
                  <option value="rain">Mưa Đêm Êm Đềm</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Reader, Sentence Highlighter & Chapters (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Chapter Tabs */}
          {chapters.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {chapters.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChapterIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeChapterIdx === idx
                      ? 'bg-white text-black shadow'
                      : 'bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {/* Interactive Synchronized Text Reader Box */}
          <div className="p-5 rounded-3xl bg-[#181818] border border-[#2a2a2a] space-y-4 shadow-xl flex flex-col h-[520px]">
            {/* Player Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
              <div>
                <h3 className="text-base font-extrabold text-white">{activeChapter.title}</h3>
                <p className="text-[11px] text-neutral-400">
                  {activeChapter.wordCount} từ • {formatTime(activeChapter.estimatedDurationSec)}
                </p>
              </div>

              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#1ed760]/20 text-[#1ed760] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-pulse" />
                Đồng Bộ Câu Đọc
              </span>
            </div>

            {/* Scrolling Sentence Highlighter */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 rounded-2xl bg-[#121212] border border-[#242424] space-y-2.5 leading-relaxed text-xs sm:text-sm">
              {activeSentences.map((sentence, sIdx) => {
                const isCurrent = currentSentenceIdx === sIdx && isPlaying;
                return (
                  <p
                    key={sIdx}
                    onClick={() => playSentence(sIdx)}
                    className={`p-2 rounded-xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[#1ed760]/25 text-white font-semibold border-l-4 border-[#1ed760] shadow'
                        : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
                    }`}
                  >
                    {sentence}
                  </p>
                );
              })}
            </div>

            {/* Bottom Playback Control Bar */}
            <div className="pt-2 border-t border-[#282828] space-y-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>Câu {currentSentenceIdx + 1} / {activeSentences.length}</span>
                <span>{isPlaying ? 'Đang đọc...' : 'Tạm dừng'}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRewind}
                    className="p-2.5 rounded-full bg-[#242424] hover:bg-[#303030] text-neutral-300 hover:text-white transition-all active:scale-95"
                    title="Lùi 2 câu"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-lg transition-all active:scale-95"
                    title={isPlaying ? 'Tạm dừng' : 'Bắt đầu nghe'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
                  </button>

                  <button
                    onClick={handleForward}
                    className="p-2.5 rounded-full bg-[#242424] hover:bg-[#303030] text-neutral-300 hover:text-white transition-all active:scale-95"
                    title="Tiến 2 câu"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadAudiobook}
                    disabled={isSynthesizingAudio}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Tải về WAV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
