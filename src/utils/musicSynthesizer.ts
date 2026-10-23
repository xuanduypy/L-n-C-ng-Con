import { MusicTrack } from '../types';

let audioCtx: AudioContext | null = null;
let activeTimeouts: any[] = [];
let isPlayingState = false;

// Note frequency map
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

export function stopMusic() {
  activeTimeouts.forEach((t) => clearTimeout(t));
  activeTimeouts = [];
  isPlayingState = false;
}

export function isMusicPlaying(): boolean {
  return isPlayingState;
}

export function playTrack(
  track: MusicTrack,
  options?: { onEnd?: () => void; onNotePlay?: (note: string) => void }
): void {
  stopMusic();

  const ctx = getAudioContext();
  isPlayingState = true;

  let currentDelay = 0;

  track.notes.forEach((item, index) => {
    const timeout = setTimeout(() => {
      if (!isPlayingState) return;

      const freq = NOTE_FREQS[item.note] || 0;
      if (freq > 0) {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Pleasant, warm xylophone/marimba child tone
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.duration * 0.95);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + item.duration);

          options?.onNotePlay?.(item.note);
        } catch (e) {
          console.warn('Audio note play error:', e);
        }
      }

      // If last note, signal end
      if (index === track.notes.length - 1) {
        const endTimeout = setTimeout(() => {
          isPlayingState = false;
          options?.onEnd?.();
        }, item.duration * 1000);
        activeTimeouts.push(endTimeout);
      }
    }, currentDelay * 1000);

    activeTimeouts.push(timeout);
    currentDelay += item.duration;
  });
}
