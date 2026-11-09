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
  singerVoice?: string;
  sunoBeatStyle?: string;
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
  singerVoice?: string;
  singerVoiceLabel?: string;
  sunoBeatStyle?: string;
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

export const SINGER_VOICE_LIST = [
  { id: 'nu_truyencam', name: 'Giọng Nữ Ấm Áp Truyền Cảm', desc: 'Tone nữ ngọt ngào, giàu cảm xúc phong cách Pop Ballad', icon: '👩‍🎤' },
  { id: 'nam_tram', name: 'Giọng Nam Trầm Ấm Baritone', desc: 'Tone nam dày dặn, tự sự, sâu lắng và điềm tĩnh', icon: '👨‍🎤' },
  { id: 'song_ca', name: 'Song Ca Nam Nữ Hòa Âm (Suno)', desc: 'Phối hòa âm bè đôi nam nữ đan xen cuốn hút', icon: '👥' },
  { id: 'tre_tho', name: 'Giọng Trẻ Thơ Trong Sáng', desc: 'Hồn nhiên, tươi vui, phù hợp ca khúc thiếu nhi và gia đình', icon: '🧒' },
  { id: 'acoustic_live', name: 'Giọng Mộc Live Acoustic Suno', desc: 'Chất giọng mộc mạc, gần gũi như hát live cùng đàn mộc', icon: '🎸' },
  { id: 'instrumental', name: 'Nhạc Hòa Tấu (Không Lời)', desc: 'Tập trung trọn vẹn vào giai điệu nhạc cụ và nhịp beat thư giãn', icon: '🎹' },
];

export const SUNO_BEAT_LIST = [
  { id: 'suno_pop', name: 'Suno Modern Pop Kick-Snare', desc: 'Nhịp Kick đầm ấm, Snare gọn gàng, Sub-bass hiện đại', tempoRange: '78-115 BPM' },
  { id: 'acoustic_cajon', name: 'Acoustic Strum & Soft Cajon', desc: 'Tiếng quạt chả guitar gỗ kết hợp nhịp trống gõ mộc mạc', tempoRange: '75-95 BPM' },
  { id: 'lofi_vinyl', name: 'Lofi Chillhop Vinyl & Deep Bass', desc: 'Tiếng nổ đĩa than ấm áp, beat lơi thư thái đọc sách', tempoRange: '70-85 BPM' },
  { id: 'ballad_68', name: 'Piano Ballad Chords & Strings', desc: 'Hòa âm piano cổ điển kết hợp đàn dây giao hưởng du dương', tempoRange: '62-76 BPM' },
  { id: 'celestial_bells', name: 'Lullaby Celestial Bells & Harp', desc: 'Chuông gió thần tiên, hạc cầm ru giấc mộng êm ái', tempoRange: '56-68 BPM' },
];

/**
 * Helper to synthesize White Noise buffer for snare/hi-hat percussions
 */
function createNoiseBuffer(ctx: BaseAudioContext, duration: number = 1): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Render complete audio track using OfflineAudioContext.
 * Supports standard song durations from 2 to 5 minutes (120s to 300s).
 */
