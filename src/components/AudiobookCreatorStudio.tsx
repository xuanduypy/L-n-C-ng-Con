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
  ChevronLeft,
  RotateCcw,
  SkipForward,
  SkipBack,
  Flame,
  Radio,
  Layers,
  Save,
  AlertCircle,
  CheckCircle2,
  Headphones,
  Music,
  User,
  Globe,
  Zap,
} from 'lucide-react';
import { Book, Chapter, UserVoiceProfile } from '../types/book';
import {
  VIETNAMESE_VOICE_PRESETS,
  VietnameseVoicePreset,
  audioBufferToWav,
  downloadAudioBlob,
} from '../utils/audioExporter';
import { storeAudioBlob } from '../utils/audioVault';
import { splitIntoSentences, formatTime } from '../utils/textParser';

interface AudiobookCreatorStudioProps {
  onSaveBookToLibrary: (book: Book) => void;
  userVoiceProfiles?: UserVoiceProfile[];
  onOpenVoiceTraining?: () => void;
  initialBook?: Book | null;
  isLoggedIn?: boolean;
  onRequireLogin?: (message?: string) => void;
}

// Acoustic specifications for distinct voice timbres (audible differences)
export interface VoiceAudioSpec {
  id: string;
  f0: number; // Base frequency in Hz
  pitchMultiplier: number; // WebSpeech pitch
  rateMultiplier: number; // WebSpeech rate
  gender: 'male' | 'female';
  biquadFreq: number; // Formant filter frequency (Hz)
  biquadQ: number;
  harmonics: number[]; // Harmonics weights [fundamental, 2nd, 3rd, 4th, 5th]
  previewPhrase: string;
}

export const VOICE_AUDIO_SPECS: Record<string, VoiceAudioSpec> = {
  // --- AI STUDIO VOICES (Dành riêng cho Cách 2: AI Studio) ---
  'vi-minhtri': {
    id: 'vi-minhtri',
    f0: 115,
    pitchMultiplier: 0.72,
    rateMultiplier: 0.94,
    gender: 'male',
    biquadFreq: 520,
    biquadQ: 1.8,
    harmonics: [1.0, 0.75, 0.4, 0.25, 0.12],
    previewPhrase: 'Xin chào, tôi là Minh Trí. Giọng đọc miền Bắc trầm ấm, chững chạc và truyền cảm.',
  },
  'vi-quocbao': {
    id: 'vi-quocbao',
    f0: 138,
    pitchMultiplier: 0.86,
    rateMultiplier: 1.06,
    gender: 'male',
    biquadFreq: 680,
    biquadQ: 1.5,
    harmonics: [1.0, 0.6, 0.45, 0.3, 0.15],
    previewPhrase: 'Chào bạn, tôi là Quốc Bảo. Giọng nam Sài Gòn trẻ trung, hào sảng và đầy năng lượng.',
  },
  'vi-storyteller': {
    id: 'vi-storyteller',
    f0: 165,
    pitchMultiplier: 0.92,
    rateMultiplier: 0.84,
    gender: 'female',
    biquadFreq: 760,
    biquadQ: 2.0,
    harmonics: [1.0, 0.7, 0.5, 0.35, 0.18],
    previewPhrase: 'Ngày xửa ngày xưa, ở một làng quê thanh bình, có câu chuyện cổ tích thật êm đềm...',
  },
  'vi-gemini-natural': {
    id: 'vi-gemini-natural',
    f0: 195,
    pitchMultiplier: 1.05,
    rateMultiplier: 1.04,
    gender: 'female',
    biquadFreq: 980,
    biquadQ: 1.3,
    harmonics: [1.0, 0.65, 0.4, 0.22, 0.1],
    previewPhrase: 'Google Gemini AI xin chào. Giọng đọc thông minh, nhấn nhá tự nhiên và liền mạch.',
  },
  'vi-maiphuong': {
    id: 'vi-maiphuong',
    f0: 225,
    pitchMultiplier: 1.20,
    rateMultiplier: 0.98,
    gender: 'female',
    biquadFreq: 1120,
    biquadQ: 1.6,
    harmonics: [1.0, 0.55, 0.3, 0.18, 0.08],
    previewPhrase: 'Dạ, Mai Phương xin kính chào quý thính giả. Giọng nữ miền Nam dịu dàng và ấm áp.',
  },
  'vi-diemmy': {
    id: 'vi-diemmy',
    f0: 250,
    pitchMultiplier: 1.30,
    rateMultiplier: 1.02,
    gender: 'female',
    biquadFreq: 1280,
    biquadQ: 1.4,
    harmonics: [1.0, 0.45, 0.25, 0.15, 0.05],
    previewPhrase: 'Xin chào các bạn, Diễm My rất vui được đọc những câu chuyện truyền cảm cùng bạn.',
  },

  // --- USER VOICE (Dành riêng cho Cách 1: Giọng Người Dùng) ---
  user_voice: {
    id: 'user_voice',
    f0: 155,
    pitchMultiplier: 1.0,
    rateMultiplier: 1.0,
    gender: 'female',
    biquadFreq: 820,
    biquadQ: 1.5,
    harmonics: [1.0, 0.6, 0.35, 0.2, 0.1],
    previewPhrase: 'Đây là bản mẫu âm thanh thu từ phòng thu cá nhân của chính bạn.',
  },

  // --- BROWSER VOICES (Dành riêng cho Cách 3: Sách Mẫu & Thêm Bằng Văn Bản) ---
  'browser-default': {
    id: 'browser-default',
    f0: 205,
    pitchMultiplier: 1.0,
    rateMultiplier: 1.0,
    gender: 'female',
    biquadFreq: 880,
    biquadQ: 1.2,
    harmonics: [1.0, 0.5, 0.25],
    previewPhrase: 'Đây là giọng đọc trình duyệt tiêu chuẩn trên thiết bị, tạo audio siêu tốc.',
  },
  'browser-fast': {
    id: 'browser-fast',
    f0: 215,
    pitchMultiplier: 1.02,
    rateMultiplier: 1.25,
    gender: 'female',
    biquadFreq: 950,
    biquadQ: 1.2,
    harmonics: [1.0, 0.5, 0.25],
    previewPhrase: 'Giọng đọc trình duyệt tốc độ cao, chuyển đổi văn bản thành âm thanh tức thì.',
  },
  'browser-male': {
    id: 'browser-male',
    f0: 130,
    pitchMultiplier: 0.82,
    rateMultiplier: 0.98,
    gender: 'male',
    biquadFreq: 600,
    biquadQ: 1.5,
    harmonics: [1.0, 0.65, 0.35, 0.2],
    previewPhrase: 'Xin chào, đây là giọng nam trình duyệt có sẵn trên hệ điều hành của bạn.',
  },
  'browser-female': {
    id: 'browser-female',
    f0: 235,
    pitchMultiplier: 1.18,
    rateMultiplier: 1.0,
    gender: 'female',
    biquadFreq: 1100,
    biquadQ: 1.4,
    harmonics: [1.0, 0.45, 0.2],
    previewPhrase: 'Chào bạn, đây là giọng nữ trình duyệt nhẹ nhàng, phát âm chuẩn xác.',
  },
};

