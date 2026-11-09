import { useState, useEffect, useRef, useCallback } from 'react';
import { MusicTrack } from '../types/book';
import { INITIAL_MUSIC_TRACKS } from '../data/initialMusicTracks';
import { getAudioObjectUrl, deleteAudioBlob } from '../utils/audioVault';

const STORAGE_MUSIC_KEY = 'audiobookify_music_tracks';
const STORAGE_LAST_TRACK_KEY = 'audiobookify_last_track_id';
const STORAGE_VOLUME_KEY = 'audiobookify_player_volume';
const STORAGE_MUTED_KEY = 'audiobookify_player_muted';

const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98,
  REST: 0,
};

let audioCtx: AudioContext | null = null;
let compressorNode: DynamicsCompressorNode | null = null;
let masterGainNode: GainNode | null = null;

function getAudioContext(): { ctx: AudioContext; compressor: DynamicsCompressorNode; masterGain: GainNode } {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();

    // Studio Dynamics Compressor: Prevents clipping, balances loudness
    compressorNode = audioCtx.createDynamicsCompressor();
    compressorNode.threshold.setValueAtTime(-18, audioCtx.currentTime);
    compressorNode.knee.setValueAtTime(12, audioCtx.currentTime);
    compressorNode.ratio.setValueAtTime(3.5, audioCtx.currentTime);
    compressorNode.attack.setValueAtTime(0.003, audioCtx.currentTime);
    compressorNode.release.setValueAtTime(0.25, audioCtx.currentTime);

    // Master Gain
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(0.85, audioCtx.currentTime);

    // Audio Graph: Compressor -> MasterGain -> Destination
    compressorNode.connect(masterGainNode);
    masterGainNode.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return { ctx: audioCtx, compressor: compressorNode!, masterGain: masterGainNode! };
}

