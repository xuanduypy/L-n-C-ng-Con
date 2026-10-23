import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChildProfile,
  VoiceSettings,
  StoryBookItem,
  LearningHistoryEntry,
  EnglishWord,
  PuppyMood,
  PuppyCostume,
  MusicTrack,
  SecuritySettings,
  ActiveVocabularyPrompt,
} from './types';
import {
  DEFAULT_CHILD_PROFILE,
  DEFAULT_VOICE_SETTINGS,
  DEFAULT_ENGLISH_WORDS,
  DEFAULT_STORIES,
  DEFAULT_MUSIC_TRACKS,
  DEFAULT_SECURITY_SETTINGS,
} from './data/defaultData';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useContinuousVoice } from './hooks/useContinuousVoice';
import { ChildPureVoiceView } from './components/ChildPureVoiceView';
import { ParentPinModal } from './components/ParentPinModal';
import { ParentStudioView } from './components/ParentStudioView';
import { playTrack, stopMusic, isMusicPlaying } from './utils/musicSynthesizer';
import confetti from 'canvas-confetti';

export default function App() {
  // App View Mode: 'child' (Pure voice puppy) or 'parent' (Parent Studio)
  const [viewMode, setViewMode] = useState<'child' | 'parent'>('child');
  const [showPinModal, setShowPinModal] = useState(false);

  // Security & Privacy Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('lcc_security_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SECURITY_SETTINGS;
  });

  // Persistent States for the 4 Knowledge Vaults
  const [childProfile, setChildProfile] = useState<ChildProfile>(() => {
    const saved = localStorage.getItem('lcc_child_profile');
    return saved ? JSON.parse(saved) : DEFAULT_CHILD_PROFILE;
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('lcc_voice_settings');
    return saved ? JSON.parse(saved) : DEFAULT_VOICE_SETTINGS;
  });

  const [stories, setStories] = useState<StoryBookItem[]>(() => {
    const saved = localStorage.getItem('lcc_stories');
    return saved ? JSON.parse(saved) : DEFAULT_STORIES;
  });

  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>(() => {
    const saved = localStorage.getItem('lcc_music_tracks');
    return saved ? JSON.parse(saved) : DEFAULT_MUSIC_TRACKS;
  });

  const [words, setWords] = useState<EnglishWord[]>(() => {
    const saved = localStorage.getItem('lcc_english_words');
    return saved ? JSON.parse(saved) : DEFAULT_ENGLISH_WORDS;
  });

  const [learningHistory, setLearningHistory] = useState<LearningHistoryEntry[]>(() => {
    const saved = localStorage.getItem('lcc_learning_history');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'init-1',
        timestamp: 'Hôm nay',
        createdAt: Date.now(),
        type: 'english_practice',
        title: 'Chào hỏi và làm quen cùng cún',
        detail: 'Bé đã bắt đầu tương tác giọng nói với chú cún cưng!',
        score: 95,
        stars: 3,
      },
    ];
  });

  // Active Interactive States
  const [activeVocabPrompt, setActiveVocabPrompt] = useState<ActiveVocabularyPrompt | null>(null);
  const [activeMusicTitle, setActiveMusicTitle] = useState<string | null>(null);
  const [puppyMood, setPuppyMood] = useState<PuppyMood>('happy');
  const [puppyCostume, setPuppyCostume] = useState<PuppyCostume>('none');
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);

  // Turn count tracker for scheduling vocabulary prompts after some conversation
  const turnCountRef = useRef(0);

  // Speech Synthesis Hook (TTS)
  const { isSpeaking, speak, stop } = useSpeechSynthesis(voiceSettings);

  // 1. Auto-Delete Chat History Policy Enforcement
  const enforcePrivacyPurge = useCallback(() => {
    if (!securitySettings.autoPurgeEnabled) return;
    const maxAgeMs = securitySettings.historyRetentionHours * 60 * 60 * 1000;
    if (maxAgeMs <= 0) {
      // Immediate purge mode
      setLearningHistory([]);
      return;
    }

    const now = Date.now();
    setLearningHistory((prev) => prev.filter((item) => now - (item.createdAt || 0) <= maxAgeMs));
  }, [securitySettings]);

  useEffect(() => {
    enforcePrivacyPurge();
    const interval = setInterval(enforcePrivacyPurge, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [enforcePrivacyPurge]);

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('lcc_child_profile', JSON.stringify(childProfile));
  }, [childProfile]);

  useEffect(() => {
    localStorage.setItem('lcc_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  useEffect(() => {
    localStorage.setItem('lcc_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('lcc_music_tracks', JSON.stringify(musicTracks));
  }, [musicTracks]);

  useEffect(() => {
    localStorage.setItem('lcc_english_words', JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem('lcc_learning_history', JSON.stringify(learningHistory));
  }, [learningHistory]);

  useEffect(() => {
    localStorage.setItem('lcc_security_settings', JSON.stringify(securitySettings));
  }, [securitySettings]);

  // Welcome greeting when child opens the app
  const hasGreetedRef = useRef(false);
  useEffect(() => {
    if (viewMode === 'child' && !hasGreetedRef.current) {
      hasGreetedRef.current = true;
      const timer = setTimeout(() => {
        speak(
          `Gâu gâu! Chào bé ${childProfile.name}! Tớ là ${childProfile.puppyName} đây! Hôm nay bé của cún có vui không nào? Chúng mình cùng trò chuyện nhé!`
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [viewMode, childProfile, speak]);

  // Music Player Helper
  const handlePlayRandomMusic = useCallback(() => {
    if (musicTracks.length === 0) return;
    const randomTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)];
    setActiveMusicTitle(randomTrack.title);
    setPuppyMood('grooving');

    speak(
      `Gâu gâu! Cún mở bài hát "${randomTrack.title}" thật rộn ràng cho bé nghe nè! Bé cùng lắc lư với cún nhé! 🎵`,
      {
        onEnd: () => {
          playTrack(randomTrack, {
            onEnd: () => {
              setActiveMusicTitle(null);
              setPuppyMood('happy');
            },
          });
        },
      }
    );

    setLearningHistory((prev) => [
      {
        id: `music-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        type: 'music',
        title: `Nghe nhạc thiếu nhi: "${randomTrack.title}"`,
        detail: `Chú cún đã phát bài hát rộn ràng cho bé thưởng thức`,
      },
      ...prev,
    ]);
  }, [musicTracks, speak]);

  const handleStopCurrentMusic = useCallback(() => {
    stopMusic();
    setActiveMusicTitle(null);
    setPuppyMood('happy');
    speak(`Dạ, cún tắt nhạc rồi nè! Bé muốn trò chuyện hay học từ mới nào nữa không?`);
  }, [speak]);

  // Helper to prompt a daily English vocabulary word
  const triggerDailyVocabPrompt = useCallback(
    (targetWord?: EnglishWord) => {
      const unmastered = words.filter((w) => !w.mastered);
      const chosenWord =
        targetWord ||
        unmastered[Math.floor(Math.random() * unmastered.length)] ||
        words[0];

      if (!chosenWord) return;

      setActiveVocabPrompt({
        word: chosenWord.word,
        phonetic: chosenWord.phonetic,
        meaning: chosenWord.vietnamese,
        exampleSentence: chosenWord.exampleSentence,
        exampleVietnamese: chosenWord.exampleVietnamese,
        iconEmoji: chosenWord.iconEmoji,
        gentleCoachTip: chosenWord.gentleCoachingNotes,
        attemptCount: 0,
      });

      const speech = `Gâu gâu! Bé ơi, cún đố bé từ tiếng Anh này nhé: "${chosenWord.word}" - có nghĩa là ${chosenWord.vietnamese}! Bé đọc to theo cún nào: ${chosenWord.phonetic}!`;
      setPuppyMood('happy');
      speak(speech);
    },
    [words, speak]
  );

  // Main Voice Interaction Handler (Continuous loop)
  const handleChildSpeech = useCallback(
    async (spokenText: string) => {
      if (isProcessingAI || isSpeaking || !spokenText.trim()) return;

      setIsProcessingAI(true);
      setPuppyMood('thinking');
      turnCountRef.current += 1;

      const lower = spokenText.toLowerCase();

      // Check if child says stop music
      if (isMusicPlaying() || activeMusicTitle) {
        if (
          lower.includes('dừng nhạc') ||
          lower.includes('tắt nhạc') ||
          lower.includes('ngừng hát') ||
          lower.includes('thôi nhạc')
        ) {
          handleStopCurrentMusic();
          setIsProcessingAI(false);
          return;
        }
      }

      // Check if child asks for music
      if (
        lower.includes('mở nhạc') ||
        lower.includes('hát đi') ||
        lower.includes('nghe nhạc') ||
        lower.includes('bật nhạc') ||
        lower.includes('hát bài')
      ) {
        handlePlayRandomMusic();
        setIsProcessingAI(false);
        return;
      }

      // If active vocabulary prompt is currently waiting for child to pronounce
      if (activeVocabPrompt) {
        const target = activeVocabPrompt.word.toLowerCase();
        const spokenNormalized = lower.trim();

        // Check pronunciation match
        const isCloseMatch =
          spokenNormalized.includes(target) ||
          target.includes(spokenNormalized) ||
          (target === 'apple' && (spokenNormalized.includes('ép') || spokenNormalized.includes('áp'))) ||
          (target === 'puppy' && (spokenNormalized.includes('pắp') || spokenNormalized.includes('pơ')));

        if (isCloseMatch) {
          // Success!
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FF6B8B', '#F59E0B', '#10B981'],
          });

          setActiveVocabPrompt((prev) => (prev ? { ...prev, isCorrect: true } : null));
          setPuppyMood('dancing');

          // Mark word as mastered
          setWords((prev) =>
            prev.map((w) =>
              w.word.toLowerCase() === activeVocabPrompt.word.toLowerCase()
                ? { ...w, mastered: true, bestScore: 98 }
                : w
            )
          );

          const praise = `Gâu gâu! Bé phát âm chuẩn 100%! Cún vẫy đuôi hoan hô bé nè! Bé giỏi nhất luôn!`;
          speak(praise);

          setLearningHistory((prev) => [
            {
              id: `vocab-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              createdAt: Date.now(),
              type: 'english_practice',
              title: `Bé đọc chuẩn từ "${activeVocabPrompt.word}"`,
              detail: `Bé phát âm xuất sắc nghĩa là "${activeVocabPrompt.meaning}"`,
              score: 98,
              stars: 3,
            },
            ...prev,
          ]);

          setTimeout(() => {
            setActiveVocabPrompt(null);
            setPuppyMood('happy');
          }, 3000);

          setIsProcessingAI(false);
          return;
        } else {
          // Inaccurate pronunciation, spoke a different word, or Vietnamese
          // GENTLE & LOVING COACHING (Nắn chỉnh dịu dàng, khích lệ)
          const coachingTip =
            activeVocabPrompt.gentleCoachTip ||
            `Bé mím môi nhẹ rồi bật hơi chữ đầu nha! Bé nghe cún đọc lại thật chậm nè: ${activeVocabPrompt.phonetic}!`;

          setActiveVocabPrompt((prev) =>
            prev
              ? {
                  ...prev,
                  attemptCount: prev.attemptCount + 1,
                  gentleCoachTip: coachingTip,
                }
              : null
          );

          setPuppyMood('happy');
          const gentleReply = `Gâu gâu! Bé đọc gần đúng rồi nè! Cún chỉ mẹo nhỏ cho bé nhé: ${coachingTip} Bé đọc lại cùng cún nào: ${activeVocabPrompt.word}!`;
          speak(gentleReply);

          setLearningHistory((prev) => [
            {
              id: `vocab-coach-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              createdAt: Date.now(),
              type: 'english_practice',
              title: `Cún nắn chỉnh từ "${activeVocabPrompt.word}"`,
              detail: `Bé nói: "${spokenText}". Cún nhẹ nhàng hướng dẫn khẩu hình và mẹo nhớ.`,
            },
            ...prev,
          ]);

          setIsProcessingAI(false);
          return;
        }
      }

      // Check if child asks for a story from the knowledge vault
      const isAskingForStory =
        lower.includes('kể chuyện') ||
        lower.includes('đọc truyện') ||
        lower.includes('truyện cổ tích') ||
        lower.includes('đọc sách');

      let groundedStoryContext = '';
      if (isAskingForStory || stories.length > 0) {
        const matched = stories.find((s) => lower.includes(s.title.toLowerCase()));
        if (matched) {
          groundedStoryContext = `Truyện "${matched.title}": ${matched.content}`;
        } else {
          groundedStoryContext = `Kho truyện: ${stories
            .slice(0, 3)
            .map((s) => s.title)
            .join(', ')}`;
        }
      }

      try {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: spokenText,
            puppyName: childProfile.puppyName,
            childName: childProfile.name,
            childAge: childProfile.age,
            mode: isAskingForStory ? 'story' : 'general',
            context: groundedStoryContext,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.reply || `Gâu gâu! Bé ${childProfile.name} nói cún nghe rõ rồi nè!`;

          setPuppyMood((data.emotion as PuppyMood) || 'happy');
          speak(reply);

          // If child asked for music and AI detected it
          if (data.wantsMusic) {
            handlePlayRandomMusic();
            setIsProcessingAI(false);
            return;
          }

          // If the interaction has reached 2-3 turns and no active prompt yet,
          // automatically introduce today's English word to the child!
          if (turnCountRef.current >= 2 && !activeVocabPrompt) {
            setTimeout(() => {
              triggerDailyVocabPrompt();
            }, 4500);
          }

          // Record interaction in Parent history
          setLearningHistory((prev) => [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              createdAt: Date.now(),
              type: 'chat',
              title: `Bé nói: "${spokenText.slice(0, 35)}..."`,
              detail: `Cún đáp: "${reply.slice(0, 80)}..."`,
              score: 95,
              stars: 3,
            },
            ...prev,
          ]);
        } else {
          throw new Error('Chat API returned error');
        }
      } catch (err) {
        console.warn('Voice AI fallback:', err);
        const fallback = `Gâu gâu! ${childProfile.puppyName} đang lắng nghe bé nè! Bé kể tiếp cho cún nghe đi!`;
        setPuppyMood('happy');
        speak(fallback);
      } finally {
        setIsProcessingAI(false);
      }
    },
    [
      isProcessingAI,
      isSpeaking,
      activeVocabPrompt,
      activeMusicTitle,
      childProfile,
      stories,
      handleStopCurrentMusic,
      handlePlayRandomMusic,
      triggerDailyVocabPrompt,
      speak,
    ]
  );

  // Continuous hands-free voice hook for child
  const { isListening, speechDetected } = useContinuousVoice({
    onChildSpeechEnd: handleChildSpeech,
    isSpeaking,
    enabled: viewMode === 'child',
  });

  // Petting the puppy (cycles through sweet playful actions)
  const petActionIndexRef = useRef(0);
  const handlePetPuppy = () => {
    const joyfulActions: { mood: PuppyMood; phrase: string }[] = [
      {
        mood: 'waving',
        phrase: `Gâu gâu! ${childProfile.puppyName} vẫy chân chào bé ${childProfile.name} yêu quý nè!`,
      },
      {
        mood: 'playing_ball',
        phrase: `Gâu gâu! Bé xem cún tâng bóng bổng lên trời cao nè! Vui quá!`,
      },
      {
        mood: 'dancing',
        phrase: `Gâu gâu! Cún lắc lư nhảy theo điệu nhạc tặng riêng cho bé nè!`,
      },
      {
        mood: 'laughing',
        phrase: `Hi hi! Bé xoa đầu làm cún nhột quá, cún cười tít mắt luôn rồi nè!`,
      },
    ];

    const action = joyfulActions[petActionIndexRef.current % joyfulActions.length];
    petActionIndexRef.current += 1;

    setPuppyMood(action.mood);
    speak(action.phrase);
    setTimeout(() => {
      setPuppyMood('happy');
    }, 2800);
  };

  return (
    <div className="w-full h-full min-h-screen">
      {/* 1. CHILD PURE VOICE VIEW */}
      {viewMode === 'child' && (
        <ChildPureVoiceView
          puppyName={childProfile.puppyName}
          puppyMood={puppyMood}
          isSpeaking={isSpeaking}
          isListening={isListening}
          speechDetected={speechDetected}
          puppyCostume={puppyCostume}
          onPetPuppy={handlePetPuppy}
          onRequestParentOpen={() => setShowPinModal(true)}
          activeVocabPrompt={activeVocabPrompt}
          onPlayVocabAudio={(word) => speak(word, { lang: 'en-US' })}
          onDismissVocabPrompt={() => setActiveVocabPrompt(null)}
          activeMusicTitle={activeMusicTitle}
          onStopMusic={handleStopCurrentMusic}
        />
      )}

      {/* 2. PARENT STUDIO VIEW (4 Vaults, Security Auto-Delete, Voice, Progress) */}
      {viewMode === 'parent' && (
        <ParentStudioView
          onBackToChildView={() => {
            stop();
            setViewMode('child');
          }}
          childProfile={childProfile}
          onUpdateChildProfile={setChildProfile}
          voiceSettings={voiceSettings}
          onUpdateVoiceSettings={setVoiceSettings}
          stories={stories}
          onAddStory={(newStory) => setStories((prev) => [newStory, ...prev])}
          onDeleteStory={(id) => setStories((prev) => prev.filter((s) => s.id !== id))}
          musicTracks={musicTracks}
          onAddMusicTrack={(track) => setMusicTracks((prev) => [track, ...prev])}
          onDeleteMusicTrack={(id) => setMusicTracks((prev) => prev.filter((m) => m.id !== id))}
          words={words}
          onAddWord={(word) => setWords((prev) => [word, ...prev])}
          onDeleteWord={(id) => setWords((prev) => prev.filter((w) => w.id !== id))}
          history={learningHistory}
          onClearHistory={() => setLearningHistory([])}
          securitySettings={securitySettings}
          onUpdateSecuritySettings={setSecuritySettings}
          puppyCostume={puppyCostume}
          onUpdatePuppyCostume={setPuppyCostume}
          onTestSpeak={(text) => speak(text)}
          isSpeaking={isSpeaking}
          onPlayMusicTrack={(track) => playTrack(track)}
          onStopMusic={stopMusic}
          isMusicPlaying={isMusicPlaying()}
        />
      )}

      {/* 3. SECRET PARENT PIN MODAL (Triggered by 3s long-press in top-right corner) */}
      <ParentPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        savedPin={securitySettings.parentPin}
        onSuccess={() => {
          setShowPinModal(false);
          stop();
          setViewMode('parent');
        }}
      />
    </div>
  );
}
