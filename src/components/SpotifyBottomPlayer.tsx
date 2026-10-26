import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Heart,
  Volume2,
  VolumeX,
  FileText,
  Repeat,
  Repeat1,
  Shuffle,
  BookOpen,
  Music,
  ChevronDown,
  Gauge,
} from 'lucide-react';
import { Book, Chapter, PlaybackSpeed, MusicTrack } from '../types/book';
import { formatTime } from '../utils/textParser';

interface SpotifyBottomPlayerProps {
  playbackMode: 'book' | 'music';
  // Book props
  currentBook: Book | null;
  currentChapter: Chapter | null;
  isPlayingBook: boolean;
  onTogglePlayBook: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  onRewindBook: () => void;
  onForwardBook: () => void;
  onSeekSentence: (index: number) => void;
  currentSentenceIndex: number;
  totalSentences: number;
  bookProgressPercent: number;
  bookCurrentTimeSec: number;
  bookTotalDurationSec: number;
  isReaderOpen: boolean;
  onToggleReader: () => void;
  onToggleFavoriteBook?: (bookId: string) => void;
  onOpenBookDetail?: (book: Book) => void;

  // Music props
  currentTrack: MusicTrack | null;
  isPlayingMusic: boolean;
  onTogglePlayMusic: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeekTrack: (sec: number) => void;
  musicCurrentTimeSec: number;
  musicDurationSec: number;
  isShuffle: boolean;
  loopMode: 'off' | 'track' | 'all';
  onToggleShuffle: () => void;
  onToggleLoop: () => void;
  onToggleFavoriteTrack?: (trackId: string) => void;
  onOpenMusicLyrics?: (track: MusicTrack) => void;

  // Shared audio controls
  playbackRate: PlaybackSpeed;
  volume: number;
  isMuted: boolean;
  onSetSpeed: (speed: PlaybackSpeed) => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export const SpotifyBottomPlayer: React.FC<SpotifyBottomPlayerProps> = ({
  playbackMode,
  // Book
  currentBook,
  currentChapter,
  isPlayingBook,
  onTogglePlayBook,
  onNextChapter,
  onPrevChapter,
  onRewindBook,
  onForwardBook,
  onSeekSentence,
  currentSentenceIndex,
  totalSentences,
  bookProgressPercent,
  bookCurrentTimeSec,
  bookTotalDurationSec,
  isReaderOpen,
  onToggleReader,
  onToggleFavoriteBook,
  onOpenBookDetail,

  // Music
  currentTrack,
  isPlayingMusic,
  onTogglePlayMusic,
  onNextTrack,
  onPrevTrack,
  onSeekTrack,
  musicCurrentTimeSec,
  musicDurationSec,
  isShuffle,
  loopMode,
  onToggleShuffle,
  onToggleLoop,
  onToggleFavoriteTrack,
  onOpenMusicLyrics,

  // Shared
  playbackRate,
  volume,
  isMuted,
  onSetSpeed,
  onSetVolume,
  onToggleMute,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const isMusic = playbackMode === 'music';
  const isPlaying = isMusic ? isPlayingMusic : isPlayingBook;

  const hasContent = isMusic ? !!currentTrack : !!(currentBook && currentChapter);

  // If nothing selected at all
  if (!hasContent) {
    return (
      <footer className="hidden md:flex h-20 bg-[#121212] border-t border-[#282828] px-4 items-center justify-between text-neutral-500 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#282828] flex items-center justify-center">
            <Music className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-400">Chưa chọn nội dung để phát</p>
            <p className="text-[11px] text-neutral-600">Chọn một cuốn sách hoặc bài hát để bắt đầu nghe</p>
          </div>
        </div>
      </footer>
    );
  }

  // Handle Book slider scrub
  const handleBookSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (totalSentences > 1) {
      const targetIdx = Math.round((val / 100) * (totalSentences - 1));
      onSeekSentence(targetIdx);
    }
  };

  // Handle Music slider scrub
  const handleMusicSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeekTrack(val);
  };

  // Music scrubber percentages
  const musicPercent =
    musicDurationSec > 0
      ? Math.min(100, Math.round((musicCurrentTimeSec / musicDurationSec) * 100))
      : 0;