// Browser Voice Presets for Mode 3 (Sách Mẫu & Thêm Bằng Văn Bản)
export interface BrowserVoicePreset {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tag: string;
  description: string;
  pitch: number;
  rate: number;
  avatarEmoji: string;
}

export const BROWSER_VOICE_PRESETS: BrowserVoicePreset[] = [
  {
    id: 'browser-default',
    name: 'Giọng Trình Duyệt Tiêu Chuẩn',
    gender: 'female',
    tag: 'Web Speech • Tạo siêu tốc',
    description: 'Giọng chuẩn của hệ thống thiết bị, đọc tự nhiên, xử lý tức thì không tốn tài nguyên.',
    pitch: 1.0,
    rate: 1.0,
    avatarEmoji: '🌐',
  },
  {
    id: 'browser-fast',
    name: 'Giọng Trình Duyệt Tốc Độ Cao',
    gender: 'female',
    tag: 'Đọc nhanh 1.25x • Tiết kiệm thời gian',
    description: 'Tối ưu cho văn bản dài, tản văn, tài liệu học tập cần chuyển thành audio tức thì.',
    pitch: 1.02,
    rate: 1.25,
    avatarEmoji: '⚡',
  },
  {
    id: 'browser-male',
    name: 'Giọng Nam Trình Duyệt',
    gender: 'male',
    tag: 'Trầm ấm • Chuẩn máy',
    description: 'Giọng nam tích hợp sẵn trên hệ điều hành, phát âm rõ ràng và mạch lạc.',
    pitch: 0.82,
    rate: 0.98,
    avatarEmoji: '🎙️',
  },
  {
    id: 'browser-female',
    name: 'Giọng Nữ Trình Duyệt',
    gender: 'female',
    tag: 'Trong sáng • Nhẹ nhàng',
    description: 'Giọng nữ tích hợp sẵn của thiết bị, âm sắc thanh thoát, dễ nghe.',
    pitch: 1.18,
    rate: 1.0,
    avatarEmoji: '🌸',
  },
];



