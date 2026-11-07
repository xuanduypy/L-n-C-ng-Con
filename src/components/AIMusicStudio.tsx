import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  FileText,
  Volume2,
  Check,
  Plus,
  Headphones,
  Sliders,
  Disc3,
} from 'lucide-react';
import {
  generateAIMusicTrack,
  GENRE_LIST,
  GeneratedAIMusic,
} from '../utils/aiMusicEngine';
import { downloadAudioBlob } from '../utils/audioExporter';
import { MusicTrack } from '../types/book';

interface AIMusicStudioProps {
  onSaveTrackToLibrary: (track: MusicTrack) => void;
  savedTracks?: MusicTrack[];
  initialTrack?: MusicTrack | null;
}

const QUICK_PROMPTS = [
  'Giai điệu piano lofi acoustic êm dịu đồng hành khi đọc sách',
  'Bài hát ru bé ngủ say giấc với tiếng chuông êm đềm',
  'Âm hưởng cổ tích thần tiên mở ra thế giới mộng mơ cho bé',
  'Bản nhạc pop vui nhộn tràn đầy năng lượng tích cực',
];

export const AIMusicStudio: React.FC<AIMusicStudioProps> = ({
  onSaveTrackToLibrary,
  savedTracks = [],
  initialTrack = null,
}) => {
  const [prompt, setPrompt] = useState(initialTrack?.title || '');
  const [selectedGenre, setSelectedGenre] = useState<any>(initialTrack?.category || 'ru_ngu');
  const [mood, setMood] = useState('êm dịu, ấm áp');
  const [durationSec, setDurationSec] = useState(initialTrack?.durationSec || 30);
  const [lyrics, setLyrics] = useState(initialTrack?.lyrics || '');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<GeneratedAIMusic | null>(null);

  // Sync initialTrack on Remix
  useEffect(() => {
    if (initialTrack) {
      setPrompt(initialTrack.title);
      setSelectedGenre(initialTrack.category || 'ru_ngu');
      if (initialTrack.lyrics) setLyrics(initialTrack.lyrics);
      if (initialTrack.durationSec) setDurationSec(initialTrack.durationSec);
    }
  }, [initialTrack]);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update time tracker
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || durationSec);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, durationSec]);

  // AI Generate Lyrics
  const handleGenerateLyrics = async () => {
    setIsGeneratingLyrics(true);
    try {
      const res = await fetch('/api/gemini/create-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || 'Bài hát ru ngủ hoặc đọc sách thư giãn',
          genre: selectedGenre,
          mood,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.lyrics) setLyrics(data.lyrics);
        if (data.title && !prompt) setPrompt(data.title);
      }
    } catch (e) {
      console.warn('Lyrics generation error:', e);
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  // Synthesize AI Music Track
  const handleSynthesizeMusic = async () => {
    setIsSynthesizing(true);
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    try {
      const track = await generateAIMusicTrack({
        title: prompt.trim() || 'Giai Điệu AI DiNo',
        genre: selectedGenre,
        mood,
        bpm: selectedGenre === 'vui_nhon' ? 116 : selectedGenre === 'ru_ngu' ? 66 : 76,
        durationSec,
        lyrics,
      });

      setCurrentTrack(track);

      // Create audio element
      const audio = new Audio(track.audioUrl);
      audioRef.current = audio;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } catch (err) {
      console.error('Music synthesis error:', err);
      alert('Không thể tạo nhạc, vui lòng thử lại.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  // Download Audio
  const handleDownload = () => {
    if (!currentTrack) return;
    downloadAudioBlob(currentTrack.audioBlob, `${currentTrack.title.replace(/\s+/g, '_')}_DiNo_Music.wav`);
  };

  // Save to Library
  const handleSaveToLibrary = () => {
    if (!currentTrack) return;

    const newMusicTrack: MusicTrack = {
      id: currentTrack.id,
      title: currentTrack.title,
      artist: 'AI DiNo Studio',
      category: currentTrack.genre,
      coverGradient: currentTrack.coverGradient,
      audioUrl: currentTrack.audioUrl,
      durationSec: currentTrack.durationSec,
      lyrics: currentTrack.lyrics,
      isCustom: true,
      createdAt: Date.now(),
      albumTitle: 'Sáng Tác AI',
    };

    onSaveTrackToLibrary(newMusicTrack);
    alert('Đã lưu bài hát vào Kho Nhạc của bạn thành công!');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 md:p-8 pb-24 md:pb-12 text-white select-none">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#242424]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" />
            <span>Phòng Tạo Nhạc AI</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Sáng tác giai điệu đa nhạc cụ, hòa âm phối khí tự động và cho phép tải về định dạng âm thanh chất lượng cao.
          </p>
        </div>

        {currentTrack && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow active:scale-95 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>Tải Về Bài Hát</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Prompt & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Prompt Input */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Ý Tưởng & Chủ Đề Bài Hát</span>
            </label>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập tên bài hát hoặc ý tưởng, ví dụ: Bản giao hưởng ngắm trăng sao, Ru bé ngủ say..."
              className="w-full bg-[#121212] border border-[#333] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
            />

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(qp)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white transition-colors"
                >
                  + {qp}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Genre Selector */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-emerald-400" />
              <span>Chọn Thể Loại Âm Nhạc</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {GENRE_LIST.map((g) => {
                const isSelected = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-950/30'
                        : 'bg-[#141414] border-[#292929] hover:bg-[#1e1e1e] text-neutral-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{g.icon}</div>
                    <p className="text-xs font-bold leading-tight">{g.name}</p>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Duration & Mood */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Thời lượng:</label>
              <select
                value={durationSec}
                onChange={(e) => setDurationSec(Number(e.target.value))}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value={20}>20 giây</option>
                <option value={30}>30 giây</option>
                <option value={45}>45 giây</option>
                <option value={60}>60 giây</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Tâm trạng:</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="êm dịu, ấm áp">Êm dịu & Ấm áp</option>
                <option value="vui tươi, rộn ràng">Vui tươi & Rộn ràng</option>
                <option value="thư giãn, tĩnh tại">Thư giãn & Tĩnh tại</option>
                <option value="mộng mơ, huyền diệu">Mộng mơ & Huyền diệu</option>
              </select>
            </div>
          </div>

          {/* 4. Lyrics Section */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Lời Bài Hát</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateLyrics}
                disabled={isGeneratingLyrics}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingLyrics ? 'animate-spin' : ''}`} />
                <span>{isGeneratingLyrics ? 'Đang viết lời...' : 'AI Viết Lời'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Nhập lời bài hát hoặc bấm 'AI Viết Lời' để AI tự động sáng tác theo chủ đề..."
              className="w-full bg-[#121212] border border-[#333] focus:border-purple-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Big Synthesize Action Button */}
          <button
            onClick={handleSynthesizeMusic}
            disabled={isSynthesizing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-[#1ed760] hover:from-purple-500 hover:to-[#1fdf64] text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>AI Đang Phối Khí & Tạo Nhạc...</span>
              </>
            ) : (
              <>
                <Music className="w-5 h-5 fill-current" />
                <span>Tạo Bản Nhạc AI Ngay</span>
              </>
            )}
          </button>
        </div>

        {/* Right Col: Audio Studio Player & Download Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {currentTrack ? (
            <div className={`p-5 rounded-3xl bg-gradient-to-b ${currentTrack.coverGradient} border border-white/10 space-y-5 shadow-2xl`}>
              {/* Disc Artwork */}
              <div className="relative aspect-video rounded-2xl bg-black/40 flex items-center justify-center overflow-hidden border border-white/10">
                {/* Equalizer animation */}
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 70, 95, 60, 85, 50, 90, 75, 45, 80].map((h, i) => (
                    <span
                      key={i}
                      className={`w-2 rounded-t bg-gradient-to-t from-[#1ed760] to-purple-400 transition-all ${
                        isPlaying ? 'animate-pulse' : 'h-2'
                      }`}
                      style={{ height: isPlaying ? `${h}%` : '8px' }}
                    />
                  ))}
                </div>

                <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                  {currentTrack.genreLabel}
                </div>

                <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-mono text-neutral-300">
                  {currentTrack.bpm} BPM
                </div>
              </div>

              {/* Title & Info */}
              <div>
                <h3 className="text-lg font-black text-white">{currentTrack.title}</h3>
                <p className="text-xs text-neutral-300">Sáng tác tự động bởi DiNo AI Music Engine</p>
              </div>

              {/* Scrubber & Controls */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={duration || currentTrack.durationSec}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-[#1ed760] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-neutral-300 font-mono">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{formatSeconds(duration || currentTrack.durationSec)}</span>
                </div>
              </div>

              {/* Play & Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={handleTogglePlay}
                  className="w-14 h-14 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center shadow-lg transition-all active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs transition-all shadow active:scale-95"
                  >
                    <Download className="w-4 h-4 stroke-[3]" />
                    <span>Tải về .WAV</span>
                  </button>

                  <button
                    onClick={handleSaveToLibrary}
                    className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-all active:scale-95"
                    title="Lưu vào kho bài hát"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lyrics Box */}
              {currentTrack.lyrics && (
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 text-xs text-neutral-200 leading-relaxed max-h-32 overflow-y-auto no-scrollbar whitespace-pre-line">
                  <p className="font-bold text-[10px] text-purple-300 uppercase tracking-wider">Lời bài hát:</p>
                  <p>{currentTrack.lyrics}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#181818] border border-dashed border-[#2f2f2f] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                <Headphones className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-white">Chưa Có Bản Nhạc Nào</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Hãy chọn thể loại và bấm <strong>"Tạo Bản Nhạc AI Ngay"</strong> để thưởng thức và tải bài hát về máy.
              </p>
            </div>
          )}

          {/* Quick tips */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-2 text-xs text-neutral-400 leading-relaxed">
            <p className="font-bold text-neutral-300 flex items-center gap-1.5">
              <span>💡</span>
              <span>Đặc Quyền Tải Nhạc DiNo AI:</span>
            </p>
            <p>
              Mỗi bản nhạc tạo ra đều là tệp âm thanh WAV 16-bit 44.1kHz không nén, phát mượt mà trên điện thoại và máy tính.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