  const activePercent = isMusic ? musicPercent : bookProgressPercent;

  // Active item metadata
  const title = isMusic ? currentTrack?.title : currentBook?.title;
  const subtitle = isMusic ? currentTrack?.artist : currentChapter?.title;
  const coverUrl = isMusic ? currentTrack?.coverUrl : currentBook?.coverUrl;
  const coverGradient = isMusic
    ? currentTrack?.coverGradient || 'from-blue-600 to-indigo-900'
    : currentBook?.coverGradient || 'from-emerald-700 to-black';

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MOBILE MINI-PLAYER (Floating above bottom navigation)        */}
      {/* ============================================================== */}
      <div
        className="md:hidden fixed left-2 right-2 bottom-[60px] z-30 bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden select-none"
      >
        {/* Slim Top Progress Indicator */}
        <div className="w-full h-1 bg-white/10 relative">
          <div
            className="h-full bg-[#1ed760] transition-all duration-300"
            style={{ width: `${activePercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 gap-3">
          {/* Tapping artwork/info expands full screen now playing */}
          <div
            onClick={() => setIsMobileExpanded(true)}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer active:opacity-75 transition-opacity"
          >
            {/* Artwork */}
            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#282828] shadow-md relative">
              {coverUrl ? (
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${coverGradient} flex items-center justify-center`}>
                  {isMusic ? <Music className="w-5 h-5 text-white" /> : <BookOpen className="w-5 h-5 text-white" />}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{title}</h4>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{subtitle}</p>
            </div>
          </div>

          {/* Quick Action Buttons on Mini Player */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Favorite button */}
            {isMusic && onToggleFavoriteTrack && currentTrack && (
              <button
                onClick={() => onToggleFavoriteTrack(currentTrack.id)}
                className="p-2 text-neutral-400 hover:text-white active:scale-90"
              >
                <Heart
                  className={`w-4 h-4 ${
                    currentTrack.isFavorite ? 'fill-[#1ed760] text-[#1ed760]' : ''
                  }`}
                />
              </button>
            )}

            {!isMusic && onToggleFavoriteBook && currentBook && (
              <button
                onClick={() => onToggleFavoriteBook(currentBook.id)}
                className="p-2 text-neutral-400 hover:text-white active:scale-90"
              >
                <Heart
                  className={`w-4 h-4 ${
                    currentBook.isFavorite ? 'fill-[#1ed760] text-[#1ed760]' : ''
                  }`}
                />
              </button>
            )}

            {/* Big Play/Pause Button */}
            <button
              onClick={isMusic ? onTogglePlayMusic : onTogglePlayBook}
              className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Next Button */}
            <button
              onClick={isMusic ? onNextTrack : onNextChapter}
              className="p-2 text-neutral-300 hover:text-white active:scale-90"
              title={isMusic ? 'Bài tiếp theo' : 'Chương tiếp theo'}
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FULL-SCREEN MOBILE NOW PLAYING SHEET                        */}
      {/* ============================================================== */}
      {isMobileExpanded && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#121212] flex flex-col text-white select-none animate-in slide-in-from-bottom duration-250">
          {/* Ambient Background Glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${coverGradient} opacity-30 pointer-events-none`}
          />

          {/* Top Bar with Down Chevron */}
          <div className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
            <button
              onClick={() => setIsMobileExpanded(false)}
              className="p-2 -ml-2 rounded-full text-neutral-300 hover:text-white active:scale-90"
              title="Thu nhỏ trình phát"
            >
              <ChevronDown className="w-7 h-7" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                {isMusic ? 'ĐANG PHÁT TỪ KHO NHẠC' : 'ĐANG PHÁT TỪ SÁCH NÓI'}
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                {isMusic ? 'Kho Nhạc Cho Bé & Gia Đình' : currentBook?.title}
              </span>
            </div>

            <div className="w-7" />
          </div>

          {/* Main Content Area */}
          <div className="relative z-10 flex-1 px-6 flex flex-col justify-around py-4 min-h-0">
            {/* Giant Cover Artwork */}
            <div className="w-full max-w-[280px] xs:max-w-[320px] aspect-square mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#1a1a1a] relative">
              {coverUrl ? (
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${coverGradient} flex items-center justify-center`}>
                  {isMusic ? <Music className="w-24 h-24 text-white/90" /> : <BookOpen className="w-24 h-24 text-white/90" />}
                </div>
              )}
            </div>

            {/* Title & Artist/Chapter with Favorite Button */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-white truncate leading-tight">{title}</h2>
                <p className="text-sm text-neutral-400 truncate mt-1">{subtitle}</p>
              </div>

              {isMusic && onToggleFavoriteTrack && currentTrack && (
                <button
                  onClick={() => onToggleFavoriteTrack(currentTrack.id)}
                  className="p-2.5 rounded-full text-neutral-400 active:scale-90"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      currentTrack.isFavorite ? 'fill-[#1ed760] text-[#1ed760]' : ''
                    }`}
                  />
                </button>
              )}

              {!isMusic && onToggleFavoriteBook && currentBook && (
                <button
                  onClick={() => onToggleFavoriteBook(currentBook.id)}
                  className="p-2.5 rounded-full text-neutral-400 active:scale-90"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      currentBook.isFavorite ? 'fill-[#1ed760] text-[#1ed760]' : ''
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Large Scrubber Slider */}
            <div className="space-y-1.5 my-2">
              <div className="relative flex items-center py-2">
                {isMusic ? (
                  <input
                    type="range"
                    min="0"
                    max={musicDurationSec || 60}
                    value={musicCurrentTimeSec}
                    onChange={handleMusicSliderChange}
                    className="w-full h-2 bg-[#444444] rounded-full appearance-none outline-none cursor-pointer accent-[#1ed760]"
                    style={{
                      background: `linear-gradient(to right, #1ed760 ${musicPercent}%, #444444 ${musicPercent}%)`,
                    }}
                  />
                ) : (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bookProgressPercent}
                    onChange={handleBookSliderChange}
                    className="w-full h-2 bg-[#444444] rounded-full appearance-none outline-none cursor-pointer accent-[#1ed760]"
                    style={{
                      background: `linear-gradient(to right, #1ed760 ${bookProgressPercent}%, #444444 ${bookProgressPercent}%)`,
                    }}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>{formatTime(isMusic ? musicCurrentTimeSec : bookCurrentTimeSec)}</span>
                <span>{formatTime(isMusic ? musicDurationSec : bookTotalDurationSec)}</span>
              </div>
            </div>

            {/* Ergonomic Playback Controls Row */}
            <div className="flex items-center justify-between px-2 my-2">
              {/* Shuffle button (music) or Speed pill (book) */}
              {isMusic ? (
                <button
                  onClick={onToggleShuffle}
                  className={`p-3 rounded-full transition-colors active:scale-90 ${
                    isShuffle ? 'text-[#1ed760]' : 'text-neutral-400'
                  }`}
                  title={isShuffle ? 'Tắt ngẫu nhiên' : 'Bật ngẫu nhiên'}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSpeedMenu((prev) => !prev)}
                  className="px-2.5 py-1 rounded-full bg-[#2a2a2a] text-xs font-bold text-white border border-white/10 active:scale-90"
                >
                  {playbackRate}x
                </button>
              )}

              {/* Prev Chapter / Track */}
              <button
                onClick={isMusic ? onPrevTrack : onPrevChapter}
                className="p-3 text-neutral-300 active:scale-90"
                title={isMusic ? 'Bài trước' : 'Chương trước'}
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              {/* Rewind 10-15s */}
              <button
                onClick={() => {
                  if (isMusic) onSeekTrack(Math.max(0, musicCurrentTimeSec - 10));
                  else onRewindBook();
                }}
                className="p-3 text-neutral-400 active:scale-90 relative"
                title={isMusic ? 'Lùi 10s' : 'Lùi 2 câu'}
              >
                <RotateCcw className="w-6 h-6" />
                <span className="text-[9px] font-bold absolute -bottom-1 left-1/2 -translate-x-1/2">
                  {isMusic ? '10' : '15'}
                </span>
              </button>

              {/* Huge Play/Pause Center Button (64x64) */}
              <button
                onClick={isMusic ? onTogglePlayMusic : onTogglePlayBook}
                className="w-16 h-16 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-xl shadow-[#1ed760]/30 active:scale-90 transition-transform"
                title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current translate-x-1" />
                )}
              </button>

              {/* Forward 10-15s */}
              <button
                onClick={() => {
                  if (isMusic) onSeekTrack(Math.min(musicDurationSec, musicCurrentTimeSec + 10));
                  else onForwardBook();
                }}
                className="p-3 text-neutral-400 active:scale-90 relative"
                title={isMusic ? 'Tới 10s' : 'Tới 2 câu'}
              >
                <RotateCw className="w-6 h-6" />
                <span className="text-[9px] font-bold absolute -bottom-1 left-1/2 -translate-x-1/2">
                  {isMusic ? '10' : '15'}
                </span>
              </button>

              {/* Next Chapter / Track */}
              <button
                onClick={isMusic ? onNextTrack : onNextChapter}
                className="p-3 text-neutral-300 active:scale-90"
                title={isMusic ? 'Bài tiếp' : 'Chương tiếp'}
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              {/* Loop / Repeat button (music) */}
              {isMusic ? (
                <button
                  onClick={onToggleLoop}
                  className={`p-3 rounded-full transition-colors active:scale-90 ${
                    loopMode !== 'off' ? 'text-[#1ed760]' : 'text-neutral-400'
                  }`}
                  title="Lặp lại"
                >
                  {loopMode === 'track' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              ) : (
                <div className="w-8" />
              )}
            </div>

            {/* Bottom Actions Row: Reader/Lyrics, Speed Menu, Volume */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {/* Lyrics / Reader text button */}
              {isMusic ? (
                currentTrack?.lyrics ? (
                  <button
                    onClick={() => {
                      setIsMobileExpanded(false);
                      onOpenMusicLyrics?.(currentTrack);
                    }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#222222] text-xs font-bold text-white border border-white/10 active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-[#1ed760]" />
                    <span>Xem lời bài hát</span>
                  </button>
                ) : (
                  <div />
                )
              ) : (
                <button
                  onClick={() => {
                    setIsMobileExpanded(false);
                    onToggleReader();
                  }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#222222] text-xs font-bold text-white border border-white/10 active:scale-95"
                >
                  <FileText className="w-4 h-4 text-[#1ed760]" />
                  <span>Chế độ đọc chữ theo giọng</span>
                </button>
              )}

              {/* Volume mute toggle */}
              <button
                onClick={onToggleMute}
                className="p-2.5 rounded-full bg-[#222222] text-neutral-300 border border-white/10 active:scale-90"
                title={isMuted ? 'Bật âm lượng' : 'Tắt âm lượng'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DESKTOP FULL SPOTIFY BOTTOM PLAYER (Hidden on Mobile)       */}
      {/* ============================================================== */}
      <footer className="hidden md:flex h-22 md:h-20 bg-[#181818] border-t border-[#282828] px-3 md:px-5 items-center justify-between z-40 select-none text-white relative">
        {/* LEFT: Artwork & Meta */}
        <div className="flex items-center gap-3 min-w-0 w-1/4 max-w-[30%]">
          {isMusic && currentTrack ? (
            <>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded overflow-hidden shrink-0 bg-[#282828] shadow relative group">
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${currentTrack.coverGradient} flex items-center justify-center`}
                  >
                    <Music className="w-6 h-6 text-white/90" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h4 className="text-xs md:text-sm font-semibold truncate text-white" title={currentTrack.title}>
                  {currentTrack.title}
                </h4>
                <p className="text-[11px] md:text-xs text-neutral-400 truncate mt-0.5" title={currentTrack.artist}>
                  {currentTrack.artist}
                </p>
              </div>

              {onToggleFavoriteTrack && (
                <button
                  onClick={() => onToggleFavoriteTrack(currentTrack.id)}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
                  title={currentTrack.isFavorite ? 'Bỏ thích' : 'Yêu thích'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      currentTrack.isFavorite ? 'fill-[#1ed760] text-[#1ed760]' : 'hover:text-white'
                    }`}
                  />
                </button>
              )}
            </>
          ) : currentBook && currentChapter ? (
            <>
              <div
                onClick={() => onOpenBookDetail?.(currentBook)}
                className="w-12 h-12 md:w-14 md:h-14 rounded overflow-hidden shrink-0 bg-[#282828] cursor-pointer shadow group relative"
              >
                {currentBook.coverUrl ? (
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${currentBook.coverGradient} flex items-center justify-center`}
                  >
                    <BookOpen className="w-6 h-6 text-white/80" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h4
                  onClick={() => onOpenBookDetail?.(currentBook)}
                  className="text-xs md:text-sm font-semibold truncate hover:underline cursor-pointer text-white"
                  title={currentBook.title}
                >
                  {currentBook.title}
                </h4>
                <p className="text-[11px] md:text-xs text-neutral-400 truncate mt-0.5" title={currentChapter.title}>
                  {currentChapter.title}
                </p>
              </div>

              {onToggleFavoriteBook && (
                <button
                  onClick={() => onToggleFavoriteBook(currentBook.id)}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
                  title={currentBook.isFavorite ? 'Bỏ thích' : 'Yêu thích'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      currentBook.isFavorite ? 'fill-[#1ed760] text-[#1ed760]' : 'hover:text-white'
                    }`}
                  />
                </button>
              )}
            </>
          ) : null}
        </div>

        {/* CENTER: Player Controls & Scrubber */}
        <div className="flex flex-col items-center justify-center max-w-xl w-2/4 px-2">
          <div className="flex items-center gap-3 md:gap-4 mb-1.5">
            {/* Shuffle / Random Button */}
            {isMusic ? (
              <button
                onClick={onToggleShuffle}
                className={`p-1.5 transition-colors relative flex items-center justify-center ${
                  isShuffle ? 'text-[#1ed760]' : 'text-neutral-400 hover:text-white'
                }`}
                title={isShuffle ? 'Tắt phát ngẫu nhiên' : 'Bật phát ngẫu nhiên'}
              >
                <Shuffle className="w-4 h-4" />
                {isShuffle && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1ed760]" />
                )}
              </button>
            ) : (
              <div className="w-4 hidden md:block" />
            )}

            {/* Previous Button */}
            <button
              onClick={isMusic ? onPrevTrack : onPrevChapter}
              className="text-neutral-400 hover:text-white transition-colors p-1"
              title={isMusic ? 'Bài trước' : 'Chương trước'}
            >
              <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </button>

            {/* Rewind 10-15s Button */}
            <button
              onClick={() => {
                if (isMusic) {
                  onSeekTrack(Math.max(0, musicCurrentTimeSec - 10));
                } else {
                  onRewindBook();
                }
              }}
              className="text-neutral-400 hover:text-white transition-colors p-1 relative group"
              title={isMusic ? 'Lùi 10 giây' : 'Lùi 2 câu'}
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[8px] font-bold absolute -bottom-2.5 left-1/2 -translate-x-1/2 opacity-75">
                {isMusic ? '10' : '15'}
              </span>
            </button>

            {/* Primary Big Green Play/Pause Button */}
            <button
              onClick={isMusic ? onTogglePlayMusic : onTogglePlayBook}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#1ed760]/30"
              title={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Forward 10-15s Button */}
            <button
              onClick={() => {
                if (isMusic) {
                  onSeekTrack(Math.min(musicDurationSec, musicCurrentTimeSec + 10));
                } else {
                  onForwardBook();
                }
              }}
              className="text-neutral-400 hover:text-white transition-colors p-1 relative group"
              title={isMusic ? 'Tới 10 giây' : 'Tới 2 câu'}
            >
              <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[8px] font-bold absolute -bottom-2.5 left-1/2 -translate-x-1/2 opacity-75">
                {isMusic ? '10' : '15'}
              </span>
            </button>

            {/* Next Button */}
            <button
              onClick={isMusic ? onNextTrack : onNextChapter}
              className="text-neutral-400 hover:text-white transition-colors p-1"
              title={isMusic ? 'Bài tiếp theo' : 'Chương tiếp theo'}
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </button>

            {/* Loop / Repeat Button */}
            {isMusic ? (
              <button
                onClick={onToggleLoop}
                className={`p-1 hidden md:block transition-colors ${
                  loopMode !== 'off' ? 'text-[#1ed760]' : 'text-neutral-400 hover:text-white'
                }`}
                title={
                  loopMode === 'track'
                    ? 'Lặp lại 1 bài'
                    : loopMode === 'all'
                    ? 'Lặp lại toàn bộ kho nhạc'
                    : 'Tắt lặp lại'
                }
              >
                {loopMode === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-4 hidden md:block" />
            )}
          </div>

          {/* Progress Bar & Timing */}
          <div className="w-full flex items-center gap-2 md:gap-3 text-[11px] text-neutral-400">
            <span className="w-10 text-right tabular-nums">
              {formatTime(isMusic ? musicCurrentTimeSec : bookCurrentTimeSec)}
            </span>

            <div className="relative flex-1 group flex items-center cursor-pointer py-1">
              {isMusic ? (
                <input
                  type="range"
                  min="0"
                  max={musicDurationSec || 60}
                  value={musicCurrentTimeSec}
                  onChange={handleMusicSliderChange}
                  className="w-full h-1 bg-[#4d4d4d] group-hover:bg-[#5e5e5e] rounded-full appearance-none outline-none transition-all cursor-pointer accent-[#1ed760]"
                  style={{
                    background: `linear-gradient(to right, #1ed760 ${musicPercent}%, #4d4d4d ${musicPercent}%)`,
                  }}
                />
              ) : (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bookProgressPercent}
                  onChange={handleBookSliderChange}
                  className="w-full h-1 bg-[#4d4d4d] group-hover:bg-[#5e5e5e] rounded-full appearance-none outline-none transition-all cursor-pointer accent-[#1ed760]"
                  style={{
                    background: `linear-gradient(to right, #1ed760 ${bookProgressPercent}%, #4d4d4d ${bookProgressPercent}%)`,
                  }}
                />
              )}
            </div>

            <span className="w-10 text-left tabular-nums">
              {formatTime(isMusic ? musicDurationSec : bookTotalDurationSec)}
            </span>
          </div>
        </div>

        {/* RIGHT: Speed, Lyrics / Reader Mode, Volume */}
        <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4 max-w-[25%] relative">
          {isMusic ? (
            currentTrack?.lyrics && (
              <button
                onClick={() => currentTrack && onOpenMusicLyrics?.(currentTrack)}
                className="p-2 rounded-full transition-all flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-[#1ed760] hover:bg-[#222222]"
                title="Xem lời bài hát (Spotify Lyrics)"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden lg:inline">Lời bài hát</span>
              </button>
            )
          ) : (
            <button
              onClick={onToggleReader}
              className={`p-2 rounded-full transition-all flex items-center gap-1.5 text-xs font-medium ${
                isReaderOpen
                  ? 'text-[#1ed760] bg-[#282828]'
                  : 'text-neutral-400 hover:text-white hover:bg-[#222222]'
              }`}
              title="Chế độ đọc chữ theo giọng đọc"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Chữ sách</span>
            </button>
          )}

          {!isMusic && (
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                className="px-2 py-1 rounded bg-[#242424] hover:bg-[#2d2d2d] text-xs font-bold text-white border border-[#3e3e3e]/40 transition-colors"
                title="Tốc độ đọc"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-28 bg-[#282828] border border-[#383838] rounded-md shadow-2xl p-1.5 flex flex-col gap-1 z-50">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-0.5">
                    Tốc độ đọc
                  </span>
                  {SPEED_OPTIONS.map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        onSetSpeed(spd);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between ${
                        playbackRate === spd
                          ? 'bg-[#1ed760] text-black font-bold'
                          : 'text-neutral-300 hover:bg-[#383838]'
                      }`}
                    >
                      <span>{spd}x</span>
                      {playbackRate === spd && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 group">
            <button
              onClick={onToggleMute}
              className="text-neutral-400 hover:text-white transition-colors"
              title={isMuted ? 'Bật âm lượng' : 'Tắt âm lượng'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onSetVolume(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1 bg-[#4d4d4d] group-hover:bg-[#5e5e5e] rounded-full appearance-none outline-none transition-all cursor-pointer accent-[#1ed760]"
              style={{
                background: `linear-gradient(to right, #1ed760 ${
                  (isMuted ? 0 : volume) * 100
                }%, #4d4d4d ${(isMuted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>
        </div>
      </footer>
    </>
  );
};
