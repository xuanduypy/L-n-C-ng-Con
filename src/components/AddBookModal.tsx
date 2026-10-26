import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Check, FileText, Upload, Mic, User } from 'lucide-react';
import { Book, Chapter } from '../types/book';
import { countWords, estimateDuration, formatTime } from '../utils/textParser';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (newBook: Book) => void;
  targetBookForChapter?: Book | null;
  onAddChapterToBook?: (bookId: string, newChapter: Chapter) => void;
}

const COVER_GRADIENTS = [
  { name: 'Xanh Ngọc Emerald', gradient: 'from-emerald-700 via-emerald-950 to-[#121212]', bg: '#047857' },
  { name: 'Tím Huyền Bí', gradient: 'from-purple-800 via-purple-950 to-[#121212]', bg: '#6b21a8' },
  { name: 'Xanh Dương Đại Dương', gradient: 'from-blue-700 via-blue-950 to-[#121212]', bg: '#1d4ed8' },
  { name: 'Hổ Phách Ấm Áp', gradient: 'from-amber-600 via-amber-950 to-[#121212]', bg: '#b45309' },
  { name: 'Đỏ Ruby Quý Phái', gradient: 'from-rose-700 via-rose-950 to-[#121212]', bg: '#be123c' },
  { name: 'Đen Tuyển Khói', gradient: 'from-neutral-700 via-neutral-900 to-[#121212]', bg: '#333333' },
];