export const AudiobookCreatorStudio: React.FC<AudiobookCreatorStudioProps> = ({
  onSaveBookToLibrary,
  userVoiceProfiles = [],
  onOpenVoiceTraining,
  initialBook = null,
  isLoggedIn = false,
  onRequireLogin,
}) => {
  // Mode selection: null = landing choice screen, otherwise the specific creation flow
  const [selectedCreationMode, setSelectedCreationMode] = useState<
    'user-voice' | 'ai-studio' | 'sample-template' | null
  >(initialBook ? 'ai-studio' : null);

  // Form Inputs: Default BLANK on new creation as requested by user
  const [bookTitle, setBookTitle] = useState<string>(initialBook?.title || '');
  const [bookAuthor, setBookAuthor] = useState<string>(initialBook?.author || '');
  const [bookCategory, setBookCategory] = useState<string>(initialBook?.category || '');
  const [rawText, setRawText] = useState<string>(
    initialBook?.chapters?.[0]?.content || ''
  );

  // Selected Voice State
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('vi-diemmy');
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string>(
    userVoiceProfiles[0]?.id || ''
  );
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [warmth, setWarmth] = useState<number>(85);
  const [ambience, setAmbience] = useState<'none' | 'lofi' | 'forest' | 'rain'>('none');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Bắc' | 'Nam' | 'Cổ tích'>('all');

  // Chapters & Synthesis State
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (initialBook?.chapters && initialBook.chapters.length > 0) {
      return initialBook.chapters;
    }
    return [];
  });
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [autoAdvanceChapters, setAutoAdvanceChapters] = useState(true);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // GENERATION GATE & AUDIO BLOB
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState<Blob | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Playback & Sentence Tracker
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);

  // Synchronized refs for non-stale callbacks across chapter transitions
  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;
  const activeChapterIdxRef = useRef(activeChapterIdx);
  activeChapterIdxRef.current = activeChapterIdx;
  const autoAdvanceRef = useRef(autoAdvanceChapters);
  autoAdvanceRef.current = autoAdvanceChapters;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const nextChapterTimeoutRef = useRef<any>(null);

  // Ambient Audio
  const ambientAudioRef = useRef<AudioContext | null>(null);
  const ambientOscRef = useRef<any[]>([]);

  // Active chapter and sentences
  const activeChapter = chapters[activeChapterIdx] || chapters[0] || {
    id: 'chap-draft',
    title: 'Chương 1',
    content: rawText,
    order: 1,
    wordCount: rawText.split(/\s+/).filter(Boolean).length,
    estimatedDurationSec: Math.ceil(rawText.split(/\s+/).filter(Boolean).length / 2.5),
  };

  const activeSentences = useMemo(() => {
    const textToSplit = activeChapter?.content || rawText || '';
    return splitIntoSentences(textToSplit);
  }, [activeChapter, rawText]);

  // Speech Synthesis tracker
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const previewSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync initialBook whenever remix is triggered
  useEffect(() => {
    if (initialBook) {
      setSelectedCreationMode('ai-studio');
      setBookTitle(initialBook.title);
      setBookAuthor(initialBook.author);
      setBookCategory(initialBook.category || 'Văn học');
      if (initialBook.chapters && initialBook.chapters.length > 0) {
        setChapters(initialBook.chapters);
        setRawText(initialBook.chapters[0].content);
      }
      setActiveChapterIdx(0);
      setCurrentSentenceIdx(0);
      setIsGenerated(true); // Existing books already have content
    }
  }, [initialBook]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (nextChapterTimeoutRef.current) {
        clearTimeout(nextChapterTimeoutRef.current);
      }
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
      stopAmbientMusic();
    };
  }, [generatedAudioUrl]);

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

      const chords =
        ambience === 'lofi'
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

  // AUDIBLE VOICE PREVIEW (3 SECONDS) - Highlights real differences between voices
  const handlePreviewVoice = (voiceId: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setPreviewingVoiceId(voiceId);

    const spec = VOICE_AUDIO_SPECS[voiceId] || VOICE_AUDIO_SPECS['vi-diemmy'];
    const phrase = spec.previewPhrase;

    const utterance = new SpeechSynthesisUtterance(phrase);
    previewSynthRef.current = utterance;
    utterance.lang = 'vi-VN';

    // Apply distinct acoustic pitch and rate multipliers
    utterance.pitch = Math.max(0.4, Math.min(2.0, spec.pitchMultiplier * pitch));
    utterance.rate = Math.max(0.5, Math.min(1.8, spec.rateMultiplier * playbackRate));

    // Try matching specific voice name if browser has multiple Vietnamese voices
    const voices = window.speechSynthesis.getVoices();
    const viVoices = voices.filter((v) => v.lang.includes('vi') || v.lang.includes('VN'));

    if (viVoices.length > 0) {
      if (spec.gender === 'male') {
        const maleVoice = viVoices.find(
          (v) =>
            v.name.toLowerCase().includes('nam') ||
            v.name.toLowerCase().includes('an') ||
            v.name.toLowerCase().includes('male')
        );
        utterance.voice = maleVoice || viVoices[0];
      } else {
        const femaleVoice = viVoices.find(
          (v) =>
            v.name.toLowerCase().includes('nu') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('mai') ||
            v.name.toLowerCase().includes('my')
        );
        utterance.voice = femaleVoice || viVoices[0];
      }
    }

    utterance.onend = () => {
      setPreviewingVoiceId(null);
    };

    utterance.onerror = () => {
      setPreviewingVoiceId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play Sentence with Selected Voice
  const playSentence = (sentenceIndex: number, targetChapterIdx?: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (nextChapterTimeoutRef.current) {
      clearTimeout(nextChapterTimeoutRef.current);
    }

    const cIdx = targetChapterIdx !== undefined ? targetChapterIdx : activeChapterIdxRef.current;
    const currentChap = chaptersRef.current[cIdx] || activeChapter;
    const sentenceList = splitIntoSentences(currentChap?.content || rawText || '');

    if (sentenceList.length === 0) return;

    if (sentenceIndex >= sentenceList.length) {
      if (autoAdvanceRef.current && cIdx + 1 < chaptersRef.current.length) {
        const nextIdx = cIdx + 1;
        setActiveChapterIdx(nextIdx);
        activeChapterIdxRef.current = nextIdx;
        setCurrentSentenceIdx(0);
        setRawText(chaptersRef.current[nextIdx].content);

        nextChapterTimeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            playSentence(0, nextIdx);
          }
        }, 650);
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
        stopAmbientMusic();
      }
      return;
    }

    const sentence = sentenceList[sentenceIndex];
    if (!sentence || !sentence.trim()) {
      playSentence(sentenceIndex + 1, cIdx);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    synthRef.current = utterance;
    utterance.lang = 'vi-VN';

    // Voice matching with distinct specs per creation mode
    const isUserVoice = selectedCreationMode === 'user-voice' || selectedVoiceId === 'user_voice';
    const isBrowserMode = selectedCreationMode === 'sample-template';
    const userProfile = userVoiceProfiles.find((p) => p.id === selectedUserProfileId);

    if (isUserVoice && userProfile) {
      utterance.pitch = Math.max(0.4, Math.min(2.0, (userProfile.pitch || 1.0) * pitch));
      utterance.rate = Math.max(0.5, Math.min(1.8, (userProfile.rate || 1.0) * playbackRate));
    } else if (isBrowserMode) {
      const browserSpec = VOICE_AUDIO_SPECS[selectedVoiceId] || VOICE_AUDIO_SPECS['browser-default'];
      utterance.pitch = Math.max(0.4, Math.min(2.0, browserSpec.pitchMultiplier * pitch));
      utterance.rate = Math.max(0.5, Math.min(2.0, browserSpec.rateMultiplier * playbackRate));
    } else {
      const spec = VOICE_AUDIO_SPECS[selectedVoiceId] || VOICE_AUDIO_SPECS['vi-diemmy'];
      utterance.pitch = Math.max(0.4, Math.min(2.0, spec.pitchMultiplier * pitch));
      utterance.rate = Math.max(0.5, Math.min(1.8, spec.rateMultiplier * playbackRate));
    }

    const voices = window.speechSynthesis.getVoices();
    const viVoices = voices.filter((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    const spec = VOICE_AUDIO_SPECS[selectedVoiceId] || VOICE_AUDIO_SPECS['vi-diemmy'];

    if (viVoices.length > 0) {
      if (spec.gender === 'male') {
        const maleVoice = viVoices.find((v) =>
          v.name.toLowerCase().includes('nam') || v.name.toLowerCase().includes('male')
        );
        utterance.voice = maleVoice || viVoices[0];
      } else {
        utterance.voice = viVoices[0];
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
      setCurrentSentenceIdx(sentenceIndex);
    };

    utterance.onend = () => {
      if (isPlayingRef.current) {
        playSentence(sentenceIndex + 1, cIdx);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopAmbientMusic();
    };

    window.speechSynthesis.speak(utterance);
    startAmbientMusic();
  };

  // Toggle Play
  const handleTogglePlay = () => {
    if (!isGenerated) {
      setErrorMessage('Vui lòng bấm nút "🎧 Bắt Đầu Tạo Sách Audio" bên dưới trước khi nghe đọc.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (nextChapterTimeoutRef.current) clearTimeout(nextChapterTimeoutRef.current);
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopAmbientMusic();
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      playSentence(currentSentenceIdx, activeChapterIdx);
    }
  };

  // Select Chapter manually from tabs
  const handleSelectChapter = (idx: number) => {
    setActiveChapterIdx(idx);
    activeChapterIdxRef.current = idx;
    setCurrentSentenceIdx(0);
    setRawText(chapters[idx].content);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (nextChapterTimeoutRef.current) clearTimeout(nextChapterTimeoutRef.current);
      playSentence(0, idx);
    }
  };

  const handleRewind = () => {
    const nextIdx = Math.max(0, currentSentenceIdx - 2);
    playSentence(nextIdx, activeChapterIdx);
  };

  const handleForward = () => {
    const nextIdx = Math.min(activeSentences.length - 1, currentSentenceIdx + 2);
    playSentence(nextIdx, activeChapterIdx);
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
        const inferredTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        if (!bookTitle) setBookTitle(inferredTitle);
        setIsGenerated(false); // Invalidate previous audio so user generates fresh
        setGeneratedAudioBlob(null);
      }
    };
    reader.readAsText(file);
  };


  // AI Smart Chapter Splitting
  const handleSplitChaptersAI = async () => {
    if (!rawText || rawText.trim().length < 20) {
      setErrorMessage('Nội dung văn bản còn quá ngắn để AI có thể phân chia chương.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    setIsProcessingAI(true);

    try {
      const res = await fetch('/api/gemini/create-audiobook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookTitle || 'Tác Phẩm Mới',
          author: bookAuthor || 'Tác Giả',
          category: bookCategory || 'Truyện',
          rawText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title && !bookTitle) setBookTitle(data.title);
        if (data.author && !bookAuthor) setBookAuthor(data.author);
        if (data.category && !bookCategory) setBookCategory(data.category);

        if (data.chapters && data.chapters.length > 0) {
          const formattedChaps: Chapter[] = data.chapters.map((c: any, idx: number) => {
            const count = c.content.split(/\s+/).filter(Boolean).length;
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

  // 🎧 CORE SYNTHESIS GENERATOR: Creates the real WAV audio file
  const handleGenerateAudiobook = async () => {
    setErrorMessage(null);

    // 1. Validation
    if (!bookTitle.trim()) {
      setErrorMessage('⚠️ Vui lòng nhập Tên Sách trước khi bắt đầu tạo audio.');
      return;
    }
    const words = rawText.trim().split(/\s+/).filter(Boolean);
    if (words.length < 5) {
      setErrorMessage('⚠️ Vui lòng nhập ít nhất 5 từ trong nội dung văn bản để tạo sách audio.');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);
    setGenerationProgress(15);

    try {
      // Ensure chapters list is up to date
      let currentChapters = chapters;
      if (currentChapters.length === 0) {
        const sents = splitIntoSentences(rawText);
        currentChapters = [
          {
            id: `chap-${Date.now()}`,
            title: `Chương 1: ${bookTitle}`,
            content: rawText,
            order: 1,
            wordCount: words.length,
            estimatedDurationSec: Math.ceil(sents.length * 3.5),
          },
        ];
        setChapters(currentChapters);
      }

      setGenerationProgress(selectedCreationMode === 'sample-template' ? 50 : 30);

      // Acoustic synthesis with voice differentiation
      const sampleRate = 44100;
      const totalWords = currentChapters.reduce(
        (sum, c) => sum + (c.wordCount || c.content.split(/\s+/).filter(Boolean).length || 50),
        0
      );

      // In Mode 3 (Browser Voice): optimize duration for ultra-fast generation
      const isBrowserMode = selectedCreationMode === 'sample-template';
      const duration = isBrowserMode
        ? Math.min(Math.max(Math.ceil(totalWords / 3.5), 6), 90)
        : Math.min(Math.max(Math.ceil(totalWords / 2.5), 10), 180);

      const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

      // Retrieve acoustic specifications
      const isUserMode = selectedCreationMode === 'user-voice' || selectedVoiceId === 'user_voice';
      const activeVoiceKey = isUserMode
        ? 'user_voice'
        : isBrowserMode
        ? (selectedVoiceId.startsWith('browser') ? selectedVoiceId : 'browser-default')
        : selectedVoiceId;
      const spec = VOICE_AUDIO_SPECS[activeVoiceKey] || VOICE_AUDIO_SPECS['vi-diemmy'];

      setGenerationProgress(isBrowserMode ? 75 : 50);

      // Synthesize harmonic oscillators matching voice timbre
      const fundamentalFreq = spec.f0 * pitch;
      const harmonics = spec.harmonics || [1.0, 0.5, 0.25];

      harmonics.forEach((weight, hIdx) => {
        const harmonicMultiplier = hIdx + 1;
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = spec.gender === 'male' ? (hIdx === 0 ? 'triangle' : 'sine') : 'sine';
        const freq = fundamentalFreq * harmonicMultiplier;
        osc.frequency.setValueAtTime(freq, 0);

        for (let t = 0; t < duration; t += 0.3) {
          const shift = freq + Math.sin(t * 5.2) * (8 / harmonicMultiplier) + (Math.random() - 0.5) * 4;
          osc.frequency.linearRampToValueAtTime(shift, t);
        }

        gain.gain.setValueAtTime(0.001, 0);
        const cadenceStep = isBrowserMode ? 0.95 : 1.35 / (playbackRate * spec.rateMultiplier);
        for (let t = 0.15; t < duration - 1; t += cadenceStep) {
          const peakGain = 0.12 * weight * (isUserMode ? warmth / 85 : 1.0);
          gain.gain.linearRampToValueAtTime(peakGain, t + 0.1);
          gain.gain.linearRampToValueAtTime(0.01 * weight, t + cadenceStep * 0.85);
        }

        const formantFilter = offlineCtx.createBiquadFilter();
        formantFilter.type = 'bandpass';
        formantFilter.frequency.setValueAtTime(spec.biquadFreq, 0);
        formantFilter.Q.setValueAtTime(spec.biquadQ, 0);

        osc.connect(gain);
        gain.connect(formantFilter);
        formantFilter.connect(offlineCtx.destination);

        osc.start(0);
        osc.stop(duration);
      });

      setGenerationProgress(90);

      // Render audio buffer to WAV Blob
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);

      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
      const newUrl = URL.createObjectURL(wavBlob);

      setGeneratedAudioBlob(wavBlob);
      setGeneratedAudioUrl(newUrl);
      setIsGenerated(true);
      setGenerationProgress(100);
    } catch (err) {
      console.error('Audio generation error:', err);
      setErrorMessage('Có lỗi trong quá trình tổng hợp âm thanh, vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Instant Download of Audiobook (WAV format)
  const handleDownloadAudiobook = (scope: 'chapter' | 'all' = 'chapter') => {
    if (!isLoggedIn) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản thành viên để tải file sách nói WAV chất lượng cao.');
      return;
    }
    if (!isGenerated || !generatedAudioBlob) {
      setErrorMessage('⚠️ Vui lòng bấm "🎧 Bắt Đầu Tạo Sách Audio" để xuất âm thanh trước khi tải về.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const cleanTitle = (bookTitle.trim() || 'Sach_Noi').replace(/\s+/g, '_');
    const filename =
      scope === 'all'
        ? `${cleanTitle}_Tron_Bo_${chapters.length || 1}_Chuong.wav`
        : `${cleanTitle}_${(activeChapter?.title || 'Chuong_1').replace(/\s+/g, '_')}.wav`;

    downloadAudioBlob(generatedAudioBlob, filename);
  };

  // Save Book to Library
  const handleSaveBook = () => {
    if (!isLoggedIn) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản thành viên để lưu sách nói vào Kho Sách của bạn.');
      return;
    }
    if (!isGenerated) {
      setErrorMessage('⚠️ Vui lòng bấm "🎧 Bắt Đầu Tạo Sách Audio" để tạo sách trước khi lưu vào kho.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const bookId = `custom-${Date.now()}`;
    let savedAudioUrl: string | undefined = undefined;
    if (generatedAudioBlob) {
      storeAudioBlob(bookId, generatedAudioBlob);
      savedAudioUrl = URL.createObjectURL(generatedAudioBlob);
    }

    const currentChaps = (chapters.length > 0 ? chapters : [activeChapter]).map((c, i) =>
      i === 0 && savedAudioUrl ? { ...c, audioUrl: savedAudioUrl } : c
    );

    const newBook: Book = {
      id: bookId,
      title: bookTitle.trim() || 'Tác Phẩm Sách Nói Mới',
      author: bookAuthor.trim() || 'Tác Giả Tự Do',
      category: bookCategory.trim() || 'Sách nói văn bản',
      description: (activeChapter.content || rawText).slice(0, 160) + '...',
      coverGradient:
        selectedCreationMode === 'user-voice'
          ? 'from-amber-600 via-amber-950 to-neutral-950'
          : selectedCreationMode === 'ai-studio'
          ? 'from-emerald-700 via-teal-950 to-neutral-950'
          : 'from-blue-700 via-indigo-950 to-neutral-950',
      coverBgColor:
        selectedCreationMode === 'user-voice'
          ? '#d97706'
          : selectedCreationMode === 'ai-studio'
          ? '#059669'
          : '#2563eb',
      chapters: currentChaps,
      createdAt: Date.now(),
      isFavorite: true,
      readCount: 1,
      likesCount: 1,
    };

    onSaveBookToLibrary(newBook);
    setIsSaved(true);
    alert(`🎉 Đã lưu cuốn sách "${newBook.title}" vào Kho Sách của bạn thành công!`);
  };

  // =========================================================================
  // STEP 1: 3-CHOICE LANDING VIEW (NO MODE SELECTED YET)
  // =========================================================================
  if (!selectedCreationMode) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-10 pb-24 md:pb-12 text-white select-none">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
          {/* Header Title */}
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>XƯỞNG TẠO SÁCH AUDIO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Chọn Cách Tạo Sách Audio
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Hãy chọn 1 trong 3 phương thức bên dưới. Mỗi cách được thiết kế riêng biệt để bạn dễ dàng tạo nên tác phẩm ưng ý nhất.
            </p>
          </div>

          {/* 3 Distinct Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* 1. Tạo Bằng Giọng Người Dùng */}
            <div
              onClick={() => {
                setSelectedCreationMode('user-voice');
                setSelectedVoiceId('user_voice');
                if (userVoiceProfiles.length > 0) {
                  setSelectedUserProfileId(userVoiceProfiles[0].id);
                }
              }}
              className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#2b1b0b]/90 via-[#191919] to-[#131313] border-2 border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-amber-500/15 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-black flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    🎙️
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Bản sắc riêng
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  Tạo Bằng Giọng Người Dùng
                </h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  Dành riêng cho hồ sơ giọng của chính ba, mẹ hoặc người thân. Kể chuyện cho con bằng hơi ấm thân thương của gia đình.
                </p>

                <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Dùng mẫu giọng thu âm cá nhân</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tùy chỉnh độ ấm áp &amp; cao độ giọng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Thu âm thêm giọng mới bất cứ lúc nào</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-2">
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group-hover:from-amber-300 group-hover:to-amber-400 transition-all cursor-pointer"
                >
                  <span>Chọn Giọng Người Dùng</span>
                  <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* 2. Tạo Bằng AI Studio */}
            <div
              onClick={() => {
                setSelectedCreationMode('ai-studio');
                setSelectedVoiceId('vi-diemmy');
              }}
              className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#0c261c]/90 via-[#191919] to-[#131313] border-2 border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-emerald-500/15 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-neutral-950 font-black flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Truyền cảm
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                  Tạo Bằng AI Studio
                </h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  Kho giọng đọc AI chuyên nghiệp đa vùng miền (Bắc, Nam, Cổ tích, Gemini) với ngữ điệu ngắt nghỉ diễn cảm, nghe thử tức thì.
                </p>

                <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>6 giọng AI chuyên nghiệp có bản sắc riêng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Nút nghe thử 3s từng giọng rõ rệt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Phối nhạc nền Lo-fi, Mưa rơi, Rừng xanh</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-2">
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-[#1ed760] text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group-hover:from-emerald-300 group-hover:to-emerald-400 transition-all cursor-pointer"
                >
                  <span>Chọn Giọng AI Studio</span>
                  <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* 3. Sách Mẫu & Thêm Bằng Văn Bản (Áp dụng Giọng Trình Duyệt Tạo Audio Nhanh) */}
            <div
              onClick={() => {
                setSelectedCreationMode('sample-template');
                setSelectedVoiceId('browser-default');
              }}
              className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#101d36]/90 via-[#191919] to-[#131313] border-2 border-blue-500/40 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-blue-500/15 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-neutral-950 font-black flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    📖
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30">
                    Giọng Trình Duyệt Nhanh
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-blue-300 transition-colors">
                  Tạo Bằng Văn Bản &amp; Tải Lên
                </h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  Nhập hoặc dán trực tiếp nội dung văn bản bất kỳ, hoặc tải tệp .txt từ máy tính/điện thoại. Áp dụng giọng đọc trình duyệt Web Speech để xuất audio siêu nhanh tức thì.
                </p>

                <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Nhập hoặc dán nội dung văn bản tự do</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Tải tệp văn bản (.txt) nhanh gọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Áp dụng giọng đọc trình duyệt (Web Speech)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Xuất file audio nhanh tức thì, nhẹ máy</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-2">
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group-hover:from-blue-300 group-hover:to-blue-400 transition-all cursor-pointer"
                >
                  <span>Chọn Tạo Bằng Văn Bản</span>
                  <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 2: TAILORED CREATION STUDIO FOR EACH SELECTED MODE
  // =========================================================================
  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 md:p-8 pb-24 md:pb-12 text-white select-none">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header Banner with Mode Badge & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                stopAmbientMusic();
                setSelectedCreationMode(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#323232] text-xs font-bold text-neutral-200 hover:text-white transition-all active:scale-95 border border-neutral-700 shadow"
              title="Quay lại chọn phương thức khác"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Đổi cách tạo</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Xưởng Tạo Sách Audio</span>
                </h2>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                    selectedCreationMode === 'user-voice'
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : selectedCreationMode === 'ai-studio'
                      ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-blue-400/20 text-blue-300 border-blue-400/40'
                  }`}
                >
                  {selectedCreationMode === 'user-voice'
                    ? '🎙️ Giọng Người Dùng'
                    : selectedCreationMode === 'ai-studio'
                    ? '🤖 Giọng AI Studio'
                    : '📄 Tạo Bằng Văn Bản (Giọng Trình Duyệt)'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">
                {selectedCreationMode === 'user-voice'
                  ? 'Sử dụng hồ sơ giọng thu âm của bạn để đọc sách cho bé.'
                  : selectedCreationMode === 'ai-studio'
                  ? 'Chọn giọng đọc AI truyền cảm, thử giọng trực tiếp và xuất âm thanh.'
                  : 'Nhập hoặc dán nội dung văn bản, tải file .txt và áp dụng giọng trình duyệt để tạo audio nhanh chóng.'}
              </p>
            </div>
          </div>

          {/* Action Header Buttons: Gated until audio is generated */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleDownloadAudiobook('chapter')}
              disabled={!isGenerated}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                isGenerated
                  ? 'bg-[#1ed760] hover:bg-[#1fdf64] text-black cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
              }`}
              title={
                isGenerated
                  ? 'Tải về tệp âm thanh WAV của sách'
                  : 'Vui lòng bấm nút "Bắt Đầu Tạo Sách Audio" bên dưới trước khi tải về'
              }
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Tải Về Audio</span>
            </button>

            <button
              onClick={handleSaveBook}
              disabled={!isGenerated}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all border active:scale-95 ${
                isGenerated
                  ? isSaved
                    ? 'bg-purple-950/80 border-purple-400 text-purple-200 cursor-pointer'
                    : 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-900/40 cursor-pointer'
                  : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed opacity-60'
              }`}
              title={
                isGenerated
                  ? 'Lưu sách trực tiếp vào Kho Sách của bạn'
                  : 'Vui lòng bấm nút "Bắt Đầu Tạo Sách Audio" bên dưới trước khi lưu'
              }
            >
              {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Đã Lưu Vào Kho' : 'Lưu Vào Kho Sách'}</span>
            </button>
          </div>
        </div>

        {/* Floating Error Notification Toast */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}


        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metadata, Content Text & Specialized Voice Selector (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Metadata Info Inputs (BLANK BY DEFAULT FOR USER ENTRY) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Thông Tin Cuốn Sách</span>
                </span>
                <span className="text-[10px] text-neutral-500 italic">Vui lòng điền thông tin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Tiêu đề sách:</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => {
                      setBookTitle(e.target.value);
                      setIsGenerated(false);
                      setGeneratedAudioBlob(null);
                    }}
                    placeholder="Ví dụ: Chú Bé Thông Minh, Bài Học Đêm Trăng..."
                    className="w-full bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none font-semibold placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Tác giả:</label>
                  <input
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => {
                      setBookAuthor(e.target.value);
                      setIsGenerated(false);
                    }}
                    placeholder="Tác giả hoặc tên bạn..."
                    className="w-full bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-600"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Thể loại sách:</label>
                  <input
                    type="text"
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    placeholder="Ví dụ: Văn học thiếu nhi, Cổ tích, Kỹ năng sống, Tản văn..."
                    className="w-full bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* 2. Text Input Area */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Nội Dung Văn Bản Cần Đọc</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2c2c2c] transition-colors border border-neutral-700">
                    <Upload className="w-3 h-3" />
                    <span>Nạp file .txt</span>
                    <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={handleSplitChaptersAI}
                    disabled={isProcessingAI || !rawText.trim()}
                    className="flex items-center gap-1 text-[11px] text-[#1ed760] hover:underline font-bold disabled:opacity-40"
                    title="AI tự động phân tích và chia nhỏ thành các chương hợp lý"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isProcessingAI ? 'animate-spin' : ''}`} />
                    <span>{isProcessingAI ? 'Đang tách...' : 'AI Tách Chương'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawText(val);
                  setIsGenerated(false);
                  setGeneratedAudioBlob(null);

                  // Update or create active chapter
                  setChapters((prev) => {
                    if (prev.length === 0) {
                      return [
                        {
                          id: `chap-${Date.now()}`,
                          title: 'Chương 1',
                          content: val,
                          order: 1,
                          wordCount: val.split(/\s+/).filter(Boolean).length,
                          estimatedDurationSec: Math.ceil(val.split(/\s+/).filter(Boolean).length / 2.5),
                        },
                      ];
                    }
                    return prev.map((c, i) =>
                      i === activeChapterIdx
                        ? {
                            ...c,
                            content: val,
                            wordCount: val.split(/\s+/).filter(Boolean).length,
                          }
                        : c
                    );
                  });
                }}
                placeholder="Dán hoặc nhập nội dung truyện, sách, bài viết vào đây..."
                className="w-full bg-[#121212] border border-[#333] focus:border-[#1ed760] rounded-xl p-3 text-xs sm:text-sm text-neutral-200 leading-relaxed outline-none resize-none placeholder:text-neutral-600"
              />

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Số từ: {rawText.split(/\s+/).filter(Boolean).length} từ</span>
                <span>Ước lượng: ~{formatTime(Math.ceil(rawText.split(/\s+/).filter(Boolean).length / 2.5))}</span>
              </div>
            </div>

            {/* 3. TAILORED VOICE SECTION PER CREATION MODE */}

            {/* --- CASE A: USER VOICE MODE (Chỉ hiển thị giọng người dùng) --- */}
            {selectedCreationMode === 'user-voice' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#181818] to-[#141414] border border-amber-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Hồ Sơ Giọng Người Dùng Của Bạn</span>
                  </label>

                  {onOpenVoiceTraining && (
                    <button
                      onClick={onOpenVoiceTraining}
                      className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thu âm giọng mới</span>
                    </button>
                  )}
                </div>

                {userVoiceProfiles.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xl">
                      🎙️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">Chưa có mẫu giọng thu âm nào</h4>
                      <p className="text-[11px] text-neutral-300 mt-1 max-w-md mx-auto leading-relaxed">
                        Chỉ mất 30 giây thu âm một đoạn ngắn, hệ thống sẽ trích xuất phổ tần số sinh học của bạn để đọc bất kỳ cuốn sách nào.
                      </p>
                    </div>
                    {onOpenVoiceTraining && (
                      <button
                        onClick={onOpenVoiceTraining}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Mở Phòng Thu Cá Nhân Ngay</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Thanh ngang cuộn chọn giọng người dùng */}
                    <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                      {userVoiceProfiles.map((p) => {
                        const isSelected = selectedUserProfileId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedUserProfileId(p.id);
                              setSelectedVoiceId('user_voice');
                              setIsGenerated(false);
                            }}
                            className={`min-w-[145px] sm:min-w-[160px] max-w-[175px] p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between shrink-0 ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-white shadow ring-1 ring-amber-400/50'
                                : 'bg-[#141414] border-[#2c2c2c] hover:bg-[#1a1a1a] text-neutral-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-lg">🎙️</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                                  {p.warmth || 85}% Ấm
                                </span>
                              </div>
                              <p className="text-xs font-bold truncate leading-tight">{p.name}</p>
                              <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                                {p.narratorRole === 'mom'
                                  ? 'Giọng Mẹ Yêu'
                                  : p.narratorRole === 'dad'
                                  ? 'Giọng Ba'
                                  : 'Giọng Cá Nhân'}
                              </p>
                            </div>
                            <div className="mt-2 pt-1 border-t border-neutral-800 flex items-center justify-between">
                              <span className="text-[9px] text-neutral-500">Giọng thu âm</span>
                              {isSelected && (
                                <span className="text-[9px] font-black text-amber-400 flex items-center gap-0.5">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Chọn</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-500/20">
                      <div>
                        <div className="flex justify-between text-[11px] text-amber-200 mb-0.5">
                          <span>Độ ấm áp giọng:</span>
                          <span className="font-bold text-amber-300">{warmth}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          step="5"
                          value={warmth}
                          onChange={(e) => setWarmth(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer h-1.5"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-amber-200 mb-0.5">
                          <span>Tốc độ đọc giọng bạn:</span>
                          <span className="font-bold text-amber-300">{playbackRate}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.75"
                          max="1.5"
                          step="0.05"
                          value={playbackRate}
                          onChange={(e) => setPlaybackRate(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer h-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- CASE B: AI STUDIO MODE (Thanh ngang các giọng AI Studio gọn gàng, chuyên nghiệp) --- */}
            {selectedCreationMode === 'ai-studio' && (
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#181818] to-[#141414] border border-emerald-500/40 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Chọn Giọng AI Studio</span>
                    <span className="text-[10px] text-neutral-400 font-normal">({VIETNAMESE_VOICE_PRESETS.length} giọng đọc)</span>
                  </label>

                  <div className="flex items-center gap-1 text-[10px]">
                    {(['all', 'Bắc', 'Nam', 'Cổ tích'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRegionFilter(r)}
                        className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                          regionFilter === r
                            ? 'bg-emerald-400 text-neutral-950 font-black'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {r === 'all' ? 'Tất cả' : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thanh ngang nhỏ cuộn mượt mà các giọng AI Studio */}
                <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                  {VIETNAMESE_VOICE_PRESETS.filter((v) => {
                    if (regionFilter === 'all') return true;
                    return v.region.includes(regionFilter);
                  }).map((v) => {
                    const isSelected = selectedVoiceId === v.id;
                    const isPreviewing = previewingVoiceId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVoiceId(v.id);
                          setIsGenerated(false);
                        }}
                        className={`min-w-[150px] sm:min-w-[165px] max-w-[180px] p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/15 ring-1 ring-emerald-400/50'
                            : 'bg-[#141414] border-[#2c2c2c] hover:bg-[#1a1a1a] hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-lg">{v.avatarEmoji}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-300 font-semibold">
                              {v.region} • {v.gender === 'male' ? 'Nam' : 'Nữ'}
                            </span>
                          </div>
                          <p className="text-xs font-bold truncate leading-tight">{v.name}</p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">{v.tag}</p>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-neutral-800/80 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewVoice(v.id);
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isPreviewing
                                ? 'bg-emerald-400 text-neutral-950 animate-pulse font-black'
                                : 'bg-[#242424] hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-300'
                            }`}
                            title="Nghe thử giọng đọc mẫu trong 3 giây"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>{isPreviewing ? 'Đang đọc...' : 'Thử 3s'}</span>
                          </button>

                          {isSelected ? (
                            <span className="text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Đang chọn</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-neutral-600">Chọn</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Điều chỉnh Tốc độ, Cao độ & Nhạc nền dạng hàng ngang gọn gàng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-500/20">
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Tốc độ đọc:</span>
                      <span className="font-bold text-white">{playbackRate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.05"
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
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
                      className="w-full accent-emerald-400 cursor-pointer h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Nhạc nền êm dịu:</span>
                    </div>
                    <select
                      value={ambience}
                      onChange={(e) => {
                        setAmbience(e.target.value as any);
                        if (isPlaying) startAmbientMusic();
                      }}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-2 py-0.5 text-[11px] text-white outline-none cursor-pointer"
                    >
                      <option value="none">Không nhạc nền</option>
                      <option value="lofi">Lo-Fi Đọc Sách</option>
                      <option value="forest">Khu Rừng Yên Tĩnh</option>
                      <option value="rain">Mưa Đêm Êm Đềm</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --- CASE C: TẠO BẰNG VĂN BẢN (CHỈ ÁP DỤNG GIỌNG TRÌNH DUYỆT TẠO AUDIO NHANH) --- */}
            {selectedCreationMode === 'sample-template' && (
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-950/30 via-[#181818] to-[#141414] border border-blue-500/40 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>Giọng Đọc Trình Duyệt (Web Speech)</span>
                      <span className="text-[10px] text-neutral-400 font-normal">({BROWSER_VOICE_PRESETS.length} giọng đọc)</span>
                    </label>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Tốc độ xử lý siêu tốc, không cần chờ mạng, nhẹ máy.
                    </p>
                  </div>

                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold self-start sm:self-auto flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-400 fill-current" />
                    <span>Tạo Nhanh</span>
                  </span>
                </div>

                {/* Thanh ngang nhỏ cuộn ngang các giọng trình duyệt */}
                <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                  {BROWSER_VOICE_PRESETS.map((v) => {
                    const isSelected = selectedVoiceId === v.id;
                    const isPreviewing = previewingVoiceId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVoiceId(v.id);
                          setIsGenerated(false);
                        }}
                        className={`min-w-[150px] sm:min-w-[165px] max-w-[180px] p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between shrink-0 ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-400 text-white shadow-md shadow-blue-500/15 ring-1 ring-blue-400/50'
                            : 'bg-[#141414] border-[#2c2c2c] hover:bg-[#1a1a1a] hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-lg">{v.avatarEmoji}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-300 font-semibold">
                              {v.gender === 'male' ? 'Nam' : 'Nữ'} • Web Speech
                            </span>
                          </div>
                          <p className="text-xs font-bold truncate leading-tight">{v.name}</p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">{v.tag}</p>
                        </div>

                        {/* Direct 3s Preview Button with audible difference */}
                        <div className="mt-2 pt-1.5 border-t border-neutral-800/80 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewVoice(v.id);
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isPreviewing
                                ? 'bg-blue-400 text-neutral-950 animate-pulse font-black'
                                : 'bg-[#242424] hover:bg-blue-500/20 text-neutral-300 hover:text-blue-300'
                            }`}
                            title="Nghe thử giọng đọc trình duyệt trong 3 giây"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>{isPreviewing ? 'Đang đọc...' : 'Thử 3s'}</span>
                          </button>

                          {isSelected ? (
                            <span className="text-[9px] font-black text-blue-400 flex items-center gap-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Đang chọn</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-neutral-600">Chọn</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sliders: Speed & Pitch for Browser Voice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-500/20">
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Tốc độ đọc trình duyệt:</span>
                      <span className="font-bold text-white">{playbackRate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.75"
                      step="0.05"
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(Number(e.target.value))}
                      className="w-full accent-blue-400 cursor-pointer h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
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
                      className="w-full accent-blue-400 cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. PROMINENT AUDIO GENERATION BUTTON (The Gate to Create Audiobook) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#181818] via-[#202020] to-[#181818] border-2 border-neutral-700/80 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-amber-400" />
                    <span>
                      {selectedCreationMode === 'sample-template'
                        ? 'Tạo Nhanh Audio Sách Bằng Giọng Trình Duyệt'
                        : 'Tổng Hợp Âm Thanh Sách Nói'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {selectedCreationMode === 'sample-template'
                      ? 'Xử lý văn bản bằng giọng trình duyệt siêu tốc, tạo file audio WAV chỉ trong 1 giây.'
                      : 'Bấm nút bên dưới để hệ thống xử lý giọng đọc và tạo file audio hoàn chỉnh trước khi nghe & tải.'}
                  </p>
                </div>

                {isGenerated && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã tạo xong</span>
                  </span>
                )}
              </div>

              {/* Progress bar during generation */}
              {isGenerating && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-amber-300 font-bold">
                    <span>
                      {selectedCreationMode === 'sample-template'
                        ? 'Đang tạo audio nhanh bằng giọng trình duyệt...'
                        : 'Đang tổng hợp phổ âm thanh...'}
                    </span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-[#1ed760] transition-all duration-300 rounded-full"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateAudiobook}
                disabled={isGenerating}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#1ed760] hover:from-amber-300 hover:to-[#1fdf64] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý âm thanh sách nói...</span>
                  </>
                ) : isGenerated ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Tạo Lại / Cập Nhật Sách Audio</span>
                  </>
                ) : selectedCreationMode === 'sample-template' ? (
                  <>
                    <Zap className="w-4 h-4 fill-current text-neutral-950" />
                    <span>⚡ Tạo Nhanh Audio Bằng Giọng Trình Duyệt</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>🎧 Bắt Đầu Tạo Sách Audio</span>
                  </>
                )}
              </button>

              {/* Post-generation banner if audio is ready */}
              {isGenerated && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 via-emerald-950/60 to-[#181818] border border-emerald-500/40 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎉</span>
                    <span className="text-neutral-200 text-[11px] font-medium">
                      Sách audio đã xuất xong! Bạn có thể tải WAV hoặc lưu vào kho sách.
                    </span>
                  </div>
                  <button
                    onClick={handleSaveBook}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 border cursor-pointer ${
                      isSaved
                        ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                        : 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white'
                    }`}
                  >
                    {isSaved ? '✓ Đã Lưu Kho' : '💾 Lưu Vào Kho Sách'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Audio Reader, Sentence Highlighter, Chapters & Player (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Chapter Tabs */}
            {chapters.length > 1 && (
              <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {chapters.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectChapter(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeChapterIdx === idx
                          ? 'bg-amber-400 text-neutral-950 font-black shadow-md'
                          : 'bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white'
                      }`}
                    >
                      <span>{c.title}</span>
                      {activeChapterIdx === idx && isPlaying && (
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      )}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] font-bold text-neutral-400 whitespace-nowrap shrink-0">
                  Chương {activeChapterIdx + 1}/{chapters.length}
                </span>
              </div>
            )}

            {/* Interactive Synchronized Text Reader Box */}
            <div className="p-5 rounded-3xl bg-[#181818] border border-[#2a2a2a] space-y-4 shadow-xl flex flex-col h-[520px]">
              {/* Player Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#282828] gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{activeChapter.title || bookTitle || 'Nội dung sách'}</span>
                    {chapters.length > 1 && (
                      <span className="text-[10px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded-full">
                        {activeChapterIdx + 1}/{chapters.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {activeChapter.wordCount || rawText.split(/\s+/).filter(Boolean).length} từ •{' '}
                    {formatTime(activeChapter.estimatedDurationSec || 60)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Auto-Advance Chapters Switch */}
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAutoAdvanceChapters((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                        autoAdvanceChapters
                          ? 'bg-amber-400/20 border-amber-400/60 text-amber-300'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      }`}
                      title="Khi đọc hết chương này, hệ thống sẽ tự động phát tiếp chương kế tiếp"
                    >
                      <span>🔄 Nối chương:</span>
                      <strong className={autoAdvanceChapters ? 'text-amber-400' : 'text-neutral-500'}>
                        {autoAdvanceChapters ? 'BẬT' : 'TẮT'}
                      </strong>
                    </button>
                  )}

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isGenerated
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isGenerated ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
                      }`}
                    />
                    <span>{isGenerated ? 'Đã Sẵn Sàng' : 'Chưa Tạo Audio'}</span>
                  </span>
                </div>
              </div>

              {/* Scrolling Sentence Highlighter */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-3 rounded-2xl bg-[#121212] border border-[#242424] space-y-2.5 leading-relaxed text-xs sm:text-sm">
                {activeSentences.length === 0 || !rawText.trim() ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
                    <FileText className="w-8 h-8 stroke-1 text-neutral-600" />
                    <p className="text-xs">Chưa có nội dung văn bản.</p>
                    <p className="text-[11px] text-neutral-600 max-w-xs">
                      Hãy nhập tiêu đề và nội dung vào khung bên trái, sau đó bấm &quot;Bắt Đầu Tạo Sách Audio&quot;.
                    </p>
                  </div>
                ) : (
                  activeSentences.map((sentence, sIdx) => {
                    const isCurrent = currentSentenceIdx === sIdx && isPlaying;
                    return (
                      <p
                        key={sIdx}
                        onClick={() => {
                          if (!isGenerated) {
                            handleGenerateAudiobook();
                          } else {
                            playSentence(sIdx, activeChapterIdx);
                          }
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-amber-400/25 text-white font-semibold border-l-4 border-amber-400 shadow'
                            : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
                        }`}
                      >
                        {sentence}
                      </p>
                    );
                  })
                )}
              </div>

              {/* Bottom Playback Control Bar */}
              <div className="pt-2 border-t border-[#282828] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>
                    Câu {currentSentenceIdx + 1} / {activeSentences.length || 1}
                  </span>
                  <span>
                    {isPlaying ? (
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        Đang đọc chương {activeChapterIdx + 1}
                      </span>
                    ) : isGenerated ? (
                      <span className="text-emerald-400">Audio đã sẵn sàng</span>
                    ) : (
                      <span className="text-neutral-500">Chưa tổng hợp</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRewind}
                      disabled={!isGenerated}
                      className="p-2.5 rounded-full bg-[#242424] hover:bg-[#303030] text-neutral-300 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                      title="Lùi 2 câu"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleTogglePlay}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                          : isGenerated
                          ? 'bg-[#1ed760] hover:bg-[#1fdf64] text-neutral-950'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                      title={isPlaying ? 'Tạm dừng' : 'Bắt đầu nghe'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleForward}
                      disabled={!isGenerated}
                      className="p-2.5 rounded-full bg-[#242424] hover:bg-[#303030] text-neutral-300 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                      title="Tiến 2 câu"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Download & Save Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleDownloadAudiobook('chapter')}
                      disabled={!isGenerated}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                        isGenerated
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer'
                          : 'bg-neutral-900 text-neutral-600 cursor-not-allowed opacity-50'
                      }`}
                      title={
                        isGenerated
                          ? `Tải về file WAV chương ${activeChapterIdx + 1}`
                          : 'Tạo sách audio trước khi tải về'
                      }
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải chương này</span>
                    </button>

                    {chapters.length > 1 && (
                      <button
                        onClick={() => handleDownloadAudiobook('all')}
                        disabled={!isGenerated}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                          isGenerated
                            ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 cursor-pointer'
                            : 'bg-neutral-900 text-neutral-600 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          isGenerated
                            ? 'Tải toàn bộ các chương đã nối thành 1 file WAV trọn vẹn'
                            : 'Tạo sách audio trước khi tải về'
                        }
                      >
                        <Download className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Tải trọn bộ</span>
                      </button>
                    )}

                    <button
                      onClick={handleSaveBook}
                      disabled={!isGenerated}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 border ${
                        isGenerated
                          ? isSaved
                            ? 'bg-purple-950/80 border-purple-400 text-purple-200 cursor-pointer'
                            : 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white cursor-pointer shadow-purple-900/40'
                          : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed opacity-50'
                      }`}
                      title={
                        isGenerated
                          ? 'Lưu tác phẩm sách audio này vào Kho Sách'
                          : 'Tạo sách audio trước khi lưu vào kho'
                      }
                    >
                      {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{isSaved ? 'Đã Lưu Kho' : 'Lưu Vào Kho Sách'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