export async function renderAIMusicBuffer(
  config: AIMusicConfig
): Promise<AudioBuffer> {
  const sampleRate = 44100;
  // Standard duration: 2 to 5 minutes (120 to 300s)
  const duration = Math.min(Math.max(config.durationSec || 180, 60), 300);
  const pattern = GENRE_PATTERNS[config.genre] || GENRE_PATTERNS.ru_ngu;
  const bpm = config.bpm || pattern.bpm;
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;

  const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
  const noiseBuffer = createNoiseBuffer(offlineCtx, 1.5);

  // Master Gain & Limiter
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.75, 0);

  // Reverb simulation using gentle stereo delay
  const delayNode = offlineCtx.createDelay();
  delayNode.delayTime.setValueAtTime(beatDuration * 0.75, 0);
  const feedbackNode = offlineCtx.createGain();
  feedbackNode.gain.setValueAtTime(0.32, 0);

  delayNode.connect(feedbackNode);
  feedbackNode.connect(delayNode);
  delayNode.connect(masterGain);

  masterGain.connect(offlineCtx.destination);

  // Main Instrument Filter
  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(pattern.filterFreq, 0);
  filter.Q.setValueAtTime(1.5, 0);
  filter.connect(masterGain);
  filter.connect(delayNode);

  // Drum / Percussion Bus
  const drumBus = offlineCtx.createGain();
  drumBus.gain.setValueAtTime(0.45, 0);
  drumBus.connect(masterGain);

  // Vocal Pad / Singer Formant Bus
  const vocalBus = offlineCtx.createGain();
  vocalBus.gain.setValueAtTime(config.singerVoice === 'instrumental' ? 0.0 : 0.28, 0);
  const vocalFilter = offlineCtx.createBiquadFilter();
  vocalFilter.type = 'bandpass';
  vocalFilter.frequency.setValueAtTime(
    config.singerVoice === 'nam_tram' ? 520 : config.singerVoice === 'nu_truyencam' ? 1150 : 800,
    0
  );
  vocalFilter.Q.setValueAtTime(3.0, 0);
  vocalBus.connect(vocalFilter);
  vocalFilter.connect(delayNode);
  vocalFilter.connect(masterGain);

  // Synthesize Chords, Melody, Bass & Suno AI Drum Beats
  let currentTime = 0;
  let chordIndex = 0;

  while (currentTime < duration) {
    const chordNotes = pattern.chords[chordIndex % pattern.chords.length];
    const bassNote = pattern.bassline[chordIndex % pattern.bassline.length];

    // 1. Play Bass Note (Punchy Sub Bass)
    const bassFreq = PITCHES[bassNote] || 130.81;
    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassFreq * 0.5, currentTime);

    bassGain.gain.setValueAtTime(0.35, currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, currentTime + barDuration * 0.9);

    bassOsc.connect(bassGain);
    bassGain.connect(filter);
    bassOsc.start(currentTime);
    bassOsc.stop(currentTime + barDuration);

    // 2. Play Suno-Style Drum Beat (Kick on 1 & 3, Snare on 2 & 4, Hi-hat on 8ths)
    if (config.genre !== 'thien_dinh') {
      // Beat 1: Kick
      const kickOsc1 = offlineCtx.createOscillator();
      const kickGain1 = offlineCtx.createGain();
      kickOsc1.frequency.setValueAtTime(120, currentTime);
      kickOsc1.frequency.exponentialRampToValueAtTime(42, currentTime + 0.12);
      kickGain1.gain.setValueAtTime(0.65, currentTime);
      kickGain1.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25);
      kickOsc1.connect(kickGain1);
      kickGain1.connect(drumBus);
      kickOsc1.start(currentTime);
      kickOsc1.stop(currentTime + 0.3);

      // Beat 3: Kick
      const t3 = currentTime + beatDuration * 2;
      if (t3 < duration) {
        const kickOsc3 = offlineCtx.createOscillator();
        const kickGain3 = offlineCtx.createGain();
        kickOsc3.frequency.setValueAtTime(110, t3);
        kickOsc3.frequency.exponentialRampToValueAtTime(40, t3 + 0.12);
        kickGain3.gain.setValueAtTime(0.55, t3);
        kickGain3.gain.exponentialRampToValueAtTime(0.001, t3 + 0.25);
        kickOsc3.connect(kickGain3);
        kickGain3.connect(drumBus);
        kickOsc3.start(t3);
        kickOsc3.stop(t3 + 0.3);
      }

      // Beat 2 & 4: Snare / Clap
      [1, 3].forEach((bIdx) => {
        const snareTime = currentTime + beatDuration * bIdx;
        if (snareTime < duration) {
          const noise = offlineCtx.createBufferSource();
          noise.buffer = noiseBuffer;
          const snareFilter = offlineCtx.createBiquadFilter();
          snareFilter.type = 'bandpass';
          snareFilter.frequency.setValueAtTime(1600, snareTime);
          snareFilter.Q.setValueAtTime(2.0, snareTime);

          const snareGain = offlineCtx.createGain();
          snareGain.gain.setValueAtTime(0.3, snareTime);
          snareGain.gain.exponentialRampToValueAtTime(0.001, snareTime + 0.18);

          noise.connect(snareFilter);
          snareFilter.connect(snareGain);
          snareGain.connect(drumBus);
          noise.start(snareTime);
          noise.stop(snareTime + 0.2);
        }
      });

      // Hi-Hats every 8th note
      for (let h = 0; h < 8; h++) {
        const hhTime = currentTime + h * (beatDuration / 2);
        if (hhTime < duration) {
          const hhNoise = offlineCtx.createBufferSource();
          hhNoise.buffer = noiseBuffer;
          const hhFilter = offlineCtx.createBiquadFilter();
          hhFilter.type = 'highpass';
          hhFilter.frequency.setValueAtTime(6500, hhTime);
          const hhGain = offlineCtx.createGain();
          hhGain.gain.setValueAtTime(h % 2 === 0 ? 0.08 : 0.04, hhTime);
          hhGain.gain.exponentialRampToValueAtTime(0.0001, hhTime + 0.05);

          hhNoise.connect(hhFilter);
          hhFilter.connect(hhGain);
          hhGain.connect(drumBus);
          hhNoise.start(hhTime);
          hhNoise.stop(hhTime + 0.06);
        }
      }
    }

    // 3. Play Chord Notes (Arpeggiated & Sustained)
    chordNotes.forEach((noteName) => {
      const noteFreq = PITCHES[noteName];
      if (noteFreq) {
        const osc = offlineCtx.createOscillator();
        const g = offlineCtx.createGain();
        osc.type = pattern.chordTimbre;
        osc.frequency.setValueAtTime(noteFreq, currentTime);

        // Soft attack and decay
        g.gain.setValueAtTime(0.001, currentTime);
        g.gain.linearRampToValueAtTime(0.14, currentTime + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, currentTime + barDuration * 0.95);

        osc.connect(g);
        g.connect(filter);
        osc.start(currentTime);
        osc.stop(currentTime + barDuration);

        // Vocal Formant Pad (Simulate singer backing harmony)
        if (config.singerVoice && config.singerVoice !== 'instrumental') {
          const vocOsc = offlineCtx.createOscillator();
          const vocGain = offlineCtx.createGain();
          vocOsc.type = 'sine';
          vocOsc.frequency.setValueAtTime(noteFreq * (config.singerVoice === 'nam_tram' ? 0.5 : 1), currentTime);
          vocGain.gain.setValueAtTime(0.001, currentTime);
          vocGain.gain.linearRampToValueAtTime(0.12, currentTime + 0.3);
          vocGain.gain.exponentialRampToValueAtTime(0.001, currentTime + barDuration * 0.9);
          vocOsc.connect(vocGain);
          vocGain.connect(vocalBus);
          vocOsc.start(currentTime);
          vocOsc.stop(currentTime + barDuration);
        }
      }
    });

    // 4. Play Melody notes within this bar
    const melodySteps = 4;
    for (let s = 0; s < melodySteps; s++) {
      const noteTime = currentTime + s * beatDuration;
      if (noteTime >= duration) break;

      const scaleIndex = (chordIndex * 2 + s * 3) % pattern.scale.length;
      const melodyNote = pattern.scale[scaleIndex];
      const melodyFreq = PITCHES[melodyNote];

      if (melodyFreq) {
        const mOsc = offlineCtx.createOscillator();
        const mGain = offlineCtx.createGain();
        mOsc.type = pattern.leadTimbre;
        mOsc.frequency.setValueAtTime(melodyFreq, noteTime);

        mGain.gain.setValueAtTime(0.001, noteTime);
        mGain.gain.linearRampToValueAtTime(0.19, noteTime + 0.03);
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

  // Render buffer
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

  const singerVoiceObj = SINGER_VOICE_LIST.find((v) => v.id === config.singerVoice);

  return {
    id: `aimusic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: config.title || pattern.name,
    genre: config.genre,
    genreLabel: pattern.name,
    bpm: config.bpm || pattern.bpm,
    durationSec: Math.round(buffer.duration),
    lyrics: config.lyrics || 'Giai điệu hòa tấu thư giãn êm dịu do AI DiNo sáng tác.',
    singerVoice: config.singerVoice || 'nu_truyencam',
    singerVoiceLabel: singerVoiceObj?.name || 'Giọng Nữ Ấm Áp Truyền Cảm',
    sunoBeatStyle: config.sunoBeatStyle || 'Suno Modern Pop Kick-Snare',
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