const SAMPLE_TEXT = `Buổi sáng hôm ấy, bầu trời trong vắt như một viên ngọc bích khổng lồ. Những tia nắng vàng dịu len lỏi qua từng tán lá xanh mướt, đánh thức cả khu vườn sau một giấc ngủ dài.

Tiếng chim hót ríu rít trên cành bưởi đượm hương hoa thơm ngát. Mọi âu lo thường nhật như tan biến vào hư không, chỉ còn lại sự an yên và niềm biết ơn sâu sắc đối với cuộc sống tươi đẹp này.

Khi ta biết lắng nghe thế giới bằng cả tấm lòng chân thành, vạn vật quanh ta bỗng trở nên diệu kỳ và tràn đầy ý nghĩa. Hãy bắt đầu một ngày mới với nụ cười rạng rỡ và một tâm hồn rộng mở!`;

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onAddBook,
  targetBookForChapter,
  onAddChapterToBook,
}) => {
  const isAddingChapterOnly = !!targetBookForChapter;

  // Book fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Văn học');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(COVER_GRADIENTS[0]);
  const [appliedVoiceType, setAppliedVoiceType] = useState<'user_voice' | 'gemini' | 'browser'>('user_voice');

  // Chapter fields
  const [chapterTitle, setChapterTitle] = useState('Chương 1: Khởi đầu');
  const [textContent, setTextContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentWords = countWords(textContent);
  const currentDuration = estimateDuration(currentWords);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title && !isAddingChapterOnly) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(fileNameWithoutExt);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setTextContent(text);
        setErrorMessage('');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSample = () => {
    setTextContent(SAMPLE_TEXT);
    setErrorMessage('');
    if (!title && !isAddingChapterOnly) {
      setTitle('Bình Minh Trong Trẻo');
      setAuthor('Tản Văn Đời Sống');
      setCategory('Tản văn');
      setDescription('Bài tản văn nhẹ nhàng về buổi sáng thanh bình và niềm yêu thương cuộc sống.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!textContent.trim()) {
      setErrorMessage('Vui lòng nhập hoặc dán nội dung văn bản cho cuốn sách!');
      return;
    }
    setErrorMessage('');

    if (isAddingChapterOnly && targetBookForChapter && onAddChapterToBook) {
      // Add chapter to existing book
      const newChapter: Chapter = {
        id: `chap-${Date.now()}`,
        title: chapterTitle.trim() || `Chương ${targetBookForChapter.chapters.length + 1}`,
        content: textContent.trim(),
        order: targetBookForChapter.chapters.length + 1,
        wordCount: currentWords,
        estimatedDurationSec: currentDuration,
      };
      onAddChapterToBook(targetBookForChapter.id, newChapter);
      onClose();
      return;
    }

    // Add brand new book
    const newBookId = `custom-${Date.now()}`;
    const initialChapter: Chapter = {
      id: `chap-${Date.now()}`,
      title: chapterTitle.trim() || 'Chương 1',
      content: textContent.trim(),
      order: 1,
      wordCount: currentWords,
      estimatedDurationSec: currentDuration,
    };

    const newBook: Book = {
      id: newBookId,
      title: title.trim() || 'Tác Phẩm Mới',
      author: author.trim() || 'Tác giả Tự do',
      category: category.trim() || 'Tùy chỉnh',
      description: description.trim() || 'Sách do người dùng tự nhập nội dung văn bản.',
      coverUrl: coverUrl.trim() || undefined,
      coverGradient: selectedGradient.gradient,
      coverBgColor: selectedGradient.bg,
      createdAt: Date.now(),
      chapters: [initialChapter],
      readCount: 1,
      likesCount: 1,
      isFavorite: false,
      appliedVoiceType,
    };

    onAddBook(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#282828] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center">
              <BookOpen className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isAddingChapterOnly
                  ? `Thêm Chương Vào: "${targetBookForChapter.title}"`
                  : 'Thêm Sách Bằng Văn Bản & Đọc Bằng Giọng Bạn'}
              </h3>
              <p className="text-xs text-neutral-400">
                Nhập hoặc tải tệp văn bản để DiNo tự động tạo sách nói đọc bằng Giọng Người Dùng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-red-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Sách metadata (Only when creating a new book) */}
          {!isAddingChapterOnly && (
            <div className="space-y-3.5 pb-2 border-b border-[#2a2a2a]">
              {/* Giọng Đọc Áp Dụng (Voice Selection) */}
              <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#383838] space-y-2">
                <label className="block text-xs font-bold uppercase text-[#1ed760] tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4" />
                  <span>Giọng Đọc Cho Sách Này:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAppliedVoiceType('user_voice')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      appliedVoiceType === 'user_voice'
                        ? 'border-[#1ed760] bg-[#1ed760]/20 text-white shadow'
                        : 'border-[#333] bg-[#1a1a1a] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#1ed760]" />
                        Giọng Người Dùng
                      </span>
                      {appliedVoiceType === 'user_voice' && <Check className="w-3.5 h-3.5 text-[#1ed760]" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Dùng giọng thu âm của bạn (Khuyên dùng)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppliedVoiceType('gemini')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      appliedVoiceType === 'gemini'
                        ? 'border-[#1ed760] bg-[#1ed760]/20 text-white shadow'
                        : 'border-[#333] bg-[#1a1a1a] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        AI Studio
                      </span>
                      {appliedVoiceType === 'gemini' && <Check className="w-3.5 h-3.5 text-[#1ed760]" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Giọng truyền cảm AI Studio</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppliedVoiceType('browser')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      appliedVoiceType === 'browser'
                        ? 'border-[#1ed760] bg-[#1ed760]/20 text-white shadow'
                        : 'border-[#333] bg-[#1a1a1a] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Trình Duyệt</span>
                      {appliedVoiceType === 'browser' && <Check className="w-3.5 h-3.5 text-[#1ed760]" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Giọng chuẩn offline máy</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    Tên sách / Tác phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Nghìn Lẻ Một Đêm, Chuyện Kể Cho Con..."
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    Tác giả / Người kể
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="VD: Ba Mẹ, Khuyết Danh, Nguyễn Nhật Ánh..."
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    Thể loại
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Văn học">Văn học cổ điển & Hiện đại</option>
                    <option value="Kỹ năng sống">Kỹ năng sống & Phát triển</option>
                    <option value="Cổ tích & Ngụ ngôn">Cổ tích & Ngụ ngôn</option>
                    <option value="Tản văn">Tản văn & Truyện ngắn</option>
                    <option value="Tùy chỉnh">Sách tự tạo</option>
                  </select>
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    URL Ảnh bìa (Tùy chọn)
                  </label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://... (hoặc chọn màu Spotify bên dưới)"
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* Cover Gradient Presets */}
              {!coverUrl && (
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">
                    Màu sắc phong cách bìa Spotify:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COVER_GRADIENTS.map((g) => (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => setSelectedGradient(g)}
                        className={`h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          selectedGradient.name === g.name
                            ? 'ring-2 ring-white scale-105 shadow'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: g.bg }}
                      >
                        {selectedGradient.name === g.name && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chapter / Content section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-neutral-400">
                Tên chương:
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 text-xs cursor-pointer transition-colors border border-[#3e3e3e]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải tệp .txt/.doc</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handlePasteSample}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-amber-300 text-xs transition-colors border border-[#3e3e3e]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dán văn bản mẫu</span>
                </button>
              </div>
            </div>

            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="VD: Chương 1: Sự khởi đầu"
              className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-xl px-3 py-2 text-white outline-none"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase text-neutral-400">
                  Nội dung văn bản để đọc *
                </label>
                <span className="text-xs text-neutral-400">
                  {currentWords} từ • Ước tính {formatTime(currentDuration)}
                </span>
              </div>
              <textarea
                required
                rows={7}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Dán hoặc gõ nội dung câu chuyện, bài tản văn hoặc sách vào đây. Hệ thống sẽ tự động tách câu, căn chỉnh ngắt nghỉ tự nhiên..."
                className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-2xl p-3 text-white outline-none leading-relaxed text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#282828]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              {isAddingChapterOnly ? 'Lưu Chương Này' : 'Tạo Sách & Nghe Ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
