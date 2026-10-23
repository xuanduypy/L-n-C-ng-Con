export interface ChildProfile {
  name: string;
  age: number;
  nickname: string;
  puppyName: string;
  avatar: string;
  level: 'mầm non' | 'tiểu học 1-2' | 'tiểu học 3-5';
  dailyGoalMinutes: number;
}

export type PuppyMood =
  | 'happy'
  | 'talking'
  | 'listening'
  | 'thinking'
  | 'excited'
  | 'reading'
  | 'dancing'
  | 'sleeping'
  | 'waving'
  | 'playing_ball'
  | 'laughing'
  | 'grooving';

export type PuppyCostume = 'none' | 'glasses' | 'cap' | 'bowtie' | 'crown';

export interface EnglishWord {
  id: string;
  word: string;
  phonetic: string;
  vietnamese: string;
  category: string;
  exampleSentence: string;
  exampleVietnamese: string;
  iconEmoji: string;
  mastered: boolean;
  bestScore?: number;
  gentleCoachingNotes?: string;
  dateAdded?: string;
}

export interface MathChallenge {
  id: string;
  question: string;
  visualEmoji: string;
  visualCountA: number;
  visualCountB: number;
  operation: '+' | '-' | 'count';
  options: number[];
  correctAnswer: number;
  hint: string;
}

export interface HistoryTopic {
  id: string;
  title: string;
  hero: string;
  period: string;
  summary: string;
  storySnippet: string;
  moralLesson: string;
  imageEmoji: string;
}

export interface StoryBookItem {
  id: string;
  title: string;
  category: 'fairy_tale' | 'history' | 'science' | 'bedtime' | 'custom';
  author: string;
  coverEmoji: string;
  summary: string;
  content: string;
  moralLesson: string;
  suggestedAge: string;
  isFavorite: boolean;
  dateAdded: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  category: 'vui_nhon' | 'ru_ngu' | 'tieng_anh' | 'dong_dao';
  icon: string;
  description: string;
  notes: { note: string; duration: number }[]; // Web Audio synthesized frequencies
  lyrics: string;
}

export interface LearningHistoryEntry {
  id: string;
  timestamp: string;
  createdAt: number; // Timestamp in milliseconds for security auto-delete
  type: 'english_practice' | 'chat' | 'math' | 'history' | 'story' | 'music';
  title: string;
  detail: string;
  score?: number;
  stars?: number;
  feedback?: string;
  childSpoken?: string;
}

export interface SecuritySettings {
  parentPin: string;
  historyRetentionHours: number; // 24 = 1 day, 72 = 3 days, 168 = 7 days, 720 = 30 days, 0 = delete immediately
  autoPurgeEnabled: boolean;
  lastPurgedAt?: number;
}

export interface VoicePreset {
  id: 'puppy' | 'mother' | 'teacher' | 'grandpa';
  name: string;
  description: string;
  icon: string;
  pitch: number;
  rate: number;
  geminiVoice: 'Puck' | 'Kore' | 'Zephyr' | 'Fenrir';
  geminiStylePrompt: string;
}

export interface VoiceSettings {
  engine: 'gemini_tts' | 'browser_tts';
  presetId: 'puppy' | 'mother' | 'teacher' | 'grandpa';
  pitch: number;
  rate: number;
  volume: number;
  geminiVoice: 'Puck' | 'Kore' | 'Zephyr' | 'Fenrir';
}

export interface ChatMessage {
  id: string;
  sender: 'child' | 'puppy';
  text: string;
  timestamp: string;
  createdAt: number;
  emotion?: PuppyMood;
  englishHighlight?: {
    word: string;
    phonetic: string;
    meaning: string;
  };
  audioUrl?: string;
  isAudioPlaying?: boolean;
}

export interface ActiveVocabularyPrompt {
  word: string;
  phonetic: string;
  meaning: string;
  exampleSentence: string;
  exampleVietnamese: string;
  iconEmoji: string;
  gentleCoachTip?: string;
  attemptCount: number;
  isCorrect?: boolean;
}
