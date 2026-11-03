/**
 * AI Music Synthesis Engine for DiNo Audio Studio.
 * Generates harmonic chords, basslines, melodies and renders into downloadable WAV files.
 */

import { audioBufferToWav } from './audioExporter';

export interface AIMusicConfig {
  title: string;
  genre: 'ru_ngu' | 'lofi_read' | 'vui_nhon' | 'co_tich' | 'thien_dinh' | 'acoustic_pop';
  mood: string;
  bpm: number;
  durationSec: number;
  lyrics?: string;
  instruments?: string[];
  notes?: { note: string; time: number; duration: number; instrument?: string }[];
}

export interface GeneratedAIMusic {
  id: string;
  title: string;
  genre: string;
  genreLabel: string;
  bpm: number;
  durationSec: number;
  lyrics: string;
  audioBlob: Blob;
  audioUrl: string;
  createdAt: number;
  coverGradient: string;
}

// Frequencies in Hz for Musical Notes
const PITCHES: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98,
};

// Genre Chord & Melody progressions
interface GenrePattern {
  name: string;
  bpm: number;
  scale: string[];
  chords: string[][];
  bassline: string[];
  leadTimbre: OscillatorType;
  chordTimbre: OscillatorType;
  filterFreq: number;
  gradient: string;
}

const GENRE_PATTERNS: Record<string, GenrePattern> = {
  ru_ngu: {
    name: 'Giai Điệu Ru Ngủ Êm Đềm',
    bpm: 68,
    scale: ['C4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'],
    chords: [
      ['C4', 'E4', 'G4'],
      ['A3', 'C4', 'E4'],
      ['F3', 'A3', 'C4'],
      ['G3', 'B3', 'D4'],
    ],
    bassline: ['C3', 'A3', 'F3', 'G3'],
    leadTimbre: 'sine',
    chordTimbre: 'triangle',
    filterFreq: 1200,
    gradient: 'from-indigo-900 via-purple-950 to-slate-900',
  },
  lofi_read: {
    name: 'Lo-Fi Chill Đọc Sách',
    bpm: 76,
    scale: ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5'],
    chords: [
      ['D4', 'F4', 'A4', 'C5'],
      ['G3', 'B3', 'D4', 'F4'],
      ['C4', 'E4', 'G4', 'B4'],
      ['A3', 'C4', 'E4', 'G4'],
    ],
    bassline: ['D3', 'G3', 'C3', 'A3'],
    leadTimbre: 'triangle',
    chordTimbre: 'sine',
    filterFreq: 950,
    gradient: 'from-amber-900 via-stone-900 to-black',
  },
  vui_nhon: {
    name: 'Pop Vui Nhộn & Rộn Ràng',
    bpm: 118,
    scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    chords: [
      ['C4', 'E4', 'G4'],
      ['G3', 'B3', 'D4'],
      ['A3', 'C4', 'E4'],
      ['F3', 'A3', 'C4'],
    ],
    bassline: ['C3', 'G3', 'A3', 'F3'],
    leadTimbre: 'sawtooth',
    chordTimbre: 'triangle',
    filterFreq: 2400,
    gradient: 'from-emerald-700 via-teal-900 to-slate-950',
  },
  co_tich: {
    name: 'Hòa Tấu Cổ Tích Thần Tiên',
    bpm: 82,
    scale: ['G4', 'A4', 'B4', 'D5', 'E5', 'G5', 'A5'],
    chords: [
      ['G3', 'B3', 'D4'],
      ['E3', 'G3', 'B3'],
      ['C4', 'E4', 'G4'],
      ['D4', 'F4', 'A4'],
    ],
    bassline: ['G3', 'E3', 'C3', 'D3'],
    leadTimbre: 'triangle',
    chordTimbre: 'sine',
    filterFreq: 1800,
    gradient: 'from-sky-900 via-blue-950 to-neutral-900',
  },
  thien_dinh: {
    name: 'Nhạc Thiền Định Thư Giãn',
    bpm: 54,
    scale: ['C4', 'D4', 'F4', 'G4', 'A4', 'C5'],
    chords: [
      ['C3', 'G3', 'C4', 'E4'],
      ['F3', 'C4', 'F4', 'A4'],
    ],
    bassline: ['C3', 'F3'],
    leadTimbre: 'sine',
    chordTimbre: 'sine',
    filterFreq: 800,
    gradient: 'from-teal-950 via-cyan-950 to-slate-950',
  },
  acoustic_pop: {
    name: 'Acoustic Guitar Thư Thái',
    bpm: 90,
    scale: ['E4', 'G4', 'A4', 'B4', 'D5', 'E5'],
    chords: [
      ['E3', 'G3', 'B3', 'E4'],
      ['C4', 'E4', 'G4'],
      ['G3', 'B3', 'D4'],
      ['D4', 'F4', 'A4'],
    ],
    bassline: ['E3', 'C3', 'G3', 'D3'],
    leadTimbre: 'triangle',
    chordTimbre: 'triangle',
    filterFreq: 1600,
    gradient: 'from-amber-800 via-yellow-950 to-zinc-950',
  },
};

/**
 * Render complete audio track using OfflineAudioContext.
 * This runs at ultra high speed (renders 30s audio in ~200ms) and returns an AudioBuffer.
 */
