import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Book, Chapter, PlaybackSpeed, VoiceSettings, UserVoiceProfile } from '../types/book';
import { splitIntoSentences, estimateDuration } from '../utils/textParser';

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  engine: 'browser',
  rate: 0.95, // Tự nhiên, nhẹ nhàng cho trẻ em và người nghe truyện
  pitch: 1.0,
  volume: 1.0,
  selectedVoiceURI: '',
  geminiVoice: 'Kore',
  geminiStylePrompt: 'Giọng kể chuyện thiếu nhi Việt Nam ấm áp, truyền cảm, nhả chữ tự nhiên, nhấn nhá giàu cảm xúc',
  expressiveMode: true, // Bật chế độ đọc nhấn nhá truyền cảm hứng mặc định
  activeUserProfileId: 'default-mom',
  userProfiles: [
    {
      id: 'default-mom',
      name: 'Giọng Mẹ Ấm Áp',
      narratorRole: 'mom',
      pitch: 1.06,
      rate: 0.92,
      warmth: 85,
      recordedAt: Date.now() - 86400000,
      sampleText: 'Chào con yêu của mẹ! Mẹ sẽ cùng con khám phá trang sách hôm nay nhé.',
    },
    {
      id: 'default-dad',
      name: 'Giọng Ba Trầm Ấm',
      narratorRole: 'dad',
      pitch: 0.92,
      rate: 0.94,
      warmth: 80,
      recordedAt: Date.now() - 43200000,
      sampleText: 'Chào con yêu, ba đọc truyện cho con nghe để chuẩn bị ngủ ngon nhé.',
    },
  ],
};

const STORAGE_VOICE_KEY = 'audiobookify_voice_settings';
const STORAGE_LAST_PLAYBACK_KEY = 'audiobookify_last_playback';

