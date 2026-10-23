import { useState, useEffect, useRef, useCallback } from 'react';

interface ContinuousVoiceOptions {
  onChildSpeechEnd: (spokenText: string) => void;
  isSpeaking: boolean; // Puppy is currently speaking (so we pause listening)
  enabled?: boolean;
}

export function useContinuousVoice({
  onChildSpeechEnd,
  isSpeaking,
  enabled = true,
}: ContinuousVoiceOptions) {
  const [isListening, setIsListening] = useState(false);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<any>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const enabledRef = useRef(enabled);
  const textBufferRef = useRef('');

  isSpeakingRef.current = isSpeaking;
  enabledRef.current = enabled;

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startRecognition = useCallback(() => {
    if (!isSupported || !enabledRef.current || isSpeakingRef.current) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (isSpeakingRef.current) return; // Ignore audio loopback from speaker

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            textBufferRef.current += ' ' + trans;
          } else {
            interim += ' ' + trans;
          }
        }

        const fullSpoken = (textBufferRef.current + ' ' + interim).trim();
        if (fullSpoken) {
          setSpeechDetected(true);
          setCurrentSpokenText(fullSpoken);

          // Clear previous silence timeout
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }

          // When child pauses speaking for 1.3 seconds, trigger puppy response
          speechTimeoutRef.current = setTimeout(() => {
            const finalSpeech = (textBufferRef.current + ' ' + interim).trim();
            if (finalSpeech.length >= 2) {
              textBufferRef.current = '';
              setCurrentSpokenText('');
              setSpeechDetected(false);
              onChildSpeechEnd(finalSpeech);
            }
          }, 1300);
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' is normal during silence, keep going
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Continuous speech error:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart listening if still enabled and puppy isn't speaking
        if (enabledRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (enabledRef.current && !isSpeakingRef.current) {
              startRecognition();
            }
          }, 300);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start continuous speech recognition:', err);
      setIsListening(false);
    }
  }, [isSupported, onChildSpeechEnd]);

  const stopRecognition = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setSpeechDetected(false);
    textBufferRef.current = '';
  }, []);

  // When puppy speaks, pause listening so puppy doesn't hear itself
  useEffect(() => {
    if (isSpeaking) {
      stopRecognition();
    } else if (enabled) {
      const timer = setTimeout(() => {
        startRecognition();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, enabled, startRecognition, stopRecognition]);

  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  return {
    isListening,
    speechDetected,
    currentSpokenText,
    startRecognition,
    stopRecognition,
    isSupported,
  };
}