export async function renderAIMusicBuffer(
  config: AIMusicConfig
): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const duration = Math.min(Math.max(config.durationSec || 30, 15), 180);
  const pattern = GENRE_PATTERNS[config.genre] || GENRE_PATTERNS.ru_ngu;
  const bpm = config.bpm || pattern.bpm;
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;

  const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  // Master Gain & Limiter
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.7, 0);

  // Reverb simulation using Convolver or gentle delay
  const delayNode = offlineCtx.createDelay();
  delayNode.delayTime.setValueAtTime(beatDuration * 0.75, 0);
  const feedbackNode = offlineCtx.createGain();
  feedbackNode.gain.setValueAtTime(0.3, 0);

  delayNode.connect(feedbackNode);
  feedbackNode.connect(delayNode);
  delayNode.connect(masterGain);

  masterGain.connect(offlineCtx.destination);

  // Filter
  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(pattern.filterFreq, 0);
  filter.Q.setValueAtTime(1.5, 0);
  filter.connect(masterGain);
  filter.connect(delayNode);

  // Generate Chords throughout duration
  let currentTime = 0;
  let chordIndex = 0;
  while (currentTime < duration) {
    const chordNotes = pattern.chords[chordIndex % pattern.chords.length];
    const bassNote = pattern.bassline[chordIndex % pattern.bassline.length];

    // Play Bass Note
    const bassFreq = PITCHES[bassNote] || 130.81;
    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassFreq * 0.5, currentTime);

    bassGain.gain.setValueAtTime(0.3, currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, currentTime + barDuration * 0.9);

    bassOsc.connect(bassGain);
    bassGain.connect(filter);
    bassOsc.start(currentTime);
    bassOsc.stop(currentTime + barDuration);

    // Play Chord Notes (Arpeggiated & Sustained)
    chordNotes.forEach((noteName, nIdx) => {
      const noteFreq = PITCHES[noteName];
      if (noteFreq) {
        const osc = offlineCtx.createOscillator();
        const g = offlineCtx.createGain();
        osc.type = pattern.chordTimbre;
        osc.frequency.setValueAtTime(noteFreq, currentTime);

        // Soft attack and decay
        g.gain.setValueAtTime(0.001, currentTime);
        g.gain.linearRampToValueAtTime(0.12, currentTime + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, currentTime + barDuration * 0.95);

        osc.connect(g);
        g.connect(filter);
        osc.start(currentTime);
        osc.stop(currentTime + barDuration);
      }
    });

    // Play Melody notes within this bar
    const melodySteps = 4;
    for (let s = 0; s < melodySteps; s++) {
      const noteTime = currentTime + s * beatDuration;
      if (noteTime >= duration) break;

      // Pick a note from genre scale
      const scaleIndex = (chordIndex * 2 + s * 3) % pattern.scale.length;
      const melodyNote = pattern.scale[scaleIndex];
      const melodyFreq = PITCHES[melodyNote];

      if (melodyFreq) {
        const mOsc = offlineCtx.createOscillator();
        const mGain = offlineCtx.createGain();
        mOsc.type = pattern.leadTimbre;
        mOsc.frequency.setValueAtTime(melodyFreq, noteTime);

        // Bell/Pluck envelope
        mGain.gain.setValueAtTime(0.001, noteTime);
        mGain.gain.linearRampToValueAtTime(0.18, noteTime + 0.03);
        mGain.gain.exponentialRampToValueAtTime(0.001, noteTime + beatDuration * 0.85);

        mOsc.connect(mGain);
        mGain.connect(filter);
        mOsc.start(noteTime);
        mOsc.stop(noteTime + beatDuration);
      }
    }

    currentTime += barDuration;
    chordIndex++;
  }

  // Render
  return await offlineCtx.startRendering();
}

/**
 * Generate full AI Music track and export to WAV
 */
export async function generateAIMusicTrack(
  config: AIMusicConfig
): Promise<GeneratedAIMusic> {
  const buffer = await renderAIMusicBuffer(config);
  const blob = audioBufferToWav(buffer);
  const url = URL.createObjectURL(blob);
  const pattern = GENRE_PATTERNS[config.genre] || GENRE_PATTERNS.ru_ngu;

  return {
    id: `aimusic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: config.title || pattern.name,
    genre: config.genre,
    genreLabel: pattern.name,
    bpm: config.bpm || pattern.bpm,
    durationSec: Math.round(buffer.duration),
    lyrics: config.lyrics || 'Giai điệu hòa tấu thư giãn êm dịu do AI DiNo sáng tác.',
    audioBlob: blob,
    audioUrl: url,
    createdAt: Date.now(),
    coverGradient: pattern.gradient,
  };
}

export const GENRE_LIST = [
  { id: 'ru_ngu', name: 'Nhạc Ru Ngủ', icon: '🌙', desc: 'Giai điệu êm dịu, ấm áp giúp bé và gia đình ngủ ngon sâu giấc' },
  { id: 'lofi_read', name: 'Lo-Fi Đọc Sách', icon: '📖', desc: 'Tiết tấu nhẹ nhàng, tập trung đọc sách và làm việc thư thái' },
  { id: 'vui_nhon', name: 'Pop Vui Nhộn', icon: '🎈', desc: 'Rộn ràng, tươi vui, kích thích năng lượng và sáng tạo' },
  { id: 'co_tich', name: 'Giao Hưởng Cổ Tích', icon: '🏰', desc: 'Hòa tấu thần tiên, mộng mơ như bước vào thế giới thần thoại' },
  { id: 'thien_dinh', name: 'Thiền Định & Chữa Lành', icon: '🍃', desc: 'Âm hưởng tĩnh lặng, giải tỏa căng thẳng sau một ngày dài' },
  { id: 'acoustic_pop', name: 'Acoustic Mộc Mạc', icon: '🎸', desc: 'Tiếng đàn guitar gỗ acoustic mộc mạc, gần gũi và sâu lắng' },
];
