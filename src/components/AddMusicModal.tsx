import React, { useState, useRef } from 'react';
import {
  X,
  Music,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Check,
  Disc,
  FileAudio,
  AlertCircle,
} from 'lucide-react';
import { MusicTrack } from '../types/book';

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (track: MusicTrack) => void;
}

const GRADIENT_PRESETS = [
  { id: 'emerald', label: 'Xanh Lá', class: 'from-emerald-600 via-teal-900 to-[#121212]', bg: '#059669' },
  { id: 'purple', label: 'Tím Mộng Mơ', class: 'from-purple-700 via-indigo-950 to-[#121212]', bg: '#7e22ce' },
  { id: 'rose', label: 'Hồng Đào', class: 'from-rose-600 via-pink-950 to-[#121212]', bg: '#e11d48' },
  { id: 'amber', label: 'Vàng Nắng', class: 'from-amber-600 via-orange-950 to-[#121212]', bg: '#d97706' },
  { id: 'cyan', label: 'Xanh Lam', class: 'from-cyan-600 via-blue-950 to-[#121212]', bg: '#0891b2' },
  { id: 'indigo', label: 'Chàm Huyền Ảo', class: 'from-indigo-600 via-slate-900 to-[#121212]', bg: '#4f46e5' },
];

const MELODY_TEMPLATES = [
  {
    id: 'lullaby',
    name: 'Giai Điệu Hộp Nhạc Ru Bé Ngủ',
    notes: [
      { note: 'G4', duration: 0.6 },
      { note: 'E4', duration: 0.6 },
      { note: 'G4', duration: 0.6 },
      { note: 'C5', duration: 1.0 },
      { note: 'A4', duration: 0.6 },
      { note: 'G4', duration: 0.6 },
      { note: 'E4', duration: 0.8 },
      { note: 'D4', duration: 0.6 },
      { note: 'C4', duration: 1.2 },
    ],
    durationSec: 60,
  },
  {
    id: 'cheerful',
    name: 'Giai Điệu Thiếu Nhi Vui Tươi',
    notes: [
      { note: 'C4', duration: 0.35 },
      { note: 'E4', duration: 0.35 },
      { note: 'G4', duration: 0.35 },
      { note: 'C5', duration: 0.7 },
      { note: 'B4', duration: 0.35 },
      { note: 'A4', duration: 0.35 },
      { note: 'G4', duration: 0.7 },
      { note: 'F4', duration: 0.35 },
      { note: 'E4', duration: 0.35 },
      { note: 'D4', duration: 0.35 },
      { note: 'C4', duration: 0.7 },
    ],
    durationSec: 45,
  },
  {
    id: 'sweet',
    name: 'Giai Điệu Nhẹ Nhàng Thư Giãn',
    notes: [
      { note: 'E4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'A4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },
      { note: 'D4', duration: 0.5 },
      { note: 'C4', duration: 1.0 },
    ],
    durationSec: 40,
  },
];