export function useMusicAudioPlayer(onMusicPlayStart?: () => void) {
  const [tracks, setTracks] = useState<MusicTrack[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MUSIC_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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

  // Volume & Mute state
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOLUME_KEY);
      if (saved) return Math.max(0, Math.min(1, parseFloat(saved)));
    } catch {}
    return 0.85;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MUTED_KEY);
      if (saved) return saved === 'true';
    } catch {}
    return false;
  });

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const synthTimeoutsRef = useRef<any[]>([]);
  const synthProgressIntervalRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentTrackRef = useRef<MusicTrack | null>(null);
  const tracksRef = useRef<MusicTrack[]>(tracks);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const loopModeRef = useRef<'off' | 'track' | 'all'>(loopMode);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);
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

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Hydrate custom tracks from IndexedDB vault on mount
  useEffect(() => {
    let isCancelled = false;

    async function hydrateVaultAudio() {
      const updated = await Promise.all(
        tracks.map(async (t) => {
          if (t.hasBlobInVault || t.id.startsWith('custom-')) {
            const vaultUrl = await getAudioObjectUrl(t.id);
            if (vaultUrl) {
              return { ...t, audioUrl: vaultUrl, hasBlobInVault: true };
            }
          }
          return t;
        })
      );

      if (!isCancelled) {
        setTracks(updated);
      }
    }

    hydrateVaultAudio();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Persist tracks safely (Strip large base64 or temporary blobs to prevent QuotaExceededError)
  useEffect(() => {
    try {
      const serialized = tracks.map((t) => {
        // If track has audio in IndexedDB vault, omit audioUrl from localStorage JSON
        if (t.hasBlobInVault) {
          return {
            ...t,
            audioUrl: undefined,
          };
        }
        // If track has a large base64 string (> 200KB), omit to protect localStorage
        if (t.audioUrl && t.audioUrl.startsWith('data:') && t.audioUrl.length > 200000) {
          return {
            ...t,
            audioUrl: undefined,
          };
        }
        return t;
      });

      localStorage.setItem(STORAGE_MUSIC_KEY, JSON.stringify(serialized));
    } catch (e) {
      console.warn('Failed to save music tracks to localStorage:', e);
    }
  }, [tracks]);

  // Set Volume
  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    volumeRef.current = clamped;

    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, clamped.toString());
    } catch {}

    const effectiveVol = isMutedRef.current ? 0 : clamped;

    if (audioElementRef.current) {
      audioElementRef.current.volume = effectiveVol;
      audioElementRef.current.muted = isMutedRef.current;
    }

    if (masterGainNode && audioCtx) {
      masterGainNode.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);
    }
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;

      try {
        localStorage.setItem(STORAGE_MUTED_KEY, next ? 'true' : 'false');
      } catch {}

      const effectiveVol = next ? 0 : volumeRef.current;

      if (audioElementRef.current) {
        audioElementRef.current.muted = next;
        audioElementRef.current.volume = effectiveVol;
      }

      if (masterGainNode && audioCtx) {
        masterGainNode.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);
      }

      return next;
    });
  }, []);

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

  // Stop active music (both audio element and synthesized notes) with gentle release
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

  // Play synthesized melody using Web Audio API with Acoustic Chime Warmth
  const playSynthesizedTrack = useCallback(
    (track: MusicTrack, startFromSec: number = 0) => {
      stopAllAudio();
      const notes = track.notes || [];
      if (notes.length === 0) return;

      const { ctx, compressor } = getAudioContext();
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

      const effectiveVolume = isMutedRef.current ? 0 : volumeRef.current;

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
              // Fundamental Tone (Warm sine/triangle)
              const osc1 = ctx.createOscillator();
              const osc2 = ctx.createOscillator(); // 2nd harmonic overtone for acoustic body
              const noteGain = ctx.createGain();

              osc1.type = 'triangle';
              osc1.frequency.setValueAtTime(freq, ctx.currentTime);

              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);

              const peakGain = 0.22 * effectiveVolume;
              noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
              noteGain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + 0.02);
              noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + item.duration * 0.95);

              osc1.connect(noteGain);
              osc2.connect(noteGain);
              noteGain.connect(compressor);

              osc1.start();
              osc2.start();
              osc1.stop(ctx.currentTime + item.duration);
              osc2.stop(ctx.currentTime + item.duration);
            } catch (err) {
              console.warn('Synth note error:', err);
            }
          }
        }, delay * 1000);

        synthTimeoutsRef.current.push(timeout);
      });
    },
    [stopAllAudio]
  );

  // Play audio file track with robust source error handling & recovery
  const playAudioFileTrack = useCallback(
    async (track: MusicTrack, startFromSec: number = 0) => {
      stopAllAudio();

      let activeUrl = track.audioUrl;

      // If audioUrl is missing or track is in vault, retrieve fresh object URL
      if (!activeUrl || track.hasBlobInVault || track.id.startsWith('custom-')) {
        const vaultUrl = await getAudioObjectUrl(track.id);
        if (vaultUrl) {
          activeUrl = vaultUrl;
          track.audioUrl = vaultUrl;
        }
      }

      if (!activeUrl || typeof activeUrl !== 'string' || !activeUrl.trim()) {
        if (track.notes && track.notes.length > 0) {
          playSynthesizedTrack(track, startFromSec);
        }
        return;
      }

      try {
        const audio = new Audio();
        audioElementRef.current = audio;
        audio.preload = 'auto';

        const effectiveVolume = isMutedRef.current ? 0 : volumeRef.current;
        audio.volume = effectiveVolume;
        audio.muted = isMutedRef.current;

        // Error handling attached BEFORE setting src
        audio.onerror = async (e) => {
          if (typeof e !== 'string') e?.preventDefault?.();
          console.warn('Audio source load error, attempting vault recovery:', track.title);

          // Try refreshing from vault
          const recoveredUrl = await getAudioObjectUrl(track.id);
          if (recoveredUrl && recoveredUrl !== activeUrl) {
            track.audioUrl = recoveredUrl;
            playAudioFileTrack(track, startFromSec);
            return;
          }

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
        audio.src = activeUrl;
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

      if (track.audioUrl || track.hasBlobInVault || track.id.startsWith('custom-')) {
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
    if (currentTrack.audioUrl || currentTrack.hasBlobInVault || currentTrack.id.startsWith('custom-')) {
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
      let candidates = allTracks.filter(
        (t) => t.id !== currentId && !shuffleHistoryRef.current.includes(t.id)
      );

      if (candidates.length === 0) {
        shuffleHistoryRef.current = currentId ? [currentId] : [];
        candidates = allTracks.filter((t) => t.id !== currentId);
      }

      if (candidates.length === 0) {
        candidates = allTracks;
      }

      const randomIndex = Math.floor(Math.random() * candidates.length);
      const chosenTrack = candidates[randomIndex];
      playTrack(chosenTrack);
    } else {
      const currentId = currentTrackRef.current?.id;
      const idx = allTracks.findIndex((t) => t.id === currentId);
      let nextIndex = 0;
      if (idx !== -1) {
        if (idx + 1 < allTracks.length) {
          nextIndex = idx + 1;
        } else {
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

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  // Previous Track
  const handlePrevTrack = useCallback(() => {
    const allTracks = tracksRef.current;
    if (allTracks.length === 0) return;

    if (currentTimeSec > 3) {
      if (currentTrackRef.current) {
        playTrack(currentTrackRef.current);
      }
      return;
    }

    if (isShuffleRef.current && shuffleHistoryRef.current.length > 1) {
      shuffleHistoryRef.current.pop();
      const prevTrackId = shuffleHistoryRef.current[shuffleHistoryRef.current.length - 1];
      const prevTrack = allTracks.find((t) => t.id === prevTrackId);
      if (prevTrack) {
        playTrack(prevTrack);
        return;
      }
    }

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
      // Delete from IndexedDB vault as well
      deleteAudioBlob(trackId);
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

  // Play a random track directly and engage shuffle
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
    volume,
    isMuted,
    setVolume,
    toggleMute,
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
