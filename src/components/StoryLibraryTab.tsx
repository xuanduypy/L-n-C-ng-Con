import React, { useState } from 'react';
import { StoryBookItem, ChildProfile, VoiceSettings } from '../types';
import { PuppyAvatar } from './PuppyAvatar';
import {
  BookOpen,
  Upload,
  Play,
  Pause,
  Square,
  Sparkles,
  HelpCircle,
  X,
  Plus,
  Send,
  Star,
  Moon,
  Volume2,
} from 'lucide-react';

interface StoryLibraryTabProps {
  stories: StoryBookItem[];
  onAddStory: (newStory: StoryBookItem) => void;
  childProfile: ChildProfile;
  voiceSettings: VoiceSettings;
  isSpeaking: boolean;
  onSpeakText: (text: string, options?: { lang?: string; onEnd?: () => void }) => void;
  onStopSpeak: () => void;
  onAskPuppyAboutStory: (storyTitle: string, question: string, storyContent: string) => void;
}

export const StoryLibraryTab: React.FC<StoryLibraryTabProps> = ({
  stories,
  onAddStory,
  childProfile,
  voiceSettings,
  isSpeaking,
  onSpeakText,
  onStopSpeak,
  onAskPuppyAboutStory,
}) => {
  const [selectedStory, setSelectedStory] = useState<StoryBookItem | null>(null);
  const [readingParagraphIndex, setReadingParagraphIndex] = useState<number>(0);
  const [isBedtimeMode, setIsBedtimeMode] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showQAModal, setShowQAModal] = useState<boolean>(false);
  const [qaQuestion, setQaQuestion] = useState<string>('');
  const [qaLoading, setQaLoading] = useState<boolean>(false);
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);

  // Form states for uploading custom story / book
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadMoral, setUploadMoral] = useState('');
  const [uploadEmoji, setUploadEmoji] = useState('📖');

  // Split story into readable paragraphs
  const paragraphs = selectedStory
    ? selectedStory.content
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const handleStartReadingStory = (story: StoryBookItem) => {
    setSelectedStory(story);
    setReadingParagraphIndex(0);
    setQaAnswer(null);
    const firstParagraph = story.content.split('\n\n')[0] || story.content;
    onSpeakText(
      `Cún xin kể cho bé ${childProfile.name} nghe câu chuyện: "${story.title}". ${firstParagraph}`
    );
  };

  const handleReadSpecificParagraph = (index: number) => {
    setReadingParagraphIndex(index);
    if (paragraphs[index]) {
      onSpeakText(paragraphs[index], {
        onEnd: () => {
          if (index + 1 < paragraphs.length) {
            setReadingParagraphIndex(index + 1);
          }
        },
      });
    }
  };

  const handleStopReading = () => {
    onStopSpeak();
  };

  const handleAskQuestion = async () => {
    if (!selectedStory || !qaQuestion.trim()) return;

    setQaLoading(true);
    setQaAnswer(null);
    try {
      const res = await fetch('/api/gemini/storybook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: selectedStory.title,
          storyContent: selectedStory.content,
          action: 'ask_question',
          question: qaQuestion.trim(),
          childName: childProfile.name,
          voiceStyle: voiceSettings.presetId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.answer || data.moralLesson || 'Cún thấy câu chuyện thật tuyệt vời!';
        setQaAnswer(reply);
        onSpeakText(reply);
      } else {
        throw new Error('Grounded QA failed');
      }
    } catch (err: any) {
      const fallback = `Gâu gâu! Dựa vào câu chuyện "${selectedStory.title}", chi tiết này cho thấy lòng tốt và sự yêu thương luôn được đền đáp xứng đáng bé nha!`;
      setQaAnswer(fallback);
      onSpeakText(fallback);
    } finally {
      setQaLoading(false);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) return;

    const newStory: StoryBookItem = {
      id: `custom-story-${Date.now()}`,
      title: uploadTitle.trim(),
      category: 'custom',
      author: uploadAuthor.trim() || 'Phụ huynh tải lên',
      coverEmoji: uploadEmoji || '📖',
      summary: uploadContent.slice(0, 100) + '...',
      content: uploadContent.trim(),
      moralLesson: uploadMoral.trim() || 'Bài học yêu thương và phát triển',
      suggestedAge: 'Mọi lứa tuổi',
      isFavorite: true,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onAddStory(newStory);
    setShowUploadModal(false);
    setUploadTitle('');
    setUploadAuthor('');
    setUploadContent('');
    setUploadMoral('');
    setSelectedStory(newStory);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setUploadContent(content);
        if (!uploadTitle) {
          setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-16 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Kho Tri Thức & Truyện NotebookLM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Cún Kể Bé Nghe</h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Đọc chính xác nội dung sách, truyện cổ tích và giải đáp mọi câu hỏi của bé
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-white text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-2xl font-black text-xs shadow-md active:scale-95 transition flex items-center gap-1.5 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Tải Sách / Truyện</span>
        </button>
      </div>

      {/* ACTIVE STORY PLAYER (If reading a story) */}
      {selectedStory ? (
        <div
          className={`rounded-3xl p-5 shadow-xl border-4 transition-all duration-300 ${
            isBedtimeMode
              ? 'bg-slate-900 border-indigo-700 text-slate-100'
              : 'bg-white border-amber-300 text-slate-800'
          }`}
        >
          {/* Reader Top Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/50">
            <button
              onClick={() => {
                onStopSpeak();
                setSelectedStory(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>← Trở về kho truyện</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBedtimeMode(!isBedtimeMode)}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                  isBedtimeMode
                    ? 'bg-indigo-950 text-amber-300 border border-indigo-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
                title="Bật/Tắt chế độ ngủ đêm dịu mắt"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chế độ ngủ đêm</span>
              </button>

              <button
                onClick={() => setShowQAModal(true)}
                className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1 hover:bg-rose-600 active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Hỏi Cún Về Truyện</span>
              </button>
            </div>
          </div>

          {/* Puppy Narrator Header */}
          <div className="my-4 flex items-center gap-4 bg-amber-50/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-amber-200/60">
            <PuppyAvatar
              name={childProfile.puppyName}
              mood="reading"
              costume="glasses"
              isSpeaking={isSpeaking}
              size="sm"
            />
            <div>
              <span className="text-3xl">{selectedStory.coverEmoji}</span>
              <h3 className="text-lg font-black">{selectedStory.title}</h3>
              <p className="text-xs opacity-75">Tác giả / Nguồn: {selectedStory.author}</p>
              <div className="flex items-center gap-2 mt-2">
                {isSpeaking ? (
                  <button
                    onClick={handleStopReading}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow hover:bg-rose-700"
                  >
                    <Square className="w-3 h-3" />
                    <span>Dừng Đọc</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleReadSpecificParagraph(readingParagraphIndex)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700"
                  >
                    <Play className="w-3 h-3" />
                    <span>Tiếp Tục Đọc</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Story Paragraphs with Interactive Tap to Read */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 text-sm sm:text-base leading-relaxed">
            {paragraphs.map((p, idx) => {
              const isCurrent = readingParagraphIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleReadSpecificParagraph(idx)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition border-2 ${
                    isCurrent
                      ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 font-semibold shadow-xs'
                      : 'border-transparent hover:border-amber-200 hover:bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs opacity-50 shrink-0 mt-1">#{idx + 1}</span>
                    <p>{p}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Moral Lesson Footer */}
          {selectedStory.moralLesson && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-100/70 dark:bg-slate-800 border border-amber-300/80 text-xs text-amber-950 dark:text-amber-200">
              <strong>🌱 Bài học ý nghĩa:</strong> {selectedStory.moralLesson}
            </div>
          )}
        </div>
      ) : (
        /* STORYBOOK SHELF */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-800">
              Tủ Sách & Truyện Của Bé ({stories.length})
            </h3>
            <span className="text-xs text-slate-500 font-bold">Chạm để cún đọc cho bé nghe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-3xl p-4 shadow-sm border-2 border-slate-200 hover:border-amber-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-4xl p-2 bg-amber-50 rounded-2xl shrink-0">
                      {story.coverEmoji}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {story.category === 'custom'
                        ? 'Phụ huynh tải lên'
                        : story.category === 'bedtime'
                        ? 'Ru bé ngủ'
                        : 'Cổ tích kinh điển'}
                    </span>
                  </div>

                  <h4 className="font-black text-base text-slate-800 line-clamp-1">
                    {story.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {story.author}
                  </span>

                  <button
                    onClick={() => handleStartReadingStory(story)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm active:scale-95 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe Cún Kể</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTEBOOKLM GROUNDED Q&A MODAL */}
      {showQAModal && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border-4 border-amber-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Hỏi Cún Về: "{selectedStory.title}"
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cún trả lời chính xác dựa theo nội dung truyện (NotebookLM Grounding)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQAModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Answer Display */}
            {qaAnswer && (
              <div className="my-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm leading-relaxed text-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 mb-1">
                  <span>🐶 {childProfile.puppyName} trả lời bé:</span>
                </div>
                <p className="whitespace-pre-wrap">{qaAnswer}</p>
              </div>
            )}

            {qaLoading && (
              <div className="my-6 text-center text-sm font-bold text-amber-600 flex items-center justify-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Cún đang lật mở từng trang sách để tìm câu trả lời cho bé...</span>
              </div>
            )}

            {/* Suggested Sample Questions */}
            <div className="my-3">
              <p className="text-xs font-bold text-slate-400 mb-1.5">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Ý nghĩa câu chuyện này là gì?',
                  'Nhân vật chính đã làm điều gì dũng cảm?',
                  'Tại sao lại có kết thúc như vậy?',
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQaQuestion(q)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Question */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskQuestion();
                }}
                placeholder="Bé thắc mắc điều gì về câu chuyện này...?"
                className="flex-1 text-xs sm:text-sm p-3 rounded-2xl border-2 border-amber-200 outline-hidden focus:border-rose-400"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!qaQuestion.trim() || qaLoading}
                className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-4 rounded-2xl font-bold text-xs disabled:opacity-50"
              >
                Hỏi Cún
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD CUSTOM STORY / BOOK MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border-4 border-amber-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-black text-slate-900">
                  Tải Lên Kho Sách & Truyện Cổ Tích
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Chọn tệp văn bản (.txt, .md, .json) từ máy tính/điện thoại:
                </label>
                <input
                  type="file"
                  accept=".txt,.md,.json,.doc,.docx"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên câu chuyện / Quyển sách:
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ví dụ: Hoàng Tử Bé, Dế Mèn Phiêu Lưu Ký..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-400 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tác giả / Nguồn:</label>
                <input
                  type="text"
                  value={uploadAuthor}
                  onChange={(e) => setUploadAuthor(e.target.value)}
                  placeholder="Ví dụ: Tô Hoài, Truyện Cổ Andersen..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-400 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nội dung câu chuyện / trích đoạn sách:
                </label>
                <textarea
                  required
                  rows={6}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Dán toàn bộ nội dung câu chuyện vào đây. Chú cún sẽ đọc và trả lời mọi thắc mắc dựa trên chính nội dung này..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-400 outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Bài học ý nghĩa cho bé:
                </label>
                <input
                  type="text"
                  value={uploadMoral}
                  onChange={(e) => setUploadMoral(e.target.value)}
                  placeholder="Ví dụ: Biết ơn cha mẹ, dũng cảm và yêu thương loài vật"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-400 outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-black shadow-md shadow-rose-200"
                >
                  Lưu Vào Kho Truyện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
