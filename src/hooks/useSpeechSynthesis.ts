import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings } from '../types';
import { VOICE_PRESETS } from '../data/defaultData';

interface SpeechSynthesisHookResult {
  isSpeaking: boolean;
  currentText: string | null;
  speak: (text: string, options?: { lang?: string; onEnd?: () => void }) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  availableVoices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(settings: VoiceSettings): SpeechSynthesisHookResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Load available browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentText(null);
  }, []);

  const pause = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setIsSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.play();
      setIsSpeaking(true);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  }, []);

  const speakWithBrowserTTS = useCallback(
    (text: string, options?: { lang?: string; onEnd?: () => void }) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        options?.onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      // Clean text of markdown characters or asterisks
      const cleanText = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/🐾|⭐|🐶|🍎|❤️|✨/g, '')
        .trim();

      if (!cleanText) {
        options?.onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const isEnglish = options?.lang === 'en' || options?.lang === 'en-US' || /^[A-Za-z0-9\s.,!?'"()-]+$/.test(cleanText.slice(0, 30));

      // Select voice based on language and preset
      const targetLang = isEnglish ? 'en' : 'vi';
      const matchedVoice =
        availableVoices.find((v) => v.lang.toLowerCase().startsWith(targetLang)) ||
        availableVoices.find((v) => v.lang.toLowerCase().includes('vi')) ||
        availableVoices[0];

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.pitch = settings.pitch;
      utterance.rate = settings.rate;
      utterance.volume = settings.volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentText(cleanText);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentText(null);
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        setCurrentText(null);
        options?.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, settings]
  );

  const speak = useCallback(
    async (text: string, options?: { lang?: string; onEnd?: () => void }) => {
      stop();

      const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
      if (!cleanText) {
        options?.onEnd?.();
        return;
      }

      // If user selected Gemini TTS engine:
      if (settings.engine === 'gemini_tts') {
        try {
          const preset = VOICE_PRESETS.find((p) => p.id === settings.presetId);
          const cacheKey = `${settings.geminiVoice}_${cleanText.slice(0, 100)}`;

          let base64Audio = audioCacheRef.current.get(cacheKey);

          if (!base64Audio) {
            const res = await fetch('/api/gemini/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: cleanText.slice(0, 350),
                voiceName: settings.geminiVoice || preset?.geminiVoice || 'Kore',
                style: preset?.geminiStylePrompt || 'Warm bedtime storyteller for small kids',
              }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.audioBase64 && typeof data.audioBase64 === 'string') {
                base64Audio = data.audioBase64;
                audioCacheRef.current.set(cacheKey, data.audioBase64);
              }
            }
          }

          if (base64Audio) {
            const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
            currentAudioRef.current = audio;

            audio.onplay = () => {
              setIsSpeaking(true);
              setCurrentText(cleanText);
            };

            audio.onended = () => {
              setIsSpeaking(false);
              setCurrentText(null);
              currentAudioRef.current = null;
              options?.onEnd?.();
            };

            audio.onerror = () => {
              console.warn('Audio playback error, falling back to browser TTS');
              speakWithBrowserTTS(text, options);
            };

            await audio.play();
            return;
          }
        } catch (err) {
          console.warn('Gemini TTS failed, falling back to Web Speech API:', err);
        }
      }

      // Default or fallback to Browser TTS
      speakWithBrowserTTS(text, options);
    },
    [settings, stop, speakWithBrowserTTS]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSpeaking,
    currentText,
    speak,
    stop,
    pause,
    resume,
    availableVoices,
  };
}
