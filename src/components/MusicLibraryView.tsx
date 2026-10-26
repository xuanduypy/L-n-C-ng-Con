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
  Disc,
  Flame,
  Headphones,
} from 'lucide-react';
import { MusicTrack, MusicAlbum } from '../types/book';
import { INITIAL_ALBUMS } from '../data/initialAlbums';
import { formatTime } from '../utils/textParser';

interface MusicLibraryViewProps {
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isAdmin?: boolean;
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
  isAdmin = false,
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
  const [selectedFilter, setSelectedFilter] = useState<string>('Tất cả');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trackToDelete, setTrackToDelete] = useState<MusicTrack | null>(null);

  // Albums enriched with track counts
  const albums: MusicAlbum[] = useMemo(() => {
    return INITIAL_ALBUMS.map((alb) => {
      const count =
        alb.id === 'album-custom'
          ? tracks.filter((t) => t.isCustom).length
          : tracks.filter((t) => t.albumId === alb.id || t.category === alb.category).length;
      return {
        ...alb,
        trackCount: count,
      };
    });
  }, [tracks]);

  const filterTabs = [
    { id: 'Tất cả', label: 'Tất cả bài hát' },
    { id: 'albums', label: 'Theo Album 💿' },
    { id: 'top_plays', label: 'Nghe Nhiều Nhất 🔥' },
    { id: 'top_likes', label: 'Yêu Thích Nhất ❤️' },
    { id: 'ru_ngu', label: 'Ru ngủ 🌙' },
    { id: 'vui_nhon', label: 'Vui nhộn ☀️' },
    { id: 'tieng_anh', label: 'Tiếng Anh ⭐' },
    { id: 'custom', label: 'Tự thêm 📂' },
  ];

  const filteredTracks = useMemo(() => {
    let list = [...tracks];

    // Album filter takes priority if active
    if (selectedAlbumId) {
      if (selectedAlbumId === 'album-custom') {
        list = list.filter((t) => t.isCustom);
      } else {
        const targetAlbum = albums.find((a) => a.id === selectedAlbumId);
        list = list.filter(
          (t) => t.albumId === selectedAlbumId || (targetAlbum && t.category === targetAlbum.category)
        );
      }
    } else if (selectedFilter === 'top_plays') {
      list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (selectedFilter === 'top_likes') {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (selectedFilter === 'custom') {
      list = list.filter((t) => t.isCustom);
    } else if (selectedFilter !== 'Tất cả' && selectedFilter !== 'albums') {
      list = list.filter((t) => t.category === selectedFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.albumTitle && t.albumTitle.toLowerCase().includes(q)) ||
          (t.lyrics && t.lyrics.toLowerCase().includes(q))
      );
    }

    return list;
  }, [tracks, selectedAlbumId, selectedFilter, searchQuery, albums]);

  const totalDurationSec = useMemo(() => {
    return tracks.reduce((sum, t) => sum + (t.durationSec || 60), 0);
  }, [tracks]);

  const customTracksCount = useMemo(() => {
    return tracks.filter((t) => t.isCustom).length;
  }, [tracks]);

  const isCurrentPlayingAny = isPlaying && !!currentTrack;

  const currentActiveAlbum = useMemo(() => {
    if (!selectedAlbumId) return null;
    return albums.find((a) => a.id === selectedAlbumId) || null;
  }, [selectedAlbumId, albums]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1e3a5f]/80 via-[#121212] to-[#121212] text-white select-none pb-44 md:pb-14">
      {/* 1. Spotify Ambient Header Banner */}
      <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6 bg-gradient-to-b from-[#2563eb]/30 to-transparent text-center md:text-left">
        {/* Cover Collage / Large Artwork */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-2xl md:rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-900 to-black shadow-2xl flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden group">
          {currentActiveAlbum ? (
            <div className={`w-full h-full bg-gradient-to-br ${currentActiveAlbum.coverGradient} flex flex-col items-center justify-center p-4`}>
              <span className="text-4xl md:text-5xl mb-2 drop-shadow">{currentActiveAlbum.icon || '💿'}</span>
              <span className="font-extrabold text-xs text-white/90 text-center line-clamp-1">{currentActiveAlbum.title}</span>
            </div>
          ) : (
            <>
              <Music className="w-14 h-14 md:w-20 md:h-20 text-white/90 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/20" />
            </>
          )}
        </div>

        {/* Playlist Metadata */}
        <div className="flex-1 flex flex-col justify-end min-w-0 w-full">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-blue-300">
              {currentActiveAlbum ? 'ALBUM TUYỂN CHỌN' : 'DANH SÁCH PHÁT • SPOTIFY MUSIC'}
            </span>
            {selectedAlbumId && (
              <button
                onClick={() => setSelectedAlbumId(null)}
                className="text-[10px] text-amber-300 hover:underline font-bold bg-amber-400/10 px-2 py-0.5 rounded-full"
              >
                ✕ Xem tất cả album
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mt-1 md:mt-2 mb-2 md:mb-3 text-white leading-tight">
            {currentActiveAlbum ? currentActiveAlbum.title : 'Kho Nhạc Thiếu Nhi & Gia Đình'}
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 line-clamp-2 mb-3 md:mb-4 max-w-2xl leading-relaxed">
            {currentActiveAlbum
              ? currentActiveAlbum.description
              : 'Tuyển tập các ca khúc thiếu nhi vui nhộn, dân ca đồng dao, tiếng Anh bổ ích và những bản nhạc êm dịu ru bé ngủ ngon.'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-neutral-300 font-medium">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>DiNo Music</span>
            </span>
            <span>•</span>
            <span>{currentActiveAlbum ? `${filteredTracks.length} bài hát` : `${tracks.length} bài hát`}</span>
            <span>•</span>
            <span className="text-[#1ed760] font-semibold">{formatTime(totalDurationSec)}</span>
            {customTracksCount > 0 && !selectedAlbumId && (
              <>
                <span>•</span>
                <span className="text-blue-300">({customTracksCount} bài tự thêm)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-4 md:px-8 py-3 space-y-4">
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
              title={isCurrentPlayingAny ? 'Tạm dừng kho nhạc' : 'Phát danh sách nhạc này'}
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
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài hát, ca sĩ, album..."
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

        {/* Filter Pills (Tất cả, Theo Album, Nghe nhiều nhất, Thả tim nhiều nhất) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedFilter(tab.id);
                if (tab.id !== 'albums') {
                  setSelectedAlbumId(null);
                }
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 active:scale-95 ${
                selectedFilter === tab.id
                  ? 'bg-white text-black shadow font-bold'
                  : 'bg-[#232323] text-neutral-300 hover:bg-[#2c2c2c] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ALBUMS CAROUSEL / GRID (Trong kho nhạc có các Album để dễ lựa chọn phát) */}
      {(!searchQuery || selectedFilter === 'albums') && (
        <section className="px-4 md:px-8 mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base md:text-lg text-white flex items-center gap-2">
              <Disc className="w-5 h-5 text-amber-400" />
              <span>Các Album Tuyển Chọn Cho Bé</span>
            </h3>
            {selectedAlbumId && (
              <button
                onClick={() => setSelectedAlbumId(null)}
                className="text-xs text-[#1ed760] hover:underline font-bold"
              >
                Xem tất cả bài hát
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {albums.map((album) => {
              const isSelectedAlbum = selectedAlbumId === album.id;
              return (
                <div
                  key={album.id}
                  onClick={() => {
                    if (selectedAlbumId === album.id) {
                      setSelectedAlbumId(null);
                    } else {
                      setSelectedAlbumId(album.id);
                      setSelectedFilter('albums');
                    }
                  }}
                  className={`group p-3 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between relative shadow ${
                    isSelectedAlbum
                      ? 'bg-[#2a2a2a] border-[#1ed760] shadow-lg shadow-[#1ed760]/10'
                      : 'bg-[#181818] border-[#262626] hover:bg-[#242424] hover:border-neutral-600'
                  }`}
                >
                  <div
                    className={`w-full aspect-square rounded-xl bg-gradient-to-br ${album.coverGradient} flex flex-col items-center justify-center p-3 relative shadow mb-2.5`}
                  >
                    <span className="text-3xl sm:text-4xl drop-shadow mb-1">{album.icon || '💿'}</span>
                    <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full">
                      {album.trackCount} bài
                    </span>

                    {/* Quick Play Album Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlbumId(album.id);
                        const albumTracks = tracks.filter(
                          (t) =>
                            t.albumId === album.id ||
                            (album.id === 'album-custom' ? t.isCustom : t.category === album.category)
                        );
                        if (albumTracks.length > 0) {
                          onPlayTrack(albumTracks[0]);
                        }
                      }}
                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-xl"
                      title="Phát cả album"
                    >
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className={`font-bold text-xs line-clamp-1 ${isSelectedAlbum ? 'text-[#1ed760]' : 'text-white'}`}>
                      {album.title}
                    </h4>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{album.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Spotify Tracks List with Plays and Likes Stats */}
      <div className="px-3 md:px-8 mt-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm md:text-base text-white">
              {selectedFilter === 'top_plays'
                ? 'Bài Hát Được Nghe Nhiều Nhất 🔥'
                : selectedFilter === 'top_likes'
                ? 'Bài Hát Được Thả Tim Nhiều Nhất ❤️'
                : selectedAlbumId
                ? `Danh sách bài trong Album`
                : 'Danh Sách Bài Hát'}
            </span>
            <span className="text-xs text-neutral-400 font-semibold">({filteredTracks.length} bài)</span>
          </div>

          <div className="text-[11px] text-neutral-400 hidden sm:flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" /> Lượt nghe
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Yêu thích
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Thời lượng
            </span>
          </div>
        </div>

        {filteredTracks.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-3 bg-[#161616]/70 rounded-2xl border border-[#262626]">
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
                  {/* Left: Index/Play, Thumbnail & Meta */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Index / Playing icon */}
                    <span className="w-5 text-center text-xs text-neutral-500 font-mono hidden sm:inline-block">
                      {idx + 1}
                    </span>

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
                        {track.albumTitle && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-500 truncate">{track.albumTitle}</span>
                          </>
                        )}
                        {track.isCustom && (
                          <span className="text-[9px] font-bold px-1 rounded bg-[#1ed760]/20 text-[#1ed760]">
                            Tự thêm
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Middle / Right: Stats (Lượt nghe & Lượt thích) */}
                  <div className="flex items-center gap-3 shrink-0 ml-1">
                    {/* Play count badge */}
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-400 w-16 justify-end">
                      <Headphones className="w-3 h-3 text-neutral-500" />
                      <span>{track.playCount ? track.playCount.toLocaleString() : '1.2k'}</span>
                    </div>

                    {/* Lyrics Button */}
                    {track.lyrics && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLyrics(track);
                        }}
                        className="p-1.5 rounded-full text-neutral-400 hover:text-[#1ed760] active:scale-90"
                        title="Xem lời bài hát"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}

                    {/* Favorite Heart Button with like count */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavoriteTrack(track.id);
                      }}
                      className="flex items-center gap-1 p-1.5 text-neutral-400 hover:text-white active:scale-90"
                      title={track.isFavorite ? 'Bỏ thích' : 'Thả tim bài hát'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          track.isFavorite
                            ? 'fill-rose-500 text-rose-500'
                            : 'hover:text-white'
                        }`}
                      />
                      <span className={`text-[11px] font-semibold ${track.isFavorite ? 'text-rose-400' : 'text-neutral-500'}`}>
                        {track.likesCount || (track.isFavorite ? 350 : 280)}
                      </span>
                    </button>

                    {/* Delete Track (Only Super Admin xuanduy.cn@gmail.com can delete any track) */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrackToDelete(track);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 active:scale-90"
                        title="Quyền Admin: Xóa bài hát này (kể cả nhạc mặc định)"
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

      {/* Delete Confirmation Modal */}
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
