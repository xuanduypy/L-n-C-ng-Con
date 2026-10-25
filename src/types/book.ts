export interface Chapter {
  id: string;
  title: string;
  content: string; // The text content to read aloud
  order: number;
  wordCount: number;
  estimatedDurationSec: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverUrl?: string;
  coverGradient: string; // Tailwind gradient classes e.g. 'from-emerald-700 via-emerald-950 to-[#121212]'
  coverBgColor: string; // Hex color for Spotify ambient header e.g. '#047857'
  chapters: Chapter[];
  createdAt: number;
  lastReadAt?: number;
  isFavorite?: boolean;
  bookmarkedChapterId?: string;
  bookmarkedSentenceIndex?: number;
}

export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0;

export interface UserVoiceProfile {
  id: string;
  name: string; // e.g. 'Giọng Mẹ Yêu', 'Giọng Ba Kể'
  narratorRole: 'mom' | 'dad' | 'grandma' | 'storyteller';
  audioBlobUrl?: string;
  audioBase64?: string;
  recordedDurationSec?: number;
  recordedAt: number;
  pitch: number; // 0.8 to 1.3
  rate: number;  // 0.8 to 1.5
  warmth: number; // 0 to 100
  sampleText?: string;
}

export interface LastPlaybackState {
  bookId: string;
  chapterId: string;
  sentenceIndex: number;
  savedAt: number;
}

export interface VoiceSettings {
  engine: 'browser' | 'gemini' | 'user_voice';
  rate: number;
  pitch: number;
  volume: number;
  selectedVoiceURI: string;
  geminiVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  geminiStylePrompt: string;
  expressiveMode: boolean; // Nhấn nhá & truyền cảm xúc
  activeUserProfileId?: string;
  userProfiles?: UserVoiceProfile[];
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'vui_nhon' | 'ru_ngu' | 'tieng_anh' | 'dong_dao' | 'nhac_tre' | 'khong_loi' | string;
  coverGradient: string;
  coverUrl?: string;
  coverBgColor?: string;
  audioUrl?: string; // Audio file URL or Blob URL or base64
  durationSec: number;
  lyrics?: string;
  notes?: { note: string; duration: number }[];
  isFavorite?: boolean;
  isCustom?: boolean;
  createdAt: number;
}

export type ViewMode = 'home' | 'search' | 'library' | 'book-detail' | 'music-library';