export function useBookAudioPlayer(books: Book[] = []) {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackSpeed>(1.0);
  const [volume, setVolumeState] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOICE_KEY);
      if (saved) return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_VOICE_SETTINGS;
  });

  // Reference trackers to avoid stale state in asynchronous audio callbacks
  const isPlayingRef = useRef<boolean>(false);
  const currentSentenceIndexRef = useRef<number>(0);
  const sentencesRef = useRef<string[]>([]);
  const currentChapterRef = useRef<Chapter | null>(null);
  const currentBookRef = useRef<Book | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const nextSentenceTimeoutRef = useRef<any>(null);
  const transitionDebounceRef = useRef<any>(null);
  const hasRestoredPlaybackRef = useRef<boolean>(false);

  // Split chapter content into sentences
  const sentences = useMemo(() => {
    if (!currentChapter?.content) return [];
    return splitIntoSentences(currentChapter.content);
  }, [currentChapter]);

  // Keep refs in sync
  useEffect(() => {
    sentencesRef.current = sentences;
  }, [sentences]);

  useEffect(() => {
    currentSentenceIndexRef.current = currentSentenceIndex;
  }, [currentSentenceIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentChapterRef.current = currentChapter;
  }, [currentChapter]);

  useEffect(() => {
    currentBookRef.current = currentBook;
  }, [currentBook]);

  // Load available browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setAvailableVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Restore last playing book and position on startup
  useEffect(() => {
    if (hasRestoredPlaybackRef.current || books.length === 0) return;

    try {
      const saved = localStorage.getItem(STORAGE_LAST_PLAYBACK_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bookId) {
          const matchedBook = books.find((b) => b.id === parsed.bookId);
          if (matchedBook) {
            const matchedChapter =
              matchedBook.chapters.find((c) => c.id === parsed.chapterId) ||
              matchedBook.chapters[0] ||
              null;

            setCurrentBook(matchedBook);
            setCurrentChapter(matchedChapter);

            if (matchedChapter) {
              const chSentences = splitIntoSentences(matchedChapter.content);
              const safeIdx = Math.max(
                0,
                Math.min(chSentences.length - 1, parsed.sentenceIndex || 0)
              );
              setCurrentSentenceIndex(safeIdx);
              currentSentenceIndexRef.current = safeIdx;
            }
            hasRestoredPlaybackRef.current = true;
            return;
          }
        }
      }

      // If no saved playback, default to the first book without auto-playing
      if (!currentBook && books[0]) {
        setCurrentBook(books[0]);
        setCurrentChapter(books[0].chapters[0] || null);
        setCurrentSentenceIndex(0);
        hasRestoredPlaybackRef.current = true;
      }
    } catch (e) {
      console.warn('Could not restore last playback:', e);
    }
  }, [books, currentBook]);

  // Persist current book and position to localStorage
  useEffect(() => {
    if (currentBook && currentChapter) {
      try {
        localStorage.setItem(
          STORAGE_LAST_PLAYBACK_KEY,
          JSON.stringify({
            bookId: currentBook.id,
            chapterId: currentChapter.id,
            sentenceIndex: currentSentenceIndex,
            savedAt: Date.now(),
          })
        );
      } catch (e) {
        // ignore
      }
    }
  }, [currentBook, currentChapter, currentSentenceIndex]);

  // Save voice settings to localStorage
  const updateVoiceSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_VOICE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Stop any active utterance, audio, or timer
  const stopAudio = useCallback(() => {
    if (nextSentenceTimeoutRef.current) {
      clearTimeout(nextSentenceTimeoutRef.current);
      nextSentenceTimeoutRef.current = null;
    }
    if (transitionDebounceRef.current) {
      clearTimeout(transitionDebounceRef.current);
      transitionDebounceRef.current = null;
    }
    if (currentAudioElementRef.current) {
      try {
        currentAudioElementRef.current.pause();
        currentAudioElementRef.current.currentTime = 0;
      } catch {}
      currentAudioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    currentUtteranceRef.current = null;
  }, []);

  // Compute natural breath pause duration (nhấn nhá nghỉ hơi) based on sentence endings
  const getNaturalPauseDuration = useCallback(
    (sentence: string): number => {
      if (!voiceSettings.expressiveMode) return 120;

      const trimmed = sentence.trim();
      if (trimmed.endsWith('?') || trimmed.endsWith('!')) {
        return 420; // Nghỉ lấy hơi câu hỏi / câu cảm thán
      }
      if (trimmed.endsWith('...')) {
        return 500; // Nghỉ ngắt lửng lơ tò mò
      }
      if (trimmed.startsWith('—') || trimmed.startsWith('-') || trimmed.startsWith('"') || trimmed.startsWith('“')) {
        return 380; // Nghỉ đối thoại
      }
      return 280; // Nghỉ tự nhiên kết thúc câu trần thuật
    },
    [voiceSettings.expressiveMode]
  );

  // Compute expressive pitch and rate modulations (nhấn nhá ngữ điệu)
  const getExpressiveModulations = useCallback(
    (sentence: string) => {
      let pitchMod = voiceSettings.pitch;
      let rateMod = voiceSettings.rate;

      // Apply User Voice Profile if selected
      if (voiceSettings.engine === 'user_voice') {
        const profile =
          voiceSettings.userProfiles?.find((p) => p.id === voiceSettings.activeUserProfileId) ||
          voiceSettings.userProfiles?.[0];
        if (profile) {
          pitchMod = profile.pitch;
          rateMod = profile.rate;
        }
      }

      if (!voiceSettings.expressiveMode) {
        return { pitch: pitchMod, rate: rateMod };
      }

      const trimmed = sentence.trim();
      const lower = trimmed.toLowerCase();

      // Câu hỏi: vút giọng nhẹ ở đuôi câu
      if (trimmed.endsWith('?') || lower.includes('sao nhỉ') || lower.includes('ở đâu') || lower.includes('thế nào')) {
        pitchMod = Math.min(1.3, pitchMod * 1.08);
        rateMod = rateMod * 0.96;
      }
      // Câu cảm thán: tươi vui, phấn khởi
      else if (trimmed.endsWith('!') || lower.startsWith('ôi') || lower.startsWith('kìa') || lower.includes('tuyệt quá')) {
        pitchMod = Math.min(1.3, pitchMod * 1.05);
        rateMod = Math.min(1.8, rateMod * 1.02);
      }
      // Ngập ngừng, dẫn chuyện lãng mạn
      else if (trimmed.endsWith('...') || lower.includes('bỗng nhiên') || lower.includes('từ xa')) {
        pitchMod = Math.max(0.75, pitchMod * 0.96);
        rateMod = rateMod * 0.88;
      }
      // Lời thoại nhân vật
      else if (trimmed.startsWith('—') || trimmed.startsWith('-') || trimmed.startsWith('“')) {
        pitchMod = pitchMod * 1.02;
        rateMod = rateMod * 0.94;
      } else {
        // Kể chuyện đều đặn, truyền cảm
        rateMod = rateMod * 0.95;
      }

      return { pitch: pitchMod, rate: rateMod };
    },
    [voiceSettings]
  );

  // Speak with browser Web Speech API
  const speakBrowserUtterance = useCallback(
    (sentence: string, onEnd: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(sentence);
      currentUtteranceRef.current = utterance;

      // Detect language
      const isEnglish = /^[A-Za-z0-9\s.,!?'"()\-:;]+$/.test(sentence.slice(0, 40));
      const targetLang = isEnglish ? 'en' : 'vi';

      // Pick preferred voice
      let selectedVoice: SpeechSynthesisVoice | undefined;
      if (voiceSettings.selectedVoiceURI) {
        selectedVoice = availableVoices.find((v) => v.voiceURI === voiceSettings.selectedVoiceURI);
      }
      if (!selectedVoice) {
        selectedVoice =
          availableVoices.find((v) => v.lang.toLowerCase().startsWith(targetLang)) ||
          availableVoices.find((v) => v.lang.toLowerCase().includes('vi')) ||
          availableVoices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      const { pitch, rate } = getExpressiveModulations(sentence);

      utterance.lang = targetLang === 'en' ? 'en-US' : 'vi-VN';
      utterance.rate = Math.max(0.6, Math.min(2.0, playbackRate * rate));
      utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
      utterance.volume = isMuted ? 0 : volume * voiceSettings.volume;

      // Chrome long-utterance safeguard
      let safetyTimer: any = null;
      const expectedDurationMs = Math.max(2500, (sentence.length / 8) * (1000 / utterance.rate) + 3000);

      utterance.onstart = () => {
        safetyTimer = setTimeout(() => {
          if (isPlayingRef.current) {
            onEnd();
          }
        }, expectedDurationMs);
      };

      utterance.onend = () => {
        if (safetyTimer) clearTimeout(safetyTimer);
        currentUtteranceRef.current = null;
        if (isPlayingRef.current) {
          onEnd();
        }
      };

      utterance.onerror = (e) => {
        if (safetyTimer) clearTimeout(safetyTimer);
        currentUtteranceRef.current = null;
        console.warn('SpeechSynthesis sentence event:', e);
        if (isPlayingRef.current) {
          onEnd();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, getExpressiveModulations, isMuted, playbackRate, voiceSettings, volume]
  );

  // Speak a single sentence (routing to Gemini TTS or Browser Speech)
  const speakSentence = useCallback(
    async (sentence: string, onEnd: () => void) => {
      // If Gemini engine is chosen, try backend TTS
      if (voiceSettings.engine === 'gemini') {
        try {
          const res = await fetch('/api/gemini/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: sentence,
              voiceName: voiceSettings.geminiVoice || 'Kore',
              style: 'Giọng đọc truyện thiếu nhi và tản văn Việt Nam truyền cảm, ấm áp, nhả chữ tròn vành rõ chữ, có nhấn nhá nhịp điệu sinh động',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.audioBase64) {
              stopAudio();
              const audio = new Audio();
              currentAudioElementRef.current = audio;
              audio.playbackRate = playbackRate;
              audio.volume = isMuted ? 0 : volume * voiceSettings.volume;

              audio.onended = () => {
                currentAudioElementRef.current = null;
                if (isPlayingRef.current) {
                  onEnd();
                }
              };

              audio.onerror = (e) => {
                if (typeof e !== 'string') e?.preventDefault?.();
                console.warn('Gemini audio element source error, switching to browser utterance');
                currentAudioElementRef.current = null;
                speakBrowserUtterance(sentence, onEnd);
              };

              audio.src = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;

              try {
                await audio.play();
                return;
              } catch (playErr) {
                console.warn('Audio play failed, falling back to browser speech:', playErr);
                currentAudioElementRef.current = null;
                speakBrowserUtterance(sentence, onEnd);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Gemini TTS playback fallback to browser speech:', e);
        }
      }

      // Default / Fallback: Web Speech API with expressive Vietnamese cadence
      speakBrowserUtterance(sentence, onEnd);
    },
    [isMuted, playbackRate, speakBrowserUtterance, stopAudio, voiceSettings, volume]
  );

  // Play sentence recursively with smooth human breath pause
  const playFromIndex = useCallback(
    (index: number) => {
      const sentenceList = sentencesRef.current;
      if (!sentenceList || sentenceList.length === 0) {
        setIsPlaying(false);
        return;
      }

      if (index >= sentenceList.length) {
        // Chapter finished! Transition smoothly to next chapter
        const book = currentBookRef.current;
        const currentChap = currentChapterRef.current;
        if (book && currentChap) {
          const sorted = [...book.chapters].sort((a, b) => a.order - b.order);
          const currentIndex = sorted.findIndex((c) => c.id === currentChap.id);
          if (currentIndex !== -1 && currentIndex + 1 < sorted.length) {
            const nextChap = sorted[currentIndex + 1];
            setCurrentChapter(nextChap);
            setCurrentSentenceIndex(0);
            return;
          }
        }
        // End of book reached
        setIsPlaying(false);
        setCurrentSentenceIndex(sentenceList.length - 1);
        return;
      }

      setCurrentSentenceIndex(index);
      currentSentenceIndexRef.current = index;
      setIsPlaying(true);
      isPlayingRef.current = true;

      const currentSentence = sentenceList[index];
      const pauseDuration = getNaturalPauseDuration(currentSentence);

      speakSentence(currentSentence, () => {
        if (!isPlayingRef.current) return;

        // Insert natural breath pause before starting next sentence
        nextSentenceTimeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            playFromIndex(index + 1);
          }
        }, pauseDuration);
      });
    },
    [getNaturalPauseDuration, speakSentence]
  );

  // Watch for chapter changes when playing to smoothly start from 0
  useEffect(() => {
    if (isPlayingRef.current && sentences.length > 0) {
      playFromIndex(0);
    }
  }, [currentChapter?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause playback
  const pause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopAudio();
  }, [stopAudio]);

  // Resume playback smoothly
  const resume = useCallback(() => {
    if (sentences.length === 0) return;
    setIsPlaying(true);
    isPlayingRef.current = true;
    playFromIndex(currentSentenceIndexRef.current);
  }, [playFromIndex, sentences]);

  // Play a specific book and chapter smoothly
  const playBook = useCallback(
    (book: Book, chapter?: Chapter, startIndex: number = 0) => {
      // 1. Immediately cancel old audio
      stopAudio();

      // 2. Set new state
      setCurrentBook(book);
      const targetChapter = chapter || (book.chapters.length > 0 ? book.chapters[0] : null);
      setCurrentChapter(targetChapter);
      setCurrentSentenceIndex(startIndex);
      currentSentenceIndexRef.current = startIndex;

      if (targetChapter) {
        const parsed = splitIntoSentences(targetChapter.content);
        sentencesRef.current = parsed;

        // 3. Debounce smoothly (40ms) to ensure previous utterance is fully garbage-collected
        transitionDebounceRef.current = setTimeout(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          playFromIndex(startIndex);
        }, 40);
      }
    },
    [playFromIndex, stopAudio]
  );

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  // Jump to specific sentence index (scrubber or lyrics text click)
  const seekToSentence = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, Math.min(sentences.length - 1, index));
      setCurrentSentenceIndex(targetIndex);
      currentSentenceIndexRef.current = targetIndex;

      if (isPlayingRef.current) {
        stopAudio();
        transitionDebounceRef.current = setTimeout(() => {
          playFromIndex(targetIndex);
        }, 30);
      }
    },
    [sentences.length, stopAudio, playFromIndex]
  );

  // Rewind by 2 sentences
  const rewind = useCallback(() => {
    const newIdx = Math.max(0, currentSentenceIndexRef.current - 2);
    seekToSentence(newIdx);
  }, [seekToSentence]);

  // Fast forward by 2 sentences
  const forward = useCallback(() => {
    const newIdx = Math.min(sentences.length - 1, currentSentenceIndexRef.current + 2);
    seekToSentence(newIdx);
  }, [seekToSentence, sentences.length]);

  // Next chapter
  const nextChapter = useCallback(() => {
    if (!currentBook || !currentChapter) return;
    const sorted = [...currentBook.chapters].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === currentChapter.id);
    if (idx !== -1 && idx + 1 < sorted.length) {
      stopAudio();
      const nextChap = sorted[idx + 1];
      setCurrentChapter(nextChap);
      setCurrentSentenceIndex(0);
      if (isPlayingRef.current) {
        const nextSentences = splitIntoSentences(nextChap.content);
        sentencesRef.current = nextSentences;
        transitionDebounceRef.current = setTimeout(() => {
          playFromIndex(0);
        }, 40);
      }
    }
  }, [currentBook, currentChapter, playFromIndex, stopAudio]);

  // Previous chapter
  const prevChapter = useCallback(() => {
    if (!currentBook || !currentChapter) return;
    const sorted = [...currentBook.chapters].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === currentChapter.id);
    if (idx > 0) {
      stopAudio();
      const prevChap = sorted[idx - 1];
      setCurrentChapter(prevChap);
      setCurrentSentenceIndex(0);
      if (isPlayingRef.current) {
        const prevSentences = splitIntoSentences(prevChap.content);
        sentencesRef.current = prevSentences;
        transitionDebounceRef.current = setTimeout(() => {
          playFromIndex(0);
        }, 40);
      }
    }
  }, [currentBook, currentChapter, playFromIndex, stopAudio]);

  // Set playback speed
  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      setPlaybackRate(speed);
      if (isPlayingRef.current) {
        stopAudio();
        transitionDebounceRef.current = setTimeout(() => {
          playFromIndex(currentSentenceIndexRef.current);
        }, 30);
      }
    },
    [playFromIndex, stopAudio]
  );

  // Set volume
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Compute timing and progress for Spotify player
  const totalDurationSec = useMemo(() => {
    if (!currentChapter) return 0;
    return currentChapter.estimatedDurationSec || estimateDuration(currentChapter.wordCount, playbackRate);
  }, [currentChapter, playbackRate]);

  const progressPercent = useMemo(() => {
    if (sentences.length <= 1) return 0;
    return Math.min(100, Math.round((currentSentenceIndex / (sentences.length - 1)) * 100));
  }, [currentSentenceIndex, sentences.length]);

  const currentTimeSec = useMemo(() => {
    return Math.round((progressPercent / 100) * totalDurationSec);
  }, [progressPercent, totalDurationSec]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    currentBook,
    currentChapter,
    currentSentenceIndex,
    sentences,
    isPlaying,
    playbackRate,
    volume,
    isMuted,
    voiceSettings,
    availableVoices,
    progressPercent,
    currentTimeSec,
    totalDurationSec,
    playBook,
    pause,
    resume,
    togglePlay,
    seekToSentence,
    rewind,
    forward,
    nextChapter,
    prevChapter,
    setSpeed,
    setVolume,
    toggleMute,
    updateVoiceSettings,
    setCurrentBook,
    setCurrentChapter,
  };
}
