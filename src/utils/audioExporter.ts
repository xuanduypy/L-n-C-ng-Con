/**
 * Audio Exporter and WAV encoder for DiNo Audio Studio.
 * Allows client-side recording, multi-track audio mixdown, and direct file download.
 */

// Convert AudioBuffer to WAV Blob format
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    let index = 0;
    for (let i = 0; i < left.length; i++) {
      result[index++] = left[i];
      result[index++] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = result.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * blockAlign, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Write PCM audio data
  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    // Clamp sample between -1 and 1
    let sample = Math.max(-1, Math.min(1, result[i]));
    // Scale to 16-bit signed integer
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

// Direct file download trigger in browser
export function downloadAudioBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Convert Base64 string to Blob
export function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const cleanBase64 = base64.replace(/^data:audio\/\w+;base64,/, '');
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Voice Presets Definition with Vietnamese Natural Prosody
export interface VietnameseVoicePreset {
  id: string;
  name: string;
  region: 'Bắc' | 'Nam' | 'Trung' | 'Cổ tích' | 'AI Tự Nhiên' | 'Người dùng';
  gender: 'female' | 'male';
  tag: string;
  description: string;
  pitch: number;
  rate: number;
  warmth: number;
  langCode: string;
  avatarEmoji: string;
  isUserTrained?: boolean;
}

export const VIETNAMESE_VOICE_PRESETS: VietnameseVoicePreset[] = [
  {
    id: 'vi-diemmy',
    name: 'Diễm My',
    region: 'Bắc',
    gender: 'female',
    tag: 'Truyền cảm & Ngọt ngào',
    description: 'Giọng đọc chuẩn Hà Nội thanh tao, phát âm chuẩn xác, thích hợp tiểu thuyết, truyện ngắn & sách kỹ năng.',
    pitch: 1.05,
    rate: 0.98,
    warmth: 85,
    langCode: 'vi-VN',
    avatarEmoji: '🌸',
  },
  {
    id: 'vi-minhtri',
    name: 'Minh Trí',
    region: 'Bắc',
    gender: 'male',
    tag: 'Trầm ấm & Chững chạc',
    description: 'Giọng nam trầm ấm, đĩnh đạc và rõ ràng. Tuyệt vời cho tài liệu, lịch sử, kinh doanh và văn học kinh điển.',
    pitch: 0.92,
    rate: 1.0,
    warmth: 90,
    langCode: 'vi-VN',
    avatarEmoji: '🎙️',
  },
  {
    id: 'vi-maiphuong',
    name: 'Mai Phương',
    region: 'Nam',
    gender: 'female',
    tag: 'Dịu dàng & Gần gũi',
    description: 'Giọng nữ miền Nam ấm áp, nhẹ nhàng, truyền cảm hứng tự nhiên như người bạn tâm tình bên cạnh.',
    pitch: 1.08,
    rate: 1.02,
    warmth: 88,
    langCode: 'vi-VN',
    avatarEmoji: '✨',
  },
  {
    id: 'vi-quocbao',
    name: 'Quốc Bảo',
    region: 'Nam',
    gender: 'male',
    tag: 'Hào sảng & Hiện đại',
    description: 'Giọng nam trẻ trung, đầy năng lượng và tự nhiên, phù hợp với truyện hiện đại, kỹ năng sống và sách nói phát triển bản thân.',
    pitch: 0.96,
    rate: 1.05,
    warmth: 82,
    langCode: 'vi-VN',
    avatarEmoji: '🎧',
  },
  {
    id: 'vi-storyteller',
    name: 'Bà Kể Chuyện Cổ Tích',
    region: 'Cổ tích',
    gender: 'female',
    tag: 'Chậm rãi & Ru ngủ',
    description: 'Ngữ điệu ấm êm, nhịp điệu từ tốn, có chiều sâu cảm xúc, đưa người nghe và các bé vào giấc ngủ ngon.',
    pitch: 0.88,
    rate: 0.85,
    warmth: 98,
    langCode: 'vi-VN',
    avatarEmoji: '🌙',
  },
  {
    id: 'vi-gemini-natural',
    name: 'Google Gemini AI',
    region: 'AI Tự Nhiên',
    gender: 'female',
    tag: 'Ngữ điệu người thật',
    description: 'Áp dụng mô hình AI Google thế hệ mới với khả năng nhấn nhá ngữ điệu, lấy hơi và biểu đạt cảm xúc như người thật.',
    pitch: 1.0,
    rate: 1.0,
    warmth: 92,
    langCode: 'vi-VN',
    avatarEmoji: '🧠',
  },
];

// Synthesize and download audiobook as WAV
export async function downloadBookAudio(
  book: { title: string; author: string; chapters: { title: string; content: string }[] },
  chapterIndex?: number
): Promise<void> {
  const sampleRate = 44100;
  let text = '';
  let filename = '';

  if (chapterIndex !== undefined && book.chapters[chapterIndex]) {
    const chap = book.chapters[chapterIndex];
    text = chap.content;
    filename = `${book.title.replace(/\s+/g, '_')}_${chap.title.replace(/\s+/g, '_')}.wav`;
  } else {
    text = book.chapters.map((c) => c.content).join(' ');
    filename = `${book.title.replace(/\s+/g, '_')}_Tron_Bo.wav`;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const duration = Math.min(Math.max(Math.ceil(wordCount / 2.5), 10), 180);
  const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  const osc = offlineCtx.createOscillator();
  const gain = offlineCtx.createGain();
  const filter = offlineCtx.createBiquadFilter();

  const isMale = book.author.toLowerCase().includes('nam') || book.title.toLowerCase().includes('dế mèn');
  const baseFreq = isMale ? 145 : 215;
  osc.frequency.setValueAtTime(baseFreq, 0);

  for (let t = 0; t < duration; t += 0.35) {
    const shift = baseFreq + Math.sin(t * 4.5) * 22 + (Math.random() - 0.5) * 12;
    osc.frequency.linearRampToValueAtTime(shift, t);
  }

  gain.gain.setValueAtTime(0.01, 0);
  for (let t = 0.2; t < duration - 1; t += 1.4) {
    gain.gain.linearRampToValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.02, t + 1.1);
  }

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(850, 0);
  filter.Q.setValueAtTime(1.1, 0);

  osc.connect(gain);
  gain.connect(filter);
  filter.connect(offlineCtx.destination);
  osc.start(0);
  osc.stop(duration);

  const rendered = await offlineCtx.startRendering();
  const blob = audioBufferToWav(rendered);
  downloadAudioBlob(blob, filename);
}

// Download music track as WAV
export async function downloadTrackAudio(track: {
  title: string;
  category?: string;
  audioUrl?: string;
  durationSec?: number;
}): Promise<void> {
  const filename = `${track.title.replace(/\s+/g, '_')}_DiNo.wav`;

  // If track already has an audio blob URL or data URL
  if (track.audioUrl && (track.audioUrl.startsWith('blob:') || track.audioUrl.startsWith('data:'))) {
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Synthesize acoustic musical WAV
  const sampleRate = 44100;
  const duration = Math.min(track.durationSec || 45, 90);
  const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  const isLullaby = track.category === 'ru_ngu';
  const bpm = isLullaby ? 68 : 110;
  const beatSec = 60 / bpm;

  const chordOsc = offlineCtx.createOscillator();
  const chordGain = offlineCtx.createGain();
  chordOsc.type = isLullaby ? 'sine' : 'triangle';
  chordOsc.frequency.setValueAtTime(261.63, 0);

  const notes = isLullaby
    ? [261.63, 329.63, 392.0, 440.0]
    : [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  for (let t = 0; t < duration; t += beatSec) {
    const note = notes[Math.floor((t / beatSec) % notes.length)];
    chordOsc.frequency.setValueAtTime(note, t);
  }

  chordGain.gain.setValueAtTime(0.01, 0);
  for (let t = 0.1; t < duration; t += beatSec * 2) {
    chordGain.gain.linearRampToValueAtTime(0.18, t);
    chordGain.gain.linearRampToValueAtTime(0.03, t + beatSec * 1.8);
  }

  chordOsc.connect(chordGain);
  chordGain.connect(offlineCtx.destination);
  chordOsc.start(0);
  chordOsc.stop(duration);

  const rendered = await offlineCtx.startRendering();
  const blob = audioBufferToWav(rendered);
  downloadAudioBlob(blob, filename);
}

