import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  FileText,
  Save,
  Check,
  Disc3,
  Clock,
  Mic,
  Sliders,
  Zap,
  Info,
} from 'lucide-react';
import {
  generateAIMusicTrack,
  GENRE_LIST,
  SINGER_VOICE_LIST,
  SUNO_BEAT_LIST,
  GeneratedAIMusic,
} from '../utils/aiMusicEngine';
import { downloadAudioBlob } from '../utils/audioExporter';
import { storeAudioBlob } from '../utils/audioVault';
import { MusicTrack } from '../types/book';

interface AIMusicStudioProps {
  onSaveTrackToLibrary: (track: MusicTrack) => void;
  savedTracks?: MusicTrack[];
  initialTrack?: MusicTrack | null;
  isLoggedIn?: boolean;
  onRequireLogin?: (message?: string) => void;
}

const QUICK_PROMPTS = [
  'Giai điệu piano lofi acoustic êm dịu đồng hành khi đọc sách',
  'Bài hát ru bé ngủ say giấc với tiếng chuông êm đềm',
  'Âm hưởng cổ tích thần tiên mở ra thế giới mộng mơ cho bé',
  'Bản nhạc pop vui nhộn tràn đầy năng lượng tích cực',
];

// Standard song duration options from 2 to 5 minutes
const STANDARD_SONG_DURATIONS = [
  { sec: 120, label: '2 phút (120s)' },
  { sec: 150, label: '2.5 phút (150s)' },
  { sec: 180, label: '3 phút (180s) - [Chuẩn ca khúc]' },
  { sec: 210, label: '3.5 phút (210s)' },
  { sec: 240, label: '4 phút (240s)' },
  { sec: 300, label: '5 phút (300s)' },
];

