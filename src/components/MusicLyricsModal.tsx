import React from 'react';
import { X, Music, Play, Pause } from 'lucide-react';
import { MusicTrack } from '../types/book';

interface MusicLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: MusicTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MusicLyricsModal: React.FC<MusicLyricsModalProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  onTogglePlay,
}) => {
  if (!isOpen || !track) return null;

  const lines = (track.lyrics || 'Bài hát này chưa có lời văn bản. Hãy hòa mình vào giai điệu tuyệt vời nhé!')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none">
      <div className="bg-[#121212] border border-[#2e2e2e] rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col text-white shadow-2xl overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div
          className={`h-32 bg-gradient-to-b ${track.coverGradient} opacity-60 p-5 flex items-start justify-between shrink-0`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center border border-white/20 shadow">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                LỜI BÀI HÁT • SPOTIFY LYRICS
              </span>
              <h3 className="font-extrabold text-lg sm:text-xl text-white truncate max-w-md">
                {track.title}
              </h3>
              <p className="text-xs text-neutral-300 truncate">{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="p-2.5 rounded-full bg-[#1ed760] text-black hover:scale-105 active:scale-95 transition-all shadow"
              title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrolling Lyrics Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 text-center">
          {lines.map((line, idx) => (
            <p
              key={idx}
              className="font-bold text-base sm:text-2xl text-neutral-300 hover:text-white transition-all leading-relaxed tracking-wide cursor-default hover:scale-102"
            >
              {line}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#181818] border-t border-[#252525] text-center text-xs text-neutral-400">
          Cùng hát vang giai điệu thiếu nhi vui vẻ bên bé yêu thương 🎵
        </div>
      </div>
    </div>
  );
};
