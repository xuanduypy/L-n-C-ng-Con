import React, { useState } from 'react';
import {
  ChildProfile,
  VoiceSettings,
  StoryBookItem,
  LearningHistoryEntry,
  EnglishWord,
  PuppyCostume,
  MusicTrack,
  SecuritySettings,
} from '../types';
import { VOICE_PRESETS } from '../data/defaultData';
import {
  BookOpen,
  TrendingUp,
  Volume2,
  Settings,
  Upload,
  ArrowLeft,
  Trash2,
  Sparkles,
  Play,
  Square,
  ShieldCheck,
  Plus,
  Music,
  FileText,
  Download,
  AlertTriangle,
  Clock,
  Key,
} from 'lucide-react';

interface ParentStudioViewProps {
  onBackToChildView: () => void;
  childProfile: ChildProfile;
  onUpdateChildProfile: (updated: ChildProfile) => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (updated: VoiceSettings) => void;
  stories: StoryBookItem[];
  onAddStory: (newStory: StoryBookItem) => void;
  onDeleteStory: (id: string) => void;
  musicTracks: MusicTrack[];
  onAddMusicTrack: (newTrack: MusicTrack) => void;
  onDeleteMusicTrack: (id: string) => void;
  words: EnglishWord[];
  onAddWord: (newWord: EnglishWord) => void;
  onDeleteWord: (id: string) => void;
  history: LearningHistoryEntry[];
  onClearHistory: () => void;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (settings: SecuritySettings) => void;
  puppyCostume: PuppyCostume;
  onUpdatePuppyCostume: (costume: PuppyCostume) => void;
  onTestSpeak: (text: string, tempSettings?: VoiceSettings) => void;
  isSpeaking: boolean;
  onPlayMusicTrack?: (track: MusicTrack) => void;
  onStopMusic?: () => void;
  isMusicPlaying?: boolean;
}

