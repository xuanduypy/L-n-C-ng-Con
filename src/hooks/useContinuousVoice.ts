import { useState, useEffect, useRef, useCallback } from 'react';

interface ContinuousVoiceOptions {
  onChildSpeechEnd: (spokenText: string) => void;
  isSpeaking: boolean;
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
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRunningRef = useRef(false);
  const shouldListenRef = useRef(enabled);
  const isSpeakingRef = useRef(isSpeaking);
  const speechTimeoutRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const textBufferRef = useRef('');

  isSpeakingRef.current = isSpeaking;
  shouldListenRef.current = enabled;

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Request explicit mic permission on user gesture (tap/touch)
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicPermissionGranted(true);
        return true;
      }
    } catch (err) {
      console.warn('Microphone permission not granted:', err);
      setMicPermissionGranted(false);
      return false;
    }
    setMicPermissionGranted(true);
    return true;
  }, []);

  const safeStopRecognition = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (recognitionRef.current && isRunningRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
    }
    isRunningRef.current = false;
    setIsListening(false);
    setSpeechDetected(false);
    textBufferRef.current = '';
  }, []);

  const safeStartRecognition = useCallback(() => {
    if (!isSupported || !shouldListenRef.current || isSpeakingRef.current) {
      return;
    }

    if (isRunningRef.current) {
      return; // Already running, do not re-start to avoid InvalidStateError
    }

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) return;

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.lang = 'vi-VN';
      // continuous = false prevents Android Chrome speech engine from hanging after 1st sentence
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isRunningRef.current = true;
        setIsListening(true);
        setMicPermissionGranted(true);
      };

      recognition.onresult = (event: any) => {
        if (isSpeakingRef.current) return;

        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += ' ' + trans;
          } else {
            interim += ' ' + trans;
          }
        }

        if (finalChunk) {
          textBufferRef.current = (textBufferRef.current + ' ' + finalChunk).trim();
        }

        const candidateText = (textBufferRef.current + ' ' + interim).trim();

        if (candidateText) {
          setSpeechDetected(true);
          setCurrentSpokenText(candidateText);

          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }

          // Trigger speech response after baby stops speaking for 1.1s
          speechTimeoutRef.current = setTimeout(() => {
            const finalSpeech = (textBufferRef.current + ' ' + interim).trim();
            if (finalSpeech.length >= 2) {
              textBufferRef.current = '';
              setCurrentSpokenText('');
              setSpeechDetected(false);
              onChildSpeechEnd(finalSpeech);
            }
          }, 1100);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.warn('Mic permission required:', event.error);
          setMicPermissionGranted(false);
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('SpeechRecognition event error:', event.error);
        }
        isRunningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        isRunningRef.current = false;
        setIsListening(false);

        // If there was buffered text that hadn't fired yet
        if (textBufferRef.current.trim().length >= 2) {
          const pending = textBufferRef.current.trim();
          textBufferRef.current = '';
          setCurrentSpokenText('');
          setSpeechDetected(false);
          onChildSpeechEnd(pending);
          return;
        }

        // Loop: Immediately restart listening if enabled and not currently speaking
        if (shouldListenRef.current && !isSpeakingRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (shouldListenRef.current && !isSpeakingRef.current) {
              safeStartRecognition();
            }
          }, 150);
        }
      };

      recognition.start();
    } catch (err: any) {
      isRunningRef.current = false;
      setIsListening(false);
      if (err.name !== 'InvalidStateError') {
        console.warn('Recognition start error:', err);
      }
    }
  }, [isSupported, onChildSpeechEnd]);

  // Pause listening when puppy is speaking
  useEffect(() => {
    if (isSpeaking) {
      safeStopRecognition();
    } else if (enabled) {
      const timer = setTimeout(() => {
        safeStartRecognition();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, enabled, safeStartRecognition, safeStopRecognition]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      safeStopRecognition();
    };
  }, [safeStopRecognition]);

  // Manual wake-up trigger on child screen tap
  const wakeUpVoice = useCallback(async () => {
    await requestMicPermission();
    safeStopRecognition();
    setTimeout(() => {
      safeStartRecognition();
    }, 200);
  }, [requestMicPermission, safeStopRecognition, safeStartRecognition]);

  return {
    isListening,
    speechDetected,
    currentSpokenText,
    micPermissionGranted,
    requestMicPermission,
    wakeUpVoice,
    startRecognition: safeStartRecognition,
    stopRecognition: safeStopRecognition,
    isSupported,
  };
}
