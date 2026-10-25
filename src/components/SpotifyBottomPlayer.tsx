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

  const isMusic = playbackMode === 'music';
  const isPlaying = isMusic ? isPlayingMusic : isPlayingBook;

  // Idle state when nothing has been picked yet
  if (!isMusic && (!currentBook || !currentChapter)) {
    if (!currentTrack) {
      return (
        <footer className="h-20 bg-[#121212] border-t border-[#282828] px-4 flex items-center justify-between text-neutral-500 text-xs select-none">
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

  return (
    <footer className="h-22 md:h-20 bg-[#181818] border-t border-[#282828] px-3 md:px-5 flex items-center justify-between z-40 select-none text-white relative">
      {/* 1. LEFT: Artwork & Meta */}
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
                className="p-1.5 text-neutral-400 hover:text-white transition-colors shrink-0 hidden sm:block"
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
                className="p-1.5 text-neutral-400 hover:text-white transition-colors shrink-0 hidden sm:block"
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

      {/* 2. CENTER: Player Controls & Scrubber */}
      <div className="flex flex-col items-center justify-center max-w-xl w-2/4 px-2">
        {/* Buttons Row */}
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

          {/* Previous Button (Prev Chapter or Prev Song) */}
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

          {/* Next Button (Next Chapter or Next Song) */}
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

      {/* 3. RIGHT: Speed, Lyrics / Reader Mode, Volume */}
      <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4 max-w-[25%] relative">
        {/* Lyrics or Reader Mode Button */}
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

        {/* Speed Selector (for books) */}
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

        {/* Volume controls */}
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
  );
};
