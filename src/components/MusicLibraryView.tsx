import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Music,
  Plus,
  Heart,
  Shuffle,
  Trash2,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { MusicTrack } from '../types/book';
import { formatTime } from '../utils/textParser';

interface MusicLibraryViewProps {
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  onPlayRandomTrack?: () => void;
  onPlayTrack: (track: MusicTrack) => void;
  onTogglePlay: () => void;
  onOpenAddMusicModal: () => void;
  onDeleteTrack: (trackId: string) => void;
  onToggleFavoriteTrack: (trackId: string) => void;
  onOpenLyrics: (track: MusicTrack) => void;
}

export const MusicLibraryView: React.FC<MusicLibraryViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  isShuffle = false,
  onToggleShuffle,
  onPlayRandomTrack,
  onPlayTrack,
  onTogglePlay,
  onOpenAddMusicModal,
  onDeleteTrack,
  onToggleFavoriteTrack,
  onOpenLyrics,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trackToDelete, setTrackToDelete] = useState<MusicTrack | null>(null);

  const categories = [
    { id: 'Tất cả', label: 'Tất cả' },
    { id: 'vui_nhon', label: 'Vui nhộn' },
    { id: 'ru_ngu', label: 'Ru bé ngủ' },
    { id: 'tieng_anh', label: 'Tiếng Anh' },
    { id: 'dong_dao', label: 'Đồng dao' },
    { id: 'custom', label: 'Tự thêm' },
    { id: 'favorites', label: 'Yêu thích' },
  ];

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.lyrics && t.lyrics.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchCategory = true;
      if (selectedCategory === 'custom') {
        matchCategory = !!t.isCustom;
      } else if (selectedCategory === 'favorites') {
        matchCategory = !!t.isFavorite;
      } else if (selectedCategory !== 'Tất cả') {
        matchCategory = t.category === selectedCategory;
      }

      return matchSearch && matchCategory;
    });
  }, [tracks, searchQuery, selectedCategory]);

  const totalDurationSec = useMemo(() => {
    return tracks.reduce((sum, t) => sum + (t.durationSec || 60), 0);
  }, [tracks]);

  const customTracksCount = useMemo(() => {
    return tracks.filter((t) => t.isCustom).length;
  }, [tracks]);

  const isCurrentPlayingAny = isPlaying && !!currentTrack;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1e3a5f]/80 via-[#121212] to-[#121212] text-white select-none pb-36 md:pb-12">
      {/* 1. Spotify Ambient Header Banner */}
      <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6 bg-gradient-to-b from-[#2563eb]/30 to-transparent text-center md:text-left">
        {/* Cover Collage / Large Artwork */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-2xl md:rounded-lg bg-gradient-to-br from-blue-600 via-indigo-900 to-black shadow-2xl flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden group">
          <Music className="w-14 h-14 md:w-20 md:h-20 text-white/90 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Playlist Metadata */}
        <div className="flex-1 flex flex-col justify-end min-w-0 w-full">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-blue-300">
            DANH SÁCH PHÁT • SPOTIFY MUSIC
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-1 md:mt-2 mb-2 md:mb-3 text-white leading-tight">
            Kho Nhạc Cho Bé & Gia Đình
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 line-clamp-2 mb-3 md:mb-4 max-w-2xl leading-relaxed">
            Tuyển tập các ca khúc thiếu nhi vui nhộn, dân ca đồng dao, tiếng Anh bổ ích và những bản nhạc êm dịu ru bé ngủ ngon.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-neutral-300 font-medium">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>Lớn Cùng Con Studio</span>
            </span>
            <span>•</span>
            <span>{tracks.length} bài hát</span>
            <span>•</span>
            <span className="text-[#1ed760] font-semibold">{formatTime(totalDurationSec)}</span>
            {customTracksCount > 0 && (
              <>
                <span>•</span>
                <span className="text-blue-300">({customTracksCount} bài tự thêm)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-4 md:px-8 py-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Big Play All / Pause Button */}
            <button
              onClick={() => {
                if (isCurrentPlayingAny) {
                  onTogglePlay();
                } else if (filteredTracks.length > 0) {
                  onPlayTrack(filteredTracks[0]);
                }
              }}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-xl transition-all active:scale-95 shrink-0"
              title={isCurrentPlayingAny ? 'Tạm dừng kho nhạc' : 'Phát toàn bộ kho nhạc'}
            >
              {isCurrentPlayingAny ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Random Play Button */}
            <button
              onClick={() => {
                if (onPlayRandomTrack) {
                  onPlayRandomTrack();
                } else if (onToggleShuffle) {
                  onToggleShuffle();
                }
              }}
              className={`p-3 rounded-full hover:bg-[#282828] transition-all relative active:scale-90 ${
                isShuffle ? 'text-[#1ed760]' : 'text-neutral-400 hover:text-white'
              }`}
              title={isShuffle ? 'Đang bật ngẫu nhiên' : 'Bật phát ngẫu nhiên'}
            >
              <Shuffle className="w-5 h-5" />
              {isShuffle && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1ed760]" />
              )}
            </button>

            {/* Add Track Button */}
            <button
              onClick={onOpenAddMusicModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm bài hát</span>
            </button>
          </div>

          {/* Quick Search in Music */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài hát, ca sĩ..."
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] text-xs text-white placeholder-neutral-400 px-3.5 py-2 rounded-full border border-neutral-700 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 active:scale-95 ${
                selectedCategory === cat.id
                  ? 'bg-white text-black shadow'
                  : 'bg-[#232323] text-neutral-300 hover:bg-[#2c2c2c] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Spotify Tracks List */}
      <div className="px-3 md:px-8 mt-2">
        {filteredTracks.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-3">
            <Music className="w-12 h-12 mx-auto text-neutral-600" />
            <p className="font-semibold text-base text-white">Chưa tìm thấy bài hát nào</p>
            <p className="text-xs text-neutral-400">
              Hãy bấm nút <strong>"Thêm bài hát"</strong> để tải lên tệp âm thanh bạn yêu thích!
            </p>
            <button
              onClick={onOpenAddMusicModal}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider active:scale-95 shadow"
            >
              Tải nhạc lên ngay
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#222222]/60 bg-[#161616]/70 rounded-2xl border border-[#262626] overflow-hidden">
            {filteredTracks.map((track, idx) => {
              const isSelected = currentTrack?.id === track.id;
              const isPlayingThis = isSelected && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors active:bg-[#2a2a2a] ${
                    isSelected ? 'bg-[#242424] text-white' : 'hover:bg-[#1a1a1a] text-neutral-300'
                  }`}
                >
                  {/* Left: Thumbnail & Meta */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Cover Art */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#282828] relative shadow">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${track.coverGradient} flex items-center justify-center`}
                        >
                          <Music className="w-5 h-5 text-white/80" />
                        </div>
                      )}

                      {/* Playing overlay */}
                      {isPlayingThis && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 bg-[#1ed760] animate-pulse h-full"></span>
                            <span className="w-0.5 bg-[#1ed760] animate-bounce h-2/3"></span>
                            <span className="w-0.5 bg-[#1ed760] animate-pulse h-full"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pr-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isSelected ? 'text-[#1ed760]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                        <span>{track.artist}</span>
                        {track.isCustom && (
                          <span className="text-[9px] font-bold px-1 rounded bg-[#1ed760]/20 text-[#1ed760]">
                            Tự thêm
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {track.lyrics && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLyrics(track);
                        }}
                        className="p-2 rounded-full text-neutral-400 hover:text-[#1ed760] active:scale-90"
                        title="Xem lời bài hát"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavoriteTrack(track.id);
                      }}
                      className="p-2 text-neutral-400 hover:text-white active:scale-90"
                      title={track.isFavorite ? 'Bỏ thích' : 'Yêu thích'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          track.isFavorite
                            ? 'fill-[#1ed760] text-[#1ed760]'
                            : 'hover:text-white'
                        }`}
                      />
                    </button>

                    {track.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrackToDelete(track);
                        }}
                        className="p-2 text-neutral-500 hover:text-rose-400 active:scale-90"
                        title="Xóa bài hát"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <span className="text-[11px] text-neutral-400 font-mono w-10 text-right">
                      {formatTime(track.durationSec || 60)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (In-app, no window.confirm) */}
      {trackToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-white">Xác nhận xóa bài hát</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Bạn có chắc muốn xóa bài hát <strong>"{trackToDelete.title}"</strong> không?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTrackToDelete(null)}
                className="flex-1 py-2.5 rounded-full bg-[#2a2a2a] text-xs font-bold text-neutral-300 hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onDeleteTrack(trackToDelete.id);
                  setTrackToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
              >
                Xóa bài hát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
