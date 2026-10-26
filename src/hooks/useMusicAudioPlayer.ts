import { useState, useEffect, useRef, useCallback } from 'react';
import { MusicTrack } from '../types/book';
import { INITIAL_MUSIC_TRACKS } from '../data/initialMusicTracks';

const STORAGE_MUSIC_KEY = 'audiobookify_music_tracks';
const STORAGE_LAST_TRACK_KEY = 'audiobookify_last_track_id';

const NOTE_FREQS: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  REST: 0,
};

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function useMusicAudioPlayer(onMusicPlayStart?: () => void) {
  const [tracks, setTracks] = useState<MusicTrack[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MUSIC_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize: expired blob URLs cannot be decoded after page reload
          return parsed.map((t: MusicTrack) => {
            if (t.audioUrl && typeof t.audioUrl === 'string' && t.audioUrl.startsWith('blob:')) {
              return {
                ...t,
                audioUrl: undefined,
                notes:
                  t.notes && t.notes.length > 0
                    ? t.notes
                    : [
                        { note: 'C4', duration: 0.4 },
                        { note: 'E4', duration: 0.4 },
                        { note: 'G4', duration: 0.6 },
                        { note: 'C5', duration: 0.8 },
                      ],
              };
            }
            return t;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load music tracks from localStorage:', e);
    }
    return INITIAL_MUSIC_TRACKS;
  });

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [loopMode, setLoopMode] = useState<'off' | 'track' | 'all'>('all');

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const synthTimeoutsRef = useRef<any[]>([]);
  const synthProgressIntervalRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentTrackRef = useRef<MusicTrack | null>(null);
  const tracksRef = useRef<MusicTrack[]>(tracks);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const loopModeRef = useRef<'off' | 'track' | 'all'>(loopMode);
  const shuffleHistoryRef = useRef<string[]>([]);
  const handleNextTrackRef = useRef<() => void>(() => {});

  // Sync refs
  useEffect(() => {
    isPlayingRef.current = isPlayingMusic;
  }, [isPlayingMusic]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  // Persist tracks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MUSIC_KEY, JSON.stringify(tracks));
    } catch (e) {
      console.warn('Failed to save music tracks:', e);
    }
  }, [tracks]);

  // Restore last track
  useEffect(() => {
    if (tracks.length === 0 || currentTrack) return;
    try {
      const lastId = localStorage.getItem(STORAGE_LAST_TRACK_KEY);
      const matched = tracks.find((t) => t.id === lastId) || tracks[0];
      if (matched) {
        setCurrentTrack(matched);
        currentTrackRef.current = matched;
        setDurationSec(matched.durationSec || 60);
      }
    } catch {}
  }, [tracks, currentTrack]);

  // Stop active music (both audio element and synthesized notes)
  const stopAllAudio = useCallback(() => {
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {}
      audioElementRef.current = null;
    }
    synthTimeoutsRef.current.forEach((t) => clearTimeout(t));
    synthTimeoutsRef.current = [];
    if (synthProgressIntervalRef.current) {
      clearInterval(synthProgressIntervalRef.current);
      synthProgressIntervalRef.current = null;
    }
  }, []);

  // Play synthesized melody using Web Audio API
  const playSynthesizedTrack = useCallback(
    (track: MusicTrack, startFromSec: number = 0) => {
      stopAllAudio();
      const notes = track.notes || [];
      if (notes.length === 0) return;

      const ctx = getAudioContext();
      setIsPlayingMusic(true);
      isPlayingRef.current = true;
      setCurrentTimeSec(startFromSec);

      const totalDuration = track.durationSec || notes.reduce((sum, n) => sum + n.duration, 0);
      setDurationSec(totalDuration);

      // Start scrubber timer
      const startTime = Date.now() - startFromSec * 1000;
      synthProgressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= totalDuration) {
          if (loopModeRef.current === 'track') {
            playSynthesizedTrack(track, 0);
          } else {
            handleNextTrackRef.current?.();
          }
        } else {
          setCurrentTimeSec(Math.round(elapsed));
        }
      }, 500);

      let accumulated = 0;
      notes.forEach((item) => {
        const noteStartTime = accumulated;
        accumulated += item.duration;

        if (noteStartTime < startFromSec) return;

        const delay = noteStartTime - startFromSec;
        const timeout = setTimeout(() => {
          if (!isPlayingRef.current) return;
          const freq = NOTE_FREQS[item.note] || 0;
          if (freq > 0) {
            try {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();

              // Warm xylophone/bell sound for kids
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, ctx.currentTime);

              gain.gain.setValueAtTime(0.25, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.duration * 0.95);

              osc.connect(gain);
              gain.connect(ctx.destination);

              osc.start();
              osc.stop(ctx.currentTime + item.duration);
            } catch (err) {
              console.warn('Synth error:', err);
            }
          }
        }, delay * 1000);

        synthTimeoutsRef.current.push(timeout);
      });
    },
    [stopAllAudio]
  );

  // Play audio file track with robust source error handling & synthesizer fallback
  const playAudioFileTrack = useCallback(
    (track: MusicTrack, startFromSec: number = 0) => {
      stopAllAudio();
      if (!track.audioUrl || typeof track.audioUrl !== 'string' || !track.audioUrl.trim()) {
        if (track.notes && track.notes.length > 0) {
          playSynthesizedTrack(track, startFromSec);
        }
        return;
      }

      try {
        const audio = new Audio();
        audioElementRef.current = audio;
        audio.preload = 'metadata';

        // Error handling attached BEFORE setting src
        audio.onerror = (e) => {
          if (typeof e !== 'string') e?.preventDefault?.();
          console.warn('Audio source error, transitioning to synth melody:', track.title);
          if (audioElementRef.current === audio) {
            audioElementRef.current = null;
          }
          if (track.notes && track.notes.length > 0) {
            playSynthesizedTrack(track, 0);
          } else {
            setIsPlayingMusic(false);
          }
        };

        audio.onloadedmetadata = () => {
          const dur = Math.round(audio.duration) || track.durationSec || 60;
          setDurationSec(dur);
          if (startFromSec > 0 && audio.duration && startFromSec < audio.duration) {
            try {
              audio.currentTime = startFromSec;
            } catch {}
          }
        };

        audio.ontimeupdate = () => {
          setCurrentTimeSec(Math.round(audio.currentTime));
        };

        audio.onended = () => {
          if (loopModeRef.current === 'track') {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          } else {
            handleNextTrackRef.current?.();
          }
        };

        // Assign source
        audio.src = track.audioUrl;
        setCurrentTimeSec(startFromSec);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlayingMusic(true);
              isPlayingRef.current = true;
            })
            .catch((e) => {
              console.warn('Audio play rejection, fallback to synth:', e);
              if (track.notes && track.notes.length > 0) {
                playSynthesizedTrack(track, 0);
              } else {
                setIsPlayingMusic(false);
              }
            });
        }
      } catch (err) {
        console.warn('Failed to initialize audio element, playing synth:', err);
        if (track.notes && track.notes.length > 0) {
          playSynthesizedTrack(track, 0);
        } else {
          setIsPlayingMusic(false);
        }
      }
    },
    [playSynthesizedTrack, stopAllAudio]
  );

  // Increment playCount for track
  const recordTrackPlay = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, playCount: (t.playCount || 0) + 1 } : t
      )
    );
  }, []);

  // Unified Play Track method
  const playTrack = useCallback(
    (track: MusicTrack) => {
      onMusicPlayStart?.();
      setCurrentTrack(track);
      currentTrackRef.current = track;
      recordTrackPlay(track.id);

      // Track in shuffle history
      if (!shuffleHistoryRef.current.includes(track.id)) {
        shuffleHistoryRef.current.push(track.id);
      }

      try {
        localStorage.setItem(STORAGE_LAST_TRACK_KEY, track.id);
      } catch {}

      if (track.audioUrl) {
        playAudioFileTrack(track, 0);
      } else if (track.notes && track.notes.length > 0) {
        playSynthesizedTrack(track, 0);
      } else {
        // Fallback placeholder duration
        setIsPlayingMusic(true);
        setDurationSec(track.durationSec || 60);
      }
    },
    [onMusicPlayStart, playAudioFileTrack, playSynthesizedTrack, recordTrackPlay]
  );

  // Pause music
  const pauseMusic = useCallback(() => {
    setIsPlayingMusic(false);
    isPlayingRef.current = false;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    synthTimeoutsRef.current.forEach((t) => clearTimeout(t));
    synthTimeoutsRef.current = [];
    if (synthProgressIntervalRef.current) {
      clearInterval(synthProgressIntervalRef.current);
      synthProgressIntervalRef.current = null;
    }
  }, []);

  // Resume music
  const resumeMusic = useCallback(() => {
    if (!currentTrack) {
      if (tracks[0]) playTrack(tracks[0]);
      return;
    }
    onMusicPlayStart?.();
    if (currentTrack.audioUrl) {
      if (audioElementRef.current) {
        audioElementRef.current
          .play()
          .then(() => setIsPlayingMusic(true))
          .catch((e) => {
            console.warn('Resume audio play error, restarting track:', e);
            playAudioFileTrack(currentTrack, currentTimeSec);
          });
      } else {
        playAudioFileTrack(currentTrack, currentTimeSec);
      }
    } else if (currentTrack.notes && currentTrack.notes.length > 0) {
      playSynthesizedTrack(currentTrack, currentTimeSec);
    }
  }, [currentTrack, currentTimeSec, onMusicPlayStart, playAudioFileTrack, playSynthesizedTrack, playTrack, tracks]);

  // Toggle play/pause
  const togglePlayMusic = useCallback(() => {
    if (isPlayingMusic) {
      pauseMusic();
    } else {
      resumeMusic();
    }
  }, [isPlayingMusic, pauseMusic, resumeMusic]);

  // Next Track with robust Shuffle support
  const handleNextTrack = useCallback(() => {
    const allTracks = tracksRef.current;
    if (allTracks.length === 0) return;

    if (allTracks.length === 1) {
      playTrack(allTracks[0]);
      return;
    }

    if (isShuffleRef.current) {
      const currentId = currentTrackRef.current?.id;
      // All tracks other than current track that haven't been played in this shuffle cycle
      let candidates = allTracks.filter(
        (t) => t.id !== currentId && !shuffleHistoryRef.current.includes(t.id)
      );

      // If all tracks have been played in this cycle, reset history and choose from all other tracks
      if (candidates.length === 0) {
        shuffleHistoryRef.current = currentId ? [currentId] : [];
        candidates = allTracks.filter((t) => t.id !== currentId);
      }

      // If still empty (e.g. edge cases), fallback to allTracks
      if (candidates.length === 0) {
        candidates = allTracks;
      }

      // Pick randomly from candidate tracks
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const chosenTrack = candidates[randomIndex];
      playTrack(chosenTrack);
    } else {
      // Sequential playback
      const currentId = currentTrackRef.current?.id;
      const idx = allTracks.findIndex((t) => t.id === currentId);
      let nextIndex = 0;
      if (idx !== -1) {
        if (idx + 1 < allTracks.length) {
          nextIndex = idx + 1;
        } else {
          // Reached end of playlist
          if (loopModeRef.current === 'off') {
            stopAllAudio();
            setIsPlayingMusic(false);
            return;
          }
          nextIndex = 0;
        }
      }
      playTrack(allTracks[nextIndex]);
    }
  }, [playTrack, stopAllAudio]);

  // Keep handleNextTrackRef in sync
  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  // Previous Track
  const handlePrevTrack = useCallback(() => {
    const allTracks = tracksRef.current;
    if (allTracks.length === 0) return;

    if (currentTimeSec > 3) {
      // If played more than 3s, restart current track
      if (currentTrackRef.current) {
        playTrack(currentTrackRef.current);
      }
      return;
    }

    // In shuffle mode, if we have history, go to previously played song
    if (isShuffleRef.current && shuffleHistoryRef.current.length > 1) {
      shuffleHistoryRef.current.pop(); // Remove current song
      const prevTrackId = shuffleHistoryRef.current[shuffleHistoryRef.current.length - 1];
      const prevTrack = allTracks.find((t) => t.id === prevTrackId);
      if (prevTrack) {
        playTrack(prevTrack);
        return;
      }
    }

    // Default sequential previous
    const currentId = currentTrackRef.current?.id;
    const idx = allTracks.findIndex((t) => t.id === currentId);
    const prevIndex = idx > 0 ? idx - 1 : allTracks.length - 1;
    playTrack(allTracks[prevIndex]);
  }, [currentTimeSec, playTrack]);

  // Toggle Shuffle with history reset
  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      isShuffleRef.current = next;
      if (next) {
        shuffleHistoryRef.current = currentTrackRef.current ? [currentTrackRef.current.id] : [];
      }
      return next;
    });
  }, []);

  // Seek track
  const seekTrack = useCallback(
    (targetSec: number) => {
      const clamped = Math.max(0, Math.min(durationSec, targetSec));
      setCurrentTimeSec(clamped);

      if (audioElementRef.current) {
        audioElementRef.current.currentTime = clamped;
      } else if (isPlayingRef.current && currentTrackRef.current) {
        playSynthesizedTrack(currentTrackRef.current, clamped);
      }
    },
    [durationSec, playSynthesizedTrack]
  );

  // Sync with navigator.mediaSession for Lock Screen & Background playback
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || 'DiNo Music',
        album: currentTrack.albumTitle || 'DiNo - Kho Nhạc Thiếu Nhi',
        artwork: [
          { src: currentTrack.coverUrl || '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.playbackState = isPlayingMusic ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => {
        resumeMusic();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pauseMusic();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextTrackRef.current?.();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seekTrack(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('Error configuring mediaSession:', err);
    }
  }, [currentTrack, isPlayingMusic, pauseMusic, resumeMusic, seekTrack, handlePrevTrack]);

  // Add custom track
  const addCustomTrack = useCallback((newTrack: MusicTrack) => {
    setTracks((prev) => [newTrack, ...prev]);
  }, []);

  // Delete track
  const deleteTrack = useCallback(
    (trackId: string) => {
      if (currentTrack?.id === trackId) {
        pauseMusic();
      }
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    },
    [currentTrack?.id, pauseMusic]
  );

  // Toggle favorite
  const toggleFavoriteTrack = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    setCurrentTrack((prev) =>
      prev && prev.id === trackId ? { ...prev, isFavorite: !prev.isFavorite } : prev
    );
  }, []);

  // Play a random track directly and ensure shuffle mode is engaged
  const playRandomTrack = useCallback(() => {
    setIsShuffle(true);
    isShuffleRef.current = true;
    const allTracks = tracksRef.current;
    if (allTracks.length === 0) return;
    if (allTracks.length === 1) {
      playTrack(allTracks[0]);
      return;
    }
    const currentId = currentTrackRef.current?.id;
    const candidates = allTracks.filter((t) => t.id !== currentId);
    const pool = candidates.length > 0 ? candidates : allTracks;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    shuffleHistoryRef.current = currentId ? [currentId, chosen.id] : [chosen.id];
    playTrack(chosen);
  }, [playTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  return {
    tracks,
    currentTrack,
    isPlayingMusic,
    currentTimeSec,
    durationSec,
    isShuffle,
    loopMode,
    playTrack,
    playRandomTrack,
    pauseMusic,
    resumeMusic,
    togglePlayMusic,
    nextTrack: handleNextTrack,
    prevTrack: handlePrevTrack,
    seekTrack,
    toggleShuffle,
    toggleLoop: () =>
      setLoopMode((prev) => (prev === 'off' ? 'track' : prev === 'track' ? 'all' : 'off')),
    addCustomTrack,
    deleteTrack,
    toggleFavoriteTrack,
    setCurrentTrack,
  };
}
