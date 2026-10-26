import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Check, FileText } from 'lucide-react';
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

  // Chapter fields
  const [chapterTitle, setChapterTitle] = useState('Chương 1: Khởi đầu');
  const [textContent, setTextContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentWords = countWords(textContent);
  const currentDuration = estimateDuration(currentWords);

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
    };

    onAddBook(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in duration-200">
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
                  : 'Thêm Sách Bằng Văn Bản & Giọng Đọc'}
              </h3>
              <p className="text-xs text-neutral-400">
                Nhập hoặc dán văn bản để ứng dụng tự động chia đoạn và tạo giọng đọc
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs md:text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Paste Sample Button */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#242424] border border-[#333333]">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sparkles className="w-4 h-4 text-[#1ed760]" />
              <span className="text-xs">Chưa có sẵn văn bản? Thử dán đoạn trích mẫu để kiểm tra giọng đọc ngay.</span>
            </div>
            <button
              type="button"
              onClick={handlePasteSample}
              className="px-3 py-1 rounded bg-[#333333] hover:bg-[#3d3d3d] text-white text-xs font-semibold shrink-0"
            >
              Dán mẫu thử
            </button>
          </div>

          {!isAddingChapterOnly && (
            <div className="space-y-4">
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
                    placeholder="VD: Nghìn Lẻ Một Đêm, Hạt Giống Tâm Hồn..."
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-md px-3 py-2 text-white outline-none"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="VD: Khuyết Danh, Nguyễn Nhật Ánh..."
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-md px-3 py-2 text-white outline-none"
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
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-md px-3 py-2 text-white outline-none"
                  >
                    <option value="Văn học">Văn học cổ điển & Hiện đại</option>
                    <option value="Kỹ năng sống">Kỹ năng sống & Phát triển</option>
                    <option value="Cổ tích & Ngụ ngôn">Cổ tích & Ngụ ngôn</option>
                    <option value="Triết học & Tư tưởng">Triết học & Tư tưởng</option>
                    <option value="Tản văn">Tản văn & Truyện ngắn</option>
                    <option value="Tùy chỉnh">Tùy chỉnh khác</option>
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
                    placeholder="https://... (để trống để dùng bìa gradient)"
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-md px-3 py-2 text-white outline-none"
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
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 border transition-all ${
                          selectedGradient.name === g.name
                            ? 'border-[#1ed760] bg-[#2a2a2a] text-white shadow'
                            : 'border-[#333333] bg-[#202020] text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: g.bg }}
                        />
                        <span>{g.name}</span>
                        {selectedGradient.name === g.name && (
                          <Check className="w-3.5 h-3.5 text-[#1ed760]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chapter Title */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
              Tiêu đề chương *
            </label>
            <input
              type="text"
              required
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="VD: Chương 1: Bắt đầu chuyến phiêu lưu"
              className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-md px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Text Content (The meat!) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase text-neutral-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Nội dung văn bản sách (Nhập hoặc dán tại đây) *</span>
              </label>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{currentWords.toLocaleString('vi-VN')} từ</span>
                <span>•</span>
                <span className="text-[#1ed760] font-semibold">
                  ~ {formatTime(currentDuration)} nghe
                </span>
              </div>
            </div>

            <textarea
              required
              rows={8}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Dán nội dung truyện, đoạn trích sách, thơ hoặc tài liệu vào đây... Ứng dụng sẽ tự động phân giải thành từng câu và kích hoạt giọng đọc chuẩn xác cho bạn."
              className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-md p-3 text-white outline-none font-serif leading-relaxed text-sm resize-y"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-[#282828] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full hover:bg-[#282828] text-neutral-300 hover:text-white font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAddingChapterOnly ? 'Lưu chương mới' : 'Tạo sách & Giọng đọc'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