export const AIMusicStudio: React.FC<AIMusicStudioProps> = ({
  onSaveTrackToLibrary,
  savedTracks = [],
  initialTrack = null,
  isLoggedIn = false,
  onRequireLogin,
}) => {
  const [prompt, setPrompt] = useState(initialTrack?.title || '');
  const [selectedGenre, setSelectedGenre] = useState<any>(initialTrack?.category || 'ru_ngu');
  const [mood, setMood] = useState('êm dịu, ấm áp');
  const [durationSec, setDurationSec] = useState(initialTrack?.durationSec || 180);
  const [singerVoice, setSingerVoice] = useState('nu_truyencam');
  const [sunoBeatStyle, setSunoBeatStyle] = useState('suno_pop');
  const [lyrics, setLyrics] = useState(initialTrack?.lyrics || '');
  const [bpm, setBpm] = useState(78);

  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isSuggestingStyle, setIsSuggestingStyle] = useState(false);
  const [styleSuggestion, setStyleSuggestion] = useState<any | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<GeneratedAIMusic | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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
        if (data.lyrics) {
          setLyrics(data.lyrics);
          // Automatically ask AI for style suggestion based on new lyrics
          handleSuggestStyle(data.lyrics, data.title || prompt);
        }
        if (data.title && !prompt) setPrompt(data.title);
      }
    } catch (e) {
      console.warn('Lyrics generation error:', e);
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  // AI Style & Suno Beat Suggestion from Lyrics
  const handleSuggestStyle = async (customLyrics?: string, customTitle?: string) => {
    const textToAnalyze = customLyrics || lyrics;
    if (!textToAnalyze.trim()) {
      alert('Vui lòng nhập lời bài hát hoặc bấm "AI Viết Lời" trước khi yêu cầu AI gợi ý phong cách.');
      return;
    }

    setIsSuggestingStyle(true);
    try {
      const res = await fetch('/api/gemini/suggest-music-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyrics: textToAnalyze,
          title: customTitle || prompt,
        }),
      });

      if (res.ok) {
        const suggestion = await res.json();
        setStyleSuggestion(suggestion);
      }
    } catch (e) {
      console.warn('Style suggestion error:', e);
    } finally {
      setIsSuggestingStyle(false);
    }
  };

  // Apply AI Suggestion
  const handleApplySuggestion = () => {
    if (!styleSuggestion) return;
    if (styleSuggestion.genre) setSelectedGenre(styleSuggestion.genre);
    if (styleSuggestion.mood) setMood(styleSuggestion.mood);
    if (styleSuggestion.singerVoice) setSingerVoice(styleSuggestion.singerVoice);
    if (styleSuggestion.durationSec) setDurationSec(styleSuggestion.durationSec);
    if (styleSuggestion.bpm) setBpm(styleSuggestion.bpm);

    // Map Suno beat style if matches
    if (styleSuggestion.sunoBeatStyle) {
      const matchedBeat = SUNO_BEAT_LIST.find((b) =>
        styleSuggestion.sunoBeatStyle.toLowerCase().includes(b.id) ||
        b.name.toLowerCase().includes(styleSuggestion.sunoBeatStyle.toLowerCase().slice(0, 10))
      );
      if (matchedBeat) {
        setSunoBeatStyle(matchedBeat.id);
      }
    }

    alert('✨ Đã áp dụng toàn bộ gợi ý phong cách Suno AI vào bảng điều khiển!');
  };

  // Synthesize AI Music Track
  const handleSynthesizeMusic = async () => {
    setIsSynthesizing(true);
    setIsSaved(false);
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    try {
      const track = await generateAIMusicTrack({
        title: prompt.trim() || 'Giai Điệu AI DiNo Suno',
        genre: selectedGenre,
        mood,
        bpm: bpm || (selectedGenre === 'vui_nhon' ? 116 : selectedGenre === 'ru_ngu' ? 66 : 76),
        durationSec,
        lyrics,
        singerVoice,
        sunoBeatStyle,
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
    if (!isLoggedIn) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản thành viên để tải bài hát WAV về máy.');
      return;
    }
    downloadAudioBlob(currentTrack.audioBlob, `${currentTrack.title.replace(/\s+/g, '_')}_DiNo_Music.wav`);
  };

  // Save to Library (Prominent button as requested by user)
  const handleSaveToLibrary = () => {
    if (!currentTrack) return;
    if (!isLoggedIn) {
      onRequireLogin?.('Vui lòng đăng nhập tài khoản thành viên để lưu bài hát vào Kho Nhạc của bạn.');
      return;
    }

    // Persist to IndexedDB vault so it never expires
    storeAudioBlob(currentTrack.id, currentTrack.audioBlob);

    const newMusicTrack: MusicTrack = {
      id: currentTrack.id,
      title: currentTrack.title,
      artist: `AI DiNo (${currentTrack.singerVoiceLabel || 'Suno Style'})`,
      category: currentTrack.genre,
      coverGradient: currentTrack.coverGradient,
      audioUrl: currentTrack.audioUrl,
      durationSec: currentTrack.durationSec,
      lyrics: currentTrack.lyrics,
      isCustom: true,
      hasBlobInVault: true,
      createdAt: Date.now(),
      albumTitle: 'Sáng Tác AI Suno',
    };

    onSaveTrackToLibrary(newMusicTrack);
    setIsSaved(true);
    alert(`🎉 Đã lưu bài hát "${newMusicTrack.title}" vào Kho Nhạc của bạn thành công! Bạn có thể nghe lại bất cứ lúc nào.`);
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Music className="w-6 h-6 text-purple-400" />
                <span>Phòng Tạo Nhạc AI</span>
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Suno AI Style
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Sáng tác ca khúc 2 - 5 phút đa nhạc cụ, gợi ý thể loại và beat theo lời bài hát, tải về WAV và lưu ngay vào kho nhạc.
            </p>
          </div>

          {/* Action Header Buttons: Active when track is ready */}
          {currentTrack && (
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow active:scale-95 cursor-pointer"
                title="Tải tệp âm thanh WAV chất lượng cao về máy"
              >
                <Download className="w-4 h-4 stroke-[3]" />
                <span>Tải Về Bài Hát</span>
              </button>

              <button
                onClick={handleSaveToLibrary}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow active:scale-95 border cursor-pointer ${
                  isSaved
                    ? 'bg-purple-950/80 border-purple-400 text-purple-300'
                    : 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white shadow-purple-900/40'
                }`}
                title="Lưu bài hát vào Kho Nhạc để nghe lại và phát trên kệ sách"
              >
                {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Đã Lưu Vào Kho' : 'Lưu Vào Kho Nhạc'}</span>
              </button>
            </div>
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
                placeholder="Nhập tên bài hát hoặc ý tưởng, ví dụ: Nụ cười tuổi thơ, Ru bé ngủ say, Tiếng mưa bên thềm..."
                className="w-full bg-[#121212] border border-[#333] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
              />

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(qp)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    + {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Lyrics Section with Suno AI Smart Suggestion */}
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Lời Bài Hát & Gợi Ý AI (Suno AI)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateLyrics}
                    disabled={isGeneratingLyrics}
                    className="text-xs px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 font-bold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    title="AI tự động sáng tác lời bài hát theo chủ đề"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingLyrics ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingLyrics ? 'Đang viết lời...' : 'AI Viết Lời'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSuggestStyle()}
                    disabled={isSuggestingStyle || !lyrics.trim()}
                    className={`text-xs px-3 py-1 rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      lyrics.trim()
                        ? 'bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-md'
                        : 'bg-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed'
                    }`}
                    title="Phân tích lời bài hát để AI tự động gợi ý thể loại, giọng ca sĩ, độ dài 2-5 phút và beat Suno"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isSuggestingStyle ? 'animate-spin' : ''}`} />
                    <span>{isSuggestingStyle ? 'Đang phân tích...' : '✨ AI Gợi Ý Phong Cách'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={lyrics}
                onChange={(e) => {
                  setLyrics(e.target.value);
                  if (styleSuggestion) setStyleSuggestion(null);
                }}
                placeholder="Dán hoặc nhập lời bài hát tại đây. Sau đó bấm '✨ AI Gợi Ý Phong Cách' để AI học từ Suno, đề xuất thể loại, giọng ca sĩ và beat chuẩn nhất..."
                className="w-full bg-[#121212] border border-[#333] focus:border-purple-500 rounded-xl p-3 text-xs text-white outline-none resize-none leading-relaxed"
              />

              {/* AI Smart Suggestion Banner (Inspired by Suno AI) */}
              {styleSuggestion && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/70 via-[#1e1528] to-[#121212] border border-purple-500/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gợi Ý Phong Cách Âm Nhạc Phù Hợp Lời Ca</span>
                    </span>
                    <button
                      onClick={handleApplySuggestion}
                      className="px-3 py-1 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-neutral-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 stroke-[3]" />
                      <span>Áp Dụng Gợi Ý Này</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block">Thể loại:</span>
                      <strong className="text-purple-300 text-[11px] truncate block font-bold">
                        {styleSuggestion.genreName || styleSuggestion.genre}
                      </strong>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block">Giọng ca sĩ:</span>
                      <strong className="text-emerald-300 text-[11px] truncate block font-bold">
                        {styleSuggestion.singerVoiceName || 'Nữ ấm áp'}
                      </strong>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block">Độ dài ca khúc:</span>
                      <strong className="text-amber-300 text-[11px] truncate block font-bold">
                        {styleSuggestion.durationLabel || `${Math.round(styleSuggestion.durationSec / 60)} phút`}
                      </strong>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] text-neutral-400 block">Beat Suno &amp; BPM:</span>
                      <strong className="text-sky-300 text-[11px] truncate block font-bold">
                        {styleSuggestion.bpm || 80} BPM
                      </strong>
                    </div>
                  </div>

                  {styleSuggestion.reason && (
                    <p className="text-[11px] text-neutral-300 italic bg-black/30 p-2 rounded-lg border border-white/5">
                      💡 {styleSuggestion.reason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 3. Genre Selector */}
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-emerald-400" />
                <span>Thể Loại Âm Nhạc</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {GENRE_LIST.map((g) => {
                  const isSelected = selectedGenre === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenre(g.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
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

            {/* 4. Singer Voice & Suno Beat Selection */}
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-4">
              {/* Singer Voice Profile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-pink-400" />
                  <span>Giọng Ca Sĩ Thể Hiện (Suno AI)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SINGER_VOICE_LIST.map((v) => {
                    const isSelected = singerVoice === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSingerVoice(v.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-950/40 border-pink-500 text-white shadow'
                            : 'bg-[#141414] border-[#292929] hover:bg-[#1a1a1a] text-neutral-300'
                        }`}
                      >
                        <span className="text-xl shrink-0">{v.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{v.name}</p>
                          <p className="text-[10px] text-neutral-400 line-clamp-1">{v.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suno Beat & Rhythm Pattern */}
              <div className="space-y-2 pt-2 border-t border-[#292929]">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Giai Điệu &amp; Nhịp Beat Phong Cách Suno</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUNO_BEAT_LIST.map((b) => {
                    const isSelected = sunoBeatStyle === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSunoBeatStyle(b.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-950/40 border-sky-500 text-white shadow'
                            : 'bg-[#141414] border-[#292929] hover:bg-[#1a1a1a] text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold">{b.name}</p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/50 text-sky-300 font-mono">
                            {b.tempoRange}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{b.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Standard Duration (2 to 5 minutes) & Mood */}
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thời Lượng Ca Khúc (2 - 5 Phút):</span>
                </label>
                <select
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#333] focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  {STANDARD_SONG_DURATIONS.map((d) => (
                    <option key={d.sec} value={d.sec}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Chuẩn thời lượng thông thường từ 2 đến 5 phút cho ca khúc hoàn chỉnh.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tâm Trạng &amp; Sắc Thái:</span>
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] focus:border-purple-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="êm dịu, ấm áp">Êm dịu &amp; Ấm áp (Ballad)</option>
                  <option value="vui tươi, rộn ràng">Vui tươi &amp; Rộn ràng (Pop)</option>
                  <option value="thư giãn, tĩnh tại">Thư giãn &amp; Tĩnh tại (Lofi)</option>
                  <option value="mộng mơ, huyền diệu">Mộng mơ &amp; Huyền diệu (Cổ tích)</option>
                  <option value="sâu lắng, da diết">Sâu lắng &amp; Da diết (Acoustic)</option>
                </select>
              </div>
            </div>

            {/* Big Synthesize Action Button */}
            <button
              onClick={handleSynthesizeMusic}
              disabled={isSynthesizing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-[#1ed760] hover:from-purple-500 hover:to-[#1fdf64] text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>AI Đang Phối Khí &amp; Tạo Bản Nhạc {formatSeconds(durationSec)}...</span>
                </>
              ) : (
                <>
                  <Music className="w-5 h-5 fill-current" />
                  <span>Tạo Bản Nhạc AI Ngay ({formatSeconds(durationSec)})</span>
                </>
              )}
            </button>
          </div>

          {/* Right Col: Audio Studio Player & Download / Save Card (5 cols) */}
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

                  <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {currentTrack.genreLabel}
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-pink-300">
                    {currentTrack.singerVoiceLabel}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-mono text-neutral-300">
                    {currentTrack.bpm} BPM
                  </div>
                </div>

                {/* Title & Info */}
                <div>
                  <h3 className="text-lg font-black text-white">{currentTrack.title}</h3>
                  <p className="text-xs text-neutral-300">
                    Sáng tác bởi DiNo AI Engine • {currentTrack.sunoBeatStyle || 'Phong cách Suno AI'}
                  </p>
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

                {/* Play & Action Buttons: Both Download & Prominent Save into Library */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={handleTogglePlay}
                      className="w-14 h-14 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
                      title={isPlaying ? 'Tạm dừng' : 'Phát bản nhạc'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                        title="Tải tệp WAV về máy"
                      >
                        <Download className="w-4 h-4 stroke-[3]" />
                        <span>Tải về .WAV</span>
                      </button>

                      <button
                        onClick={handleSaveToLibrary}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 border cursor-pointer ${
                          isSaved
                            ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                            : 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white shadow-purple-900/40'
                        }`}
                        title="Lưu bản nhạc trực tiếp vào Kho Nhạc của bạn"
                      >
                        {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
                        <span>{isSaved ? 'Đã Lưu Vào Kho' : 'Lưu Vào Kho'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Post-generation confirmation card */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎉</span>
                      <span className="text-neutral-200 text-[11px]">
                        Tác phẩm đã hoàn thành ({formatSeconds(currentTrack.durationSec)})
                      </span>
                    </div>
                    {isSaved ? (
                      <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Đã lưu kho nhạc
                      </span>
                    ) : (
                      <button
                        onClick={handleSaveToLibrary}
                        className="text-purple-300 hover:text-white font-bold text-[11px] underline cursor-pointer"
                      >
                        Bấm lưu vào kho ngay
                      </button>
                    )}
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
                  <Music className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-white">Chưa Có Bản Nhạc Nào</h4>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                  Hãy nhập lời ca, bấm <strong>"✨ AI Gợi Ý Phong Cách"</strong> hoặc chọn thể loại rồi bấm <strong>"Tạo Bản Nhạc AI Ngay"</strong> để thưởng thức, tải về và lưu vào kho.
                </p>
              </div>
            )}

            {/* Quick tips */}
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-2 text-xs text-neutral-400 leading-relaxed">
              <p className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Tiêu Chuẩn Âm Thanh AI Suno:</span>
              </p>
              <p>
                Mỗi bản nhạc tạo ra đều là tệp âm thanh WAV 16-bit 44.1kHz chất lượng cao, độ dài chuẩn bài hát từ 2 đến 5 phút, tự động hòa âm phối khí cùng nhịp beat Suno.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
