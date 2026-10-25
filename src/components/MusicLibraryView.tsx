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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1e3a5f]/80 via-[#121212] to-[#121212] text-white select-none">
      {/* 1. Spotify Ambient Header Banner */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-[#2563eb]/30 to-transparent">
        {/* Cover Collage / Large Artwork */}
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-900 to-black shadow-2xl flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden group">
          <Music className="w-20 h-20 text-white/90 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Playlist Metadata */}
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            KHO NHẠC GIA ĐÌNH
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow">
            Kho Nhạc Lớn Cùng Con
          </h1>
          <p className="text-xs md:text-sm text-neutral-300 max-w-xl leading-relaxed">
            Tuyển tập những bài hát thiếu nhi rộn ràng, nhạc ru ngủ ngọt ngào, đồng dao dân gian và các bài hát do ba mẹ tự tải lên cho bé.
          </p>

          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2 font-medium">
            <span className="text-white font-bold">Lớn Cùng Con</span>
            <span>•</span>
            <span className="text-white font-semibold">{tracks.length} bài hát</span>
            <span>•</span>
            <span>{Math.round(totalDurationSec / 60)} phút nghe</span>
            {customTracksCount > 0 && (
              <>
                <span>•</span>
                <span className="text-[#1ed760] font-semibold">{customTracksCount} bài tự thêm</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Bar: Big Play, Add Button, Search & Category Filters */}
      <div className="px-6 md:px-8 py-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Actions: Play all, Shuffle, Add Music */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isCurrentPlayingAny) {
                  onTogglePlay();
                } else if (currentTrack) {
                  onPlayTrack(currentTrack);
                } else if (tracks[0]) {
                  onPlayTrack(tracks[0]);
                }
              }}
              className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shadow-[#1ed760]/30"
              title={isCurrentPlayingAny ? 'Tạm dừng' : 'Phát tất cả'}
            >
              {isCurrentPlayingAny ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (onPlayRandomTrack) {
                  onPlayRandomTrack();
                } else if (onToggleShuffle) {
                  onToggleShuffle();
                }
              }}
              className={`p-3 rounded-full hover:bg-[#282828] transition-all relative ${
                isShuffle ? 'text-[#1ed760]' : 'text-neutral-400 hover:text-white'
              }`}
              title={isShuffle ? 'Đang bật phát ngẫu nhiên (bấm để đổi bài ngẫu nhiên)' : 'Bật phát ngẫu nhiên bài hát'}
            >
              <Shuffle className="w-6 h-6" />
              {isShuffle && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1ed760]" />
              )}
            </button>

            <button
              onClick={onOpenAddMusicModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm bài hát mới</span>
            </button>
          </div>

          {/* Quick Search in Music */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài hát, ca sĩ..."
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#333333] text-xs text-white placeholder-neutral-400 px-4 py-2 rounded-full border border-transparent focus:border-neutral-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
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

      {/* 3. Spotify Tracks Table List */}
      <div className="px-4 md:px-8 pb-12">
        {filteredTracks.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-3">
            <Music className="w-12 h-12 mx-auto text-neutral-600" />
            <p className="font-semibold text-base text-white">Chưa tìm thấy bài hát nào</p>
            <p className="text-xs text-neutral-400">
              Hãy bấm nút <strong>"Thêm bài hát mới"</strong> để tải lên tệp âm thanh bạn yêu thích!
            </p>
            <button
              onClick={onOpenAddMusicModal}
              className="mt-2 px-5 py-2 rounded-full bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow"
            >
              Tải nhạc lên ngay
            </button>
          </div>
        ) : (
          <div className="w-full text-xs">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 border-b border-[#282828] text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 md:col-span-5">Tiêu đề</div>
              <div className="hidden md:block md:col-span-3">Thể loại</div>
              <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-6 pr-2">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#222222]/40 mt-1">
              {filteredTracks.map((track, idx) => {
                const isSelected = currentTrack?.id === track.id;
                const isPlayingThis = isSelected && isPlaying;

                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track)}
                    className={`group grid grid-cols-12 items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#282828] text-white'
                        : 'hover:bg-[#1a1a1a] text-neutral-300 hover:text-white'
                    }`}
                  >
                    {/* Index / Playing indicator */}
                    <div className="col-span-1 text-center font-medium">
                      {isPlayingThis ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <span className="w-0.5 bg-[#1ed760] animate-pulse h-full"></span>
                          <span className="w-0.5 bg-[#1ed760] animate-bounce h-2/3"></span>
                          <span className="w-0.5 bg-[#1ed760] animate-pulse h-full"></span>
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden text-neutral-400">{idx + 1}</span>
                          <Play className="w-4 h-4 hidden group-hover:inline-block fill-current text-white mx-auto" />
                        </>
                      )}
                    </div>

                    {/* Cover, Title, Artist */}
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#282828] relative shadow">
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
                            <Music className="w-4 h-4 text-white/80" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 truncate">
                        <p
                          className={`font-semibold text-xs sm:text-sm truncate ${
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

                    {/* Category */}
                    <div className="hidden md:block md:col-span-3 text-neutral-400 capitalize text-xs">
                      {track.category === 'vui_nhon' && 'Vui nhộn'}
                      {track.category === 'ru_ngu' && 'Ru bé ngủ'}
                      {track.category === 'tieng_anh' && 'Tiếng Anh'}
                      {track.category === 'dong_dao' && 'Đồng dao'}
                      {track.category === 'nhac_tre' && 'Nhạc gia đình'}
                      {track.category === 'khong_loi' && 'Không lời'}
                      {!['vui_nhon', 'ru_ngu', 'tieng_anh', 'dong_dao', 'nhac_tre', 'khong_loi'].includes(
                        track.category
                      ) && track.category}
                    </div>

                    {/* Right: Actions, Lyrics badge, Duration */}
                    <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-3 pr-2">
                      {track.lyrics && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLyrics(track);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-[#1ed760] transition-colors"
                          title="Xem lời bài hát"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoriteTrack(track.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-white transition-colors"
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
                            onDeleteTrack(track.id);
                          }}
                          className="p-1 text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa bài hát tự thêm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <span className="text-neutral-400 tabular-nums w-10 text-right">
                        {formatTime(track.durationSec || 60)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
