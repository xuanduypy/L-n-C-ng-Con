import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music,
  Upload,
  Check,
  FileAudio,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { MusicTrack } from '../types/book';
import { storeAudioBlob } from '../utils/audioVault';
import { recognizeAudioMetadata, ParsedAudioMetadata } from '../utils/audioMetadataParser';

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

export const AddMusicModal: React.FC<AddMusicModalProps> = ({ isOpen, onClose, onAddTrack }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<'vui_nhon' | 'ru_ngu' | 'tieng_anh' | 'dong_dao' | 'nhac_tre' | 'khong_loi'>('vui_nhon');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [lyrics, setLyrics] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionInfo, setRecognitionInfo] = useState<ParsedAudioMetadata | null>(null);

  // Audio Preview state
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop preview audio when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (previewUrlRef.current) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch {}
        previewUrlRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setIsPreviewPlaying(false);
    setPreviewCurrentTime(0);
  };

  const handleTogglePreview = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => setIsPreviewPlaying(false));
    }
  };

  // Handle file selection with Smart Song Title & Artist Recognition
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)) {
      setErrorMsg('Vui lòng chọn tệp âm thanh hợp lệ: mp3, wav, m4a, ogg, flac');
      return;
    }

    setErrorMsg('');
    setUploadedFile(file);
    stopPreview();
    setIsRecognizing(true);

    try {
      // 1. Smart Title, Artist & Lyrics recognition from ID3 tags & filename
      const parsed = await recognizeAudioMetadata(file);
      setRecognitionInfo(parsed);
      setTitle(parsed.title);
      setArtist(parsed.artist);
      if (parsed.lyrics && !lyrics) {
        setLyrics(parsed.lyrics);
      }

      // Auto-suggest category based on title/artist keywords
      const lower = `${parsed.title} ${parsed.artist}`.toLowerCase();
      if (lower.includes('ru') || lower.includes('ngủ') || lower.includes('lullaby') || lower.includes('sleep')) {
        setCategory('ru_ngu');
      } else if (lower.includes('english') || lower.includes('abc') || lower.includes('nursery') || /^[a-z0-9\s.,!?'"-]+$/i.test(parsed.title)) {
        setCategory('tieng_anh');
      } else if (lower.includes('đồng dao') || lower.includes('dân ca') || lower.includes('bà còng')) {
        setCategory('dong_dao');
      } else if (lower.includes('không lời') || lower.includes('piano') || lower.includes('instrumental') || lower.includes('acoustic')) {
        setCategory('khong_loi');
      } else {
        setCategory('vui_nhon');
      }
    } catch (err) {
      console.warn('Metadata recognition note:', err);
    } finally {
      setIsRecognizing(false);
    }

    // 2. Set up audio element for preview & duration detection
    try {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const objUrl = URL.createObjectURL(file);
      previewUrlRef.current = objUrl;

      const audio = new Audio(objUrl);
      previewAudioRef.current = audio;
      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          const dur = Math.round(audio.duration);
          setDetectedDuration(dur);
          setPreviewDuration(dur);
        }
      };

      audio.ontimeupdate = () => {
        setPreviewCurrentTime(Math.round(audio.currentTime));
      };

      audio.onended = () => {
        setIsPreviewPlaying(false);
        setPreviewCurrentTime(0);
      };

      audio.onerror = () => {
        setErrorMsg('Không thể giải mã tệp âm thanh. Vui lòng thử định dạng MP3 hoặc WAV chuẩn.');
      };
    } catch (err) {
      console.warn('Preview audio setup error:', err);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setErrorMsg('Vui lòng chọn tệp âm thanh tải lên!');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên bài hát!');
      return;
    }

    setIsSubmitting(true);
    stopPreview();

    try {
      const trackId = `custom-track-${Date.now()}`;

      // 1. Store persistent binary audio blob in IndexedDB vault
      await storeAudioBlob(trackId, uploadedFile);

      // 2. Generate Object URL for immediate playback
      const finalAudioUrl = URL.createObjectURL(uploadedFile);

      const newTrack: MusicTrack = {
        id: trackId,
        title: title.trim(),
        artist: artist.trim() || 'Nhạc Thiếu Nhi Gia Đình',
        category,
        coverGradient: selectedGradient.class,
        coverBgColor: selectedGradient.bg,
        audioUrl: finalAudioUrl,
        durationSec: detectedDuration,
        lyrics: lyrics.trim() || undefined,
        isFavorite: false,
        isCustom: true,
        hasBlobInVault: true,
        createdAt: Date.now(),
      };

      onAddTrack(newTrack);
      onClose();
    } catch (err) {
      console.error('Submit track error:', err);
      setErrorMsg('Có lỗi xảy ra khi lưu bài hát. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
                Tải tệp âm thanh (MP3, WAV, M4A, FLAC) với tự động nhận diện tên bài hát
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors cursor-pointer"
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

          {/* Upload Audio File Area (Bỏ thêm bằng link & giai điệu ru theo yêu cầu) */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group ${
                uploadedFile
                  ? 'border-[#1ed760]/70 bg-[#1ed760]/5'
                  : 'border-[#383838] hover:border-[#1ed760] bg-[#1f1f1f] hover:bg-[#252525]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#1ed760]/10 group-hover:bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center transition-all">
                {isRecognizing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#1ed760]" />
                ) : (
                  <FileAudio className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-white group-hover:text-[#1ed760] transition-colors">
                  {uploadedFile ? uploadedFile.name : 'Bấm để chọn tệp âm thanh tải lên'}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Hỗ trợ MP3, WAV, M4A, OGG, FLAC • Tự động nhận diện tên bài hát & ca sĩ
                </p>
                {uploadedFile && (
                  <p className="text-[10px] text-amber-400 font-bold mt-1">
                    Kích thước: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Thời lượng: {formatSeconds(detectedDuration)}
                  </p>
                )}
              </div>
            </div>

            {/* Smart Recognition Status Badge */}
            {recognitionInfo && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-200">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white">Đã nhận diện:</span>{' '}
                  <span className="text-emerald-200 font-semibold">{recognitionInfo.title}</span>
                  {recognitionInfo.artist && (
                    <span className="text-neutral-400"> — {recognitionInfo.artist}</span>
                  )}
                  <span className="text-[10px] ml-1.5 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold uppercase">
                    {recognitionInfo.detectedFrom === 'id3' ? 'Thẻ ID3' : 'Tên tệp'}
                  </span>
                </div>
              </div>
            )}

            {/* Live Audio Preview Bar */}
            {uploadedFile && previewAudioRef.current && (
              <div className="bg-[#222222] border border-[#333333] rounded-xl p-3 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={handleTogglePreview}
                    className="w-9 h-9 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                    title={isPreviewPlaying ? 'Tạm dừng nghe thử' : 'Nghe thử âm thanh'}
                  >
                    {isPreviewPlaying ? (
                      <Pause className="w-4 h-4 fill-black" />
                    ) : (
                      <Play className="w-4 h-4 fill-black translate-x-0.5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-neutral-300 truncate">
                        {isPreviewPlaying ? 'Đang nghe thử...' : 'Nghe thử âm thanh'}
                      </span>
                      <span className="text-neutral-400 text-[10px] shrink-0 font-mono">
                        {formatSeconds(previewCurrentTime)} / {formatSeconds(previewDuration || detectedDuration)}
                      </span>
                    </div>
                    <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1ed760] h-full transition-all duration-200"
                        style={{
                          width: `${previewDuration > 0 ? (previewCurrentTime / previewDuration) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center text-neutral-400 text-xs">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            )}
          </div>

          {/* Song Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-400 uppercase">
                  Tên Bài Hát <span className="text-[#1ed760]">*</span>
                </label>
                {recognitionInfo && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> Tự nhận diện
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Cháu Lên Ba, Con Heo Đất..."
                className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg px-3 py-2 text-white text-xs outline-none transition-colors"
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
                className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg px-3 py-2 text-white text-xs outline-none transition-colors"
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
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
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
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${preset.class} border-2 transition-all shrink-0 flex items-center justify-center cursor-pointer ${
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
                Lời Bài Hát
              </label>
              <span className="text-[10px] text-neutral-500">Tùy chọn</span>
            </div>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Dán lời bài hát vào đây để hiển thị chế độ Lời Bài Hát khi phát nhạc..."
              className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg p-2.5 text-white text-xs outline-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !uploadedFile}
              className="w-full py-3 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Đang xử lý & lưu âm thanh...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Lưu Bài Hát Vào Kho Nhạc</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
