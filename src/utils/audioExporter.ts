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