export const ParentStudioView: React.FC<ParentStudioViewProps> = ({
  onBackToChildView,
  childProfile,
  onUpdateChildProfile,
  voiceSettings,
  onUpdateVoiceSettings,
  stories,
  onAddStory,
  onDeleteStory,
  musicTracks,
  onAddMusicTrack,
  onDeleteMusicTrack,
  words,
  onAddWord,
  onDeleteWord,
  history,
  onClearHistory,
  securitySettings,
  onUpdateSecuritySettings,
  puppyCostume,
  onUpdatePuppyCostume,
  onTestSpeak,
  isSpeaking,
  onPlayMusicTrack,
  onStopMusic,
  isMusicPlaying = false,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'progress' | 'voice' | 'security'>('vault');
  const [activeVaultCategory, setActiveVaultCategory] = useState<'stories' | 'books' | 'music' | 'vocab'>('vocab');

  // Form states for uploading custom story / book
  const [showStoryUploadForm, setShowStoryUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMoral, setNewMoral] = useState('');
  const [newCategory, setNewCategory] = useState<'fairy_tale' | 'science'>('fairy_tale');

  // Form states for adding custom vocabulary word
  const [showWordForm, setShowWordForm] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCoachingTip, setNewCoachingTip] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌟');

  // Form states for adding music track
  const [showMusicForm, setShowMusicForm] = useState(false);
  const [newMusicTitle, setNewMusicTitle] = useState('');
  const [newMusicLyrics, setNewMusicLyrics] = useState('');

  // Profile and Security settings
  const [profileForm, setProfileForm] = useState<ChildProfile>(childProfile);
  const [pinForm, setPinForm] = useState(securitySettings.parentPin);
  const [retentionHours, setRetentionHours] = useState(securitySettings.historyRetentionHours);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  // File upload for stories
  const handleStoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNewContent(text);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: StoryBookItem = {
      id: `story-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: newAuthor.trim() || 'Phụ huynh tải lên',
      coverEmoji: newCategory === 'fairy_tale' ? '📖' : '📚',
      summary: newContent.slice(0, 100) + '...',
      content: newContent.trim(),
      moralLesson: newMoral.trim() || 'Bài học yêu thương và phát triển',
      suggestedAge: 'Mọi lứa tuổi',
      isFavorite: true,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onAddStory(item);
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setNewMoral('');
    setShowStoryUploadForm(false);
  };

  // Add Vocabulary Word to Vault
  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;

    const wordItem: EnglishWord = {
      id: `word-${Date.now()}`,
      word: newWord.trim(),
      phonetic: newPhonetic.trim() || `/${newWord.toLowerCase()}/`,
      vietnamese: newMeaning.trim(),
      category: 'Từ vựng phụ huynh thêm',
      exampleSentence: newExample.trim() || `This is a ${newWord}.`,
      exampleVietnamese: `Đây là ${newMeaning}.`,
      iconEmoji: newEmoji || '⭐',
      mastered: false,
      gentleCoachingNotes:
        newCoachingTip.trim() ||
        `Nhắc bé đọc to rõ ràng từ "${newWord}", mím môi và mở khẩu hình chuẩn xác nhé!`,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onAddWord(wordItem);
    setNewWord('');
    setNewPhonetic('');
    setNewMeaning('');
    setNewExample('');
    setNewCoachingTip('');
    setShowWordForm(false);
  };

  // Export Unified Vocabulary File for NotebookLM
  const handleExportVocabularyJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'NotebookLM_English_Vocabulary_Vault.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Vocabulary File
  const handleImportVocabularyFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((w: any) => {
            if (w.word && w.vietnamese) {
              onAddWord({
                id: `import-${Date.now()}-${Math.random()}`,
                word: w.word,
                phonetic: w.phonetic || '',
                vietnamese: w.vietnamese,
                category: w.category || 'Nhập từ tệp',
                exampleSentence: w.exampleSentence || '',
                exampleVietnamese: w.exampleVietnamese || '',
                iconEmoji: w.iconEmoji || '📘',
                mastered: !!w.mastered,
                gentleCoachingNotes: w.gentleCoachingNotes || '',
              });
            }
          });
          alert('Đã nhập thành công danh sách từ vựng vào kho!');
        }
      } catch (err) {
        alert('Tệp không đúng định dạng JSON hợp lệ.');
      }
    };
    reader.readAsText(file);
  };

  // Save Security Settings
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateChildProfile(profileForm);
    onUpdateSecuritySettings({
      ...securitySettings,
      parentPin: pinForm,
      historyRetentionHours: retentionHours,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const fairyTaleStories = stories.filter((s) => s.category !== 'science');
  const educationalBooks = stories.filter((s) => s.category === 'science');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Nunito',sans-serif]">
      {/* Studio Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToChildView}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white px-3.5 py-2 rounded-2xl font-black text-xs shadow-md shadow-rose-200 active:scale-95 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Màn Hình Chú Cún Của Bé</span>
            </button>

            <div className="hidden sm:block">
              <h1 className="text-base font-black text-slate-900 leading-tight">
                Studio Quản Trị & Kho Dữ Liệu NotebookLM
              </h1>
              <p className="text-[11px] text-slate-500">
                Kho truyện, kho sách, kho nhạc, kho từ vựng và bảo mật cho {childProfile.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật an toàn</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Tabs */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-4 pb-12 flex-1">
        {/* Navigation Tab Bar */}
        <div className="flex bg-slate-200/80 p-1.5 rounded-2xl mb-5 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kho Dữ Liệu NotebookLM (4 Kho)</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'progress'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tiến Trình & Lời Bé Nói ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'voice'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Tùy Chỉnh Giọng Đọc</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Bảo Mật & Xóa Lịch Sử</span>
          </button>
        </div>

        {/* TAB 1: 4 KNOWLEDGE VAULTS */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            {/* Vault Category Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setActiveVaultCategory('vocab')}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  activeVaultCategory === 'vocab'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kho Từ Vựng ({words.length})</span>
              </button>

              <button
                onClick={() => setActiveVaultCategory('stories')}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  activeVaultCategory === 'stories'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kho Truyện ({fairyTaleStories.length})</span>
              </button>

              <button
                onClick={() => setActiveVaultCategory('books')}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  activeVaultCategory === 'books'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kho Sách ({educationalBooks.length})</span>
              </button>

              <button
                onClick={() => setActiveVaultCategory('music')}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  activeVaultCategory === 'music'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Kho Nhạc ({musicTracks.length})</span>
              </button>
            </div>

            {/* VAULT SUB-TAB: VOCABULARY */}
            {activeVaultCategory === 'vocab' && (
              <div className="space-y-4">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🔤 Kho Từ Vựng Tiếng Anh Đồng Bộ File Duy Nhất</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tổng hợp toàn bộ từ vựng luyện tập, phiên âm và mẹo nắn chỉnh dịu dàng của cún. Phụ huynh có thể xuất file để quản lý bằng NotebookLM.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleExportVocabularyJson}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs transition"
                      title="Tải toàn bộ từ vựng về máy thành 1 file JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất File NotebookLM</span>
                    </button>

                    <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nhập File</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportVocabularyFile}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={() => setShowWordForm(!showWordForm)}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Từ Mới</span>
                    </button>
                  </div>
                </div>

                {/* Add Word Form */}
                {showWordForm && (
                  <form
                    onSubmit={handleCreateWord}
                    className="bg-white p-5 rounded-3xl border-2 border-rose-300 shadow-md space-y-3 animate-in fade-in text-xs"
                  >
                    <h4 className="font-black text-sm text-rose-600">Thêm Từ Vựng Mới Vào Kho</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Từ tiếng Anh:</label>
                        <input
                          type="text"
                          required
                          value={newWord}
                          onChange={(e) => setNewWord(e.target.value)}
                          placeholder="Ví dụ: Elephant, Water..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Phiên âm cho bé dễ đọc:</label>
                        <input
                          type="text"
                          value={newPhonetic}
                          onChange={(e) => setNewPhonetic(e.target.value)}
                          placeholder="Ví dụ: /ˈel.ɪ.fənt/ (đọc là: e-li-phần-t)"
                          className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Nghĩa tiếng Việt:</label>
                        <input
                          type="text"
                          required
                          value={newMeaning}
                          onChange={(e) => setNewMeaning(e.target.value)}
                          placeholder="Ví dụ: Chú voi to lớn"
                          className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Icon minh họa:</label>
                        <input
                          type="text"
                          value={newEmoji}
                          onChange={(e) => setNewEmoji(e.target.value)}
                          placeholder="🐘"
                          className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden text-center text-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Câu ví dụ gần gũi:</label>
                      <input
                        type="text"
                        value={newExample}
                        onChange={(e) => setNewExample(e.target.value)}
                        placeholder="Ví dụ: The elephant has a long trunk."
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Mẹo cún nắn chỉnh dịu dàng (khi bé đọc chưa đúng):
                      </label>
                      <input
                        type="text"
                        value={newCoachingTip}
                        onChange={(e) => setNewCoachingTip(e.target.value)}
                        placeholder="Ví dụ: Nhắc bé mím môi nhẹ và phát âm âm đầu tròn vành nhé!"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowWordForm(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                      >
                        Lưu Từ Vựng
                      </button>
                    </div>
                  </form>
                )}

                {/* Vocabulary List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {words.map((w) => (
                    <div
                      key={w.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl p-1.5 bg-amber-50 rounded-xl">{w.iconEmoji}</span>
                            <div>
                              <h4 className="font-black text-base text-slate-900">{w.word}</h4>
                              <p className="text-xs text-amber-700 font-bold">{w.phonetic}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteWord(w.id)}
                            className="text-slate-300 hover:text-rose-600 p-1 rounded-lg"
                            title="Xóa từ này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 font-semibold mt-2">
                          Nghĩa: <strong className="text-rose-600">{w.vietnamese}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{w.exampleSentence}" ({w.exampleVietnamese})
                        </p>

                        {w.gentleCoachingNotes && (
                          <div className="mt-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-slate-600">
                            💡 <strong>Gợi ý nắn chỉnh:</strong> {w.gentleCoachingNotes}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {w.category || 'Từ vựng tiếng Anh'}
                        </span>
                        <button
                          onClick={() => onTestSpeak(w.word)}
                          className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe đọc</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VAULT SUB-TAB: STORIES & BOOKS */}
            {(activeVaultCategory === 'stories' || activeVaultCategory === 'books') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {activeVaultCategory === 'stories' ? 'Kho Truyện Cổ Tích' : 'Kho Sách Giáo Dục'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cún dựa vào nội dung trong kho này để kể chuyện và trả lời thắc mắc của bé.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setNewCategory(activeVaultCategory === 'stories' ? 'fairy_tale' : 'science');
                      setShowStoryUploadForm(!showStoryUploadForm);
                    }}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Sách / Truyện Mới</span>
                  </button>
                </div>

                {/* Upload Story Form */}
                {showStoryUploadForm && (
                  <form
                    onSubmit={handleCreateStory}
                    className="bg-white p-5 rounded-3xl border-2 border-rose-300 shadow-md space-y-3 animate-in fade-in text-xs"
                  >
                    <h4 className="font-black text-sm text-rose-600">
                      Tải Lên Sách / Truyện Vào Kho Tri Thức
                    </h4>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Chọn tệp văn bản từ máy (.txt, .md, .json):
                      </label>
                      <input
                        type="file"
                        accept=".txt,.md,.json"
                        onChange={handleStoryFileUpload}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Tên tác phẩm:</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Ví dụ: Cô Bé Bán Diêm, Thế Giới Động Vật..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Tác giả / Nguồn:</label>
                        <input
                          type="text"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="Ví dụ: Andersen, Sách khoa học..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Toàn bộ nội dung sách / truyện:</label>
                      <textarea
                        required
                        rows={6}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Dán toàn bộ nội dung vào đây..."
                        className="w-full p-3 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400 leading-relaxed text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Bài học nhân văn cho bé:</label>
                      <input
                        type="text"
                        value={newMoral}
                        onChange={(e) => setNewMoral(e.target.value)}
                        placeholder="Ví dụ: Biết sẻ chia, yêu thương thiên nhiên..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden focus:border-rose-400"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowStoryUploadForm(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                      >
                        Lưu Vào Kho
                      </button>
                    </div>
                  </form>
                )}

                {/* Stories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(activeVaultCategory === 'stories' ? fairyTaleStories : educationalBooks).map(
                    (story) => (
                      <div
                        key={story.id}
                        className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl p-1.5 bg-amber-50 rounded-xl">
                                {story.coverEmoji}
                              </span>
                              <div>
                                <h4 className="font-black text-sm text-slate-900">{story.title}</h4>
                                <span className="text-[10px] text-slate-400">{story.author}</span>
                              </div>
                            </div>

                            {story.category === 'custom' && (
                              <button
                                onClick={() => onDeleteStory(story.id)}
                                className="text-slate-300 hover:text-rose-600 p-1 rounded-lg"
                                title="Xóa tác phẩm này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2 bg-slate-50 p-2.5 rounded-xl">
                            {story.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                            ✓ Đã nạp vào NotebookLM
                          </span>

                          <button
                            onClick={() =>
                              onTestSpeak(
                                `Cún xin đọc câu chuyện: ${story.title}. ${story.content.slice(0, 150)}`
                              )
                            }
                            disabled={isSpeaking}
                            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Nghe thử</span>
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* VAULT SUB-TAB: MUSIC */}
            {activeVaultCategory === 'music' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Kho Nhạc Thiếu Nhi</h3>
                    <p className="text-xs text-slate-500">
                      Khi bé nói "Mở nhạc cho con nghe" hoặc "Cún hát đi", cún sẽ phát ngẫu nhiên một bài hát từ kho này.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {musicTracks.map((track) => (
                    <div
                      key={track.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-amber-50 rounded-xl">{track.icon}</span>
                        <div>
                          <h4 className="font-black text-sm text-slate-900">{track.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{track.description}</p>
                          <p className="text-[10px] text-slate-400 italic">"{track.lyrics}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onPlayMusicTrack && (
                          <button
                            onClick={() => onPlayMusicTrack(track)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1 transition"
                            title="Nghe thử bài hát"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Phát</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROGRESS & CHAT LOGS */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Lượt Bé Trò Chuyện</span>
                <span className="text-2xl font-black text-rose-600">{history.length}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Từ Vựng Đã Học</span>
                <span className="text-2xl font-black text-amber-600">{words.length}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">Thời Hạn Lưu Trữ</span>
                <span className="text-2xl font-black text-emerald-600">
                  {securitySettings.historyRetentionHours === 0
                    ? 'Tức thì'
                    : `${securitySettings.historyRetentionHours / 24} ngày`}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Nhật Ký Tương Tác & Lời Nói Của Bé
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tự động xóa sau {securitySettings.historyRetentionHours / 24} ngày để bảo vệ quyền riêng tư của bé.
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa nhật ký ngay</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Chưa có nhật ký nào hoặc dữ liệu cũ đã được tự động dọn dẹp theo chính sách bảo mật.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-2">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800">{h.title}</span>
                        <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                      </div>
                      <p className="text-slate-600">{h.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VOICE SETTINGS */}
        {activeTab === 'voice' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-5">
            <div>
              <h3 className="font-black text-base text-slate-900">
                Tùy Chỉnh Giọng Đọc Thân Mật Của Cún
              </h3>
              <p className="text-xs text-slate-500">
                Lựa chọn âm sắc ngọt ngào, gần gũi nhất để bé thấy thoải mái như nói chuyện với người thân.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {VOICE_PRESETS.map((preset) => {
                const isSelected = voiceSettings.presetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() =>
                      onUpdateVoiceSettings({
                        ...voiceSettings,
                        presetId: preset.id,
                        pitch: preset.pitch,
                        rate: preset.rate,
                        geminiVoice: preset.geminiVoice,
                      })
                    }
                    className={`p-3.5 rounded-2xl cursor-pointer border-2 transition ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 shadow-sm'
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{preset.icon}</span>
                      <span className="font-black text-xs text-slate-900">{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{preset.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center font-bold mb-1">
                  <span>Cao độ giọng (Pitch):</span>
                  <span className="text-rose-600">{voiceSettings.pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={voiceSettings.pitch}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      pitch: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center font-bold mb-1">
                  <span>Tốc độ đọc (Speed):</span>
                  <span className="text-rose-600">{voiceSettings.rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={voiceSettings.rate}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      rate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() =>
                onTestSpeak(`Gâu gâu! Bé yêu ơi, hôm nay bé có vui không nào? Cún nhớ bé lắm!`, voiceSettings)
              }
              disabled={isSpeaking}
              className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4" />
              <span>{isSpeaking ? 'Đang phát âm thanh...' : 'Nghe Thử Giọng Này'}</span>
            </button>
          </div>
        )}

        {/* TAB 4: SECURITY & AUTO-DELETE CHAT HISTORY */}
        {activeTab === 'security' && (
          <form
            onSubmit={handleSaveSecurity}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-5 text-xs"
          >
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                <span>Bảo Mật Thông Tin & Cài Đặt Tự Động Xóa Lịch Sử</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đảm bảo an toàn tuyệt đối cho cuộc trò chuyện của bé với cơ chế tự động dọn dẹp thông tin.
              </p>
            </div>

            {/* Retention Timer Config */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
              <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Thời Gian Tự Động Xóa Lịch Sử Trò Chuyện:</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { hours: 24, label: 'Sau 24 giờ (1 ngày)' },
                  { hours: 72, label: 'Sau 3 ngày (Khuyên dùng)' },
                  { hours: 168, label: 'Sau 7 ngày (1 tuần)' },
                  { hours: 720, label: 'Sau 30 ngày' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.hours}
                    onClick={() => setRetentionHours(item.hours)}
                    className={`p-2.5 rounded-xl border text-center transition font-bold text-xs ${
                      retentionHours === item.hours
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mọi nội dung giọng nói và hội thoại cũ hơn mốc thời gian này sẽ tự động bị xóa vĩnh viễn khỏi thiết bị để bảo vệ tuyệt đối sự riêng tư của gia đình.
              </p>
            </div>

            {/* PIN & Profile */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã PIN phụ huynh (4 số):</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pinForm}
                  onChange={(e) => setPinForm(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden font-mono tracking-widest text-center font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên bé đặt cho cún:</label>
                <input
                  type="text"
                  required
                  value={profileForm.puppyName}
                  onChange={(e) => setProfileForm({ ...profileForm, puppyName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/50 font-black text-amber-900 outline-hidden"
                />
              </div>
            </div>

            {/* Manual Immediate Purge */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-600 text-xs">Xóa Ngay Toàn Bộ Dữ Liệu</h4>
                  <p className="text-[11px] text-slate-500">
                    Xóa sạch toàn bộ lịch sử trò chuyện tức thì mà không cần chờ hết hạn.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Phụ huynh có chắc chắn muốn xóa sạch toàn bộ lịch sử trò chuyện ngay bây giờ?')) {
                      onClearHistory();
                      alert('Đã xóa sạch toàn bộ lịch sử trò chuyện an toàn!');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold border border-rose-200 transition text-xs"
                >
                  Xóa Ngay Lập Tức
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              {savedNotice && (
                <span className="text-emerald-600 font-bold">✓ Đã lưu cài đặt bảo mật thành công!</span>
              )}
              <button
                type="submit"
                className="ml-auto bg-gradient-to-r from-rose-500 to-amber-500 text-white px-6 py-2.5 rounded-2xl font-black shadow-md shadow-rose-200 active:scale-95 transition"
              >
                Lưu Thay Đổi Bảo Mật
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