export const AddMusicModal: React.FC<AddMusicModalProps> = ({ isOpen, onClose, onAddTrack }) => {
  const [sourceType, setSourceType] = useState<'upload' | 'url' | 'melody'>('upload');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<'vui_nhon' | 'ru_ngu' | 'tieng_anh' | 'dong_dao' | 'nhac_tre' | 'khong_loi'>('vui_nhon');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(60);
  const [selectedMelodyTemplate, setSelectedMelodyTemplate] = useState(MELODY_TEMPLATES[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)) {
      setErrorMsg('Vui lòng chọn tệp âm thanh hợp lệ (.mp3, .wav, .m4a, .ogg)');
      return;
    }

    setErrorMsg('');
    setUploadedFile(file);

    // Auto extract title from filename
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Try detecting audio duration safely
    try {
      const objUrl = URL.createObjectURL(file);
      const tempAudio = new Audio();
      tempAudio.preload = 'metadata';
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration && !isNaN(tempAudio.duration)) {
          setDetectedDuration(Math.round(tempAudio.duration));
        }
        URL.revokeObjectURL(objUrl);
      };
      tempAudio.onerror = (err) => {
        if (typeof err !== 'string') err?.preventDefault?.();
        URL.revokeObjectURL(objUrl);
      };
      tempAudio.src = objUrl;
    } catch {}
  };

  // Convert uploaded file to Data URL for durable local storage
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên bài hát!');
      return;
    }

    let finalAudioUrl: string | undefined = undefined;
    // Always provide musical notes fallback so the track NEVER fails to play
    let finalNotes: { note: string; duration: number }[] | undefined = selectedMelodyTemplate.notes;
    let finalDuration = detectedDuration;

    if (sourceType === 'upload') {
      if (!uploadedFile) {
        setErrorMsg('Vui lòng chọn tệp âm thanh tải lên!');
        return;
      }
      try {
        if (uploadedFile.size < 5 * 1024 * 1024) {
          finalAudioUrl = await readFileAsDataUrl(uploadedFile);
        } else {
          finalAudioUrl = URL.createObjectURL(uploadedFile);
        }
      } catch {
        finalAudioUrl = undefined;
      }
    } else if (sourceType === 'url') {
      if (!audioUrlInput.trim()) {
        setErrorMsg('Vui lòng nhập đường dẫn liên kết tệp âm thanh!');
        return;
      }
      finalAudioUrl = audioUrlInput.trim();
    } else {
      // Melody
      finalNotes = selectedMelodyTemplate.notes;
      finalDuration = selectedMelodyTemplate.durationSec;
    }

    const newTrack: MusicTrack = {
      id: `custom-track-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || 'Nhạc Thiếu Nhi Gia Đình',
      category,
      coverGradient: selectedGradient.class,
      coverBgColor: selectedGradient.bg,
      audioUrl: finalAudioUrl,
      notes: finalNotes,
      durationSec: finalDuration,
      lyrics: lyrics.trim() || undefined,
      isFavorite: false,
      isCustom: true,
      createdAt: Date.now(),
    };

    onAddTrack(newTrack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-2xl w-full max-w-lg flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#282828] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg shadow-[#1ed760]/20">
              <Music className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Thêm Bài Hát Vào Kho Nhạc
              </h3>
              <p className="text-xs text-neutral-400">
                Tải lên tệp MP3, dán đường dẫn link hoặc tạo giai điệu thư giãn
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Source Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-neutral-400 tracking-wider">
              Nguồn Tệp Âm Thanh
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('upload')}
                className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  sourceType === 'upload'
                    ? 'border-[#1ed760] bg-[#1ed760]/15 text-white'
                    : 'border-[#333] bg-[#222] text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4 text-[#1ed760]" />
                <span>Tải Tệp Lên</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  sourceType === 'url'
                    ? 'border-[#1ed760] bg-[#1ed760]/15 text-white'
                    : 'border-[#333] bg-[#222] text-neutral-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4 text-[#1ed760]" />
                <span>Link Nhạc</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('melody')}
                className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  sourceType === 'melody'
                    ? 'border-[#1ed760] bg-[#1ed760]/15 text-white'
                    : 'border-[#333] bg-[#222] text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#1ed760]" />
                <span>Giai Điệu Ru</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Upload Audio File */}
          {sourceType === 'upload' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-xl border-2 border-dashed border-[#383838] hover:border-[#1ed760] bg-[#1f1f1f] hover:bg-[#252525] cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#1ed760]/10 group-hover:bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center transition-all">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white group-hover:text-[#1ed760] transition-colors">
                    {uploadedFile ? uploadedFile.name : 'Bấm để chọn tệp bài hát'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Hỗ trợ tệp MP3, WAV, M4A, OGG từ điện thoại hoặc máy tính
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Audio URL */}
          {sourceType === 'url' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-400 uppercase">
                Đường Dẫn Âm Thanh (URL MP3/Audio Link)
              </label>
              <input
                type="url"
                value={audioUrlInput}
                onChange={(e) => setAudioUrlInput(e.target.value)}
                placeholder="https://example.com/audio/bai-hat-thieu-nhi.mp3"
                className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg px-3 py-2 text-white outline-none text-xs"
              />
            </div>
          )}

          {/* Mode 3: Melody Synthesizer */}
          {sourceType === 'melody' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-400 uppercase">
                Chọn Phong Cách Giai Điệu Hộp Nhạc:
              </label>
              <div className="space-y-1.5">
                {MELODY_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedMelodyTemplate(tmpl)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedMelodyTemplate.id === tmpl.id
                        ? 'border-[#1ed760] bg-[#1ed760]/15 text-white'
                        : 'border-[#333] bg-[#222] text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Disc className="w-4 h-4 text-[#1ed760]" />
                      <div>
                        <p className="font-bold text-xs text-white">{tmpl.name}</p>
                        <p className="text-[10px] text-neutral-400">Thời lượng: ~{tmpl.durationSec} giây</p>
                      </div>
                    </div>
                    {selectedMelodyTemplate.id === tmpl.id && (
                      <Check className="w-4 h-4 text-[#1ed760]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Song Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                Tên Bài Hát <span className="text-[#1ed760]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Cháu Lên Ba, Con Heo Đất..."
                className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg px-3 py-2 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                Ca Sĩ / Người Thể Hiện
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="VD: Bé Bào Ngư, Mẹ Yêu Hát Tặng..."
                className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg px-3 py-2 text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-neutral-400 uppercase">
              Thể Loại Bài Hát
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'vui_nhon', label: 'Vui nhộn' },
                { id: 'ru_ngu', label: 'Ru ngủ' },
                { id: 'tieng_anh', label: 'Tiếng Anh' },
                { id: 'dong_dao', label: 'Đồng dao' },
                { id: 'nhac_tre', label: 'Gia đình' },
                { id: 'khong_loi', label: 'Không lời' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                    category === c.id
                      ? 'border-[#1ed760] bg-[#1ed760]/20 text-[#1ed760]'
                      : 'border-[#333] bg-[#222] text-neutral-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Album Cover Theme */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-400 uppercase">
              Màu Sắc Bìa Album Spotify
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedGradient(preset)}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${preset.class} border-2 transition-all shrink-0 flex items-center justify-center ${
                    selectedGradient.id === preset.id
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  title={preset.label}
                >
                  {selectedGradient.id === preset.id && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Lyrics (Optional) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-neutral-400 uppercase">
                Lời Bài Hát (Để Bé & Ba Mẹ Cùng Hát Karaoke)
              </label>
              <span className="text-[10px] text-neutral-500">Tùy chọn</span>
            </div>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Dán lời bài hát vào đây để hiển thị chế độ Lời Bài Hát (Lyrics) khi phát nhạc..."
              className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg p-2.5 text-white text-xs outline-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu Bài Hát Vào Kho Nhạc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
