import React, { useState, useEffect, useCallback } from 'react';
import {
  Book,
  Chapter,
  PlaybackSpeed,
  MusicTrack,
  ViewMode,
  UserVoiceProfile,
  ADMIN_SUPER_EMAIL,
} from './types/book';
import { INITIAL_BOOKS } from './data/initialBooks';
import { useBookAudioPlayer } from './hooks/useBookAudioPlayer';
import { useMusicAudioPlayer } from './hooks/useMusicAudioPlayer';
import { SpotifySidebar } from './components/SpotifySidebar';
import { SpotifyTopBar } from './components/SpotifyTopBar';
import { SpotifyBottomPlayer } from './components/SpotifyBottomPlayer';
import { HomeBrowseView } from './components/HomeBrowseView';
import { BookDetailView } from './components/BookDetailView';
import { BookLibraryView } from './components/BookLibraryView';
import { MusicLibraryView } from './components/MusicLibraryView';
import { ReaderModeView } from './components/ReaderModeView';
import { AddBookModal } from './components/AddBookModal';
import { AddMusicModal } from './components/AddMusicModal';
import { MusicLyricsModal } from './components/MusicLyricsModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { UserAccountModal } from './components/UserAccountModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AudiobookCreatorStudio } from './components/AudiobookCreatorStudio';
import { AIMusicStudio } from './components/AIMusicStudio';
import { UserVoiceTrainingStudio } from './components/UserVoiceTrainingStudio';
import { useSleepTimer } from './hooks/useSleepTimer';
import { useUserSync } from './hooks/useUserSync';

const STORAGE_BOOKS_KEY = 'audiobookify_books_library';

export default function App() {
  // 1. Books Library State (Persistent in localStorage)
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOOKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load books from localStorage:', e);
    }
    return INITIAL_BOOKS;
  });

  // Save books to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(books));
    } catch (e) {
      console.warn('Failed to save books to localStorage:', e);
    }
  }, [books]);

  // 2. Navigation & Views (Defaults to 'all' - Kho Lưu Trữ per user request)
  const [currentView, setCurrentView] = useState<ViewMode>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [historyStack, setHistoryStack] = useState<ViewMode[]>(['all']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // 3. Playback Mode: 'book' (Sách nói) or 'music' (Kho nhạc)
  const [playbackMode, setPlaybackMode] = useState<'book' | 'music'>('book');

  // 4. Modals & Overlays
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddMusicModalOpen, setIsAddMusicModalOpen] = useState<boolean>(false);
  const [selectedTrackForLyrics, setSelectedTrackForLyrics] = useState<MusicTrack | null>(null);
  const [targetBookForChapter, setTargetBookForChapter] = useState<Book | null>(null);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const [isUserAccountOpen, setIsUserAccountOpen] = useState<boolean>(false);
  const [remixBook, setRemixBook] = useState<Book | null>(null);
  const [remixTrack, setRemixTrack] = useState<MusicTrack | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  const handleRequireLogin = (message?: string) => {
    setLoginNotice(message || 'Vui lòng đăng nhập tài khoản thành viên để tải file và đồng bộ đám mây.');
    setIsUserAccountOpen(true);
  };

  // 5. Audio Hooks (Books & Music)
  const bookAudio = useBookAudioPlayer(books);

  const musicAudio = useMusicAudioPlayer(() => {
    bookAudio.pause();
    setPlaybackMode('music');
  });

  // 6. User Account & Cloud Sync Hook
  const userSync = useUserSync((cloudData) => {
    // Purge any items deleted by Admin
    if (cloudData.deletedBookIds && cloudData.deletedBookIds.length > 0) {
      const deletedSet = new Set(cloudData.deletedBookIds);
      setBooks((prev) => prev.filter((b) => !deletedSet.has(b.id)));
    }
    if (cloudData.deletedTrackIds && cloudData.deletedTrackIds.length > 0) {
      const deletedSet = new Set(cloudData.deletedTrackIds);
      deletedSet.forEach((id) => musicAudio.deleteTrack(id));
    }

    if (cloudData.books && cloudData.books.length > 0) {
      setBooks((prev) => {
        const map = new Map<string, Book>();
        prev.forEach((b) => map.set(b.id, b));
        cloudData.books?.forEach((b) => map.set(b.id, b));
        return Array.from(map.values());
      });
    }
    if (cloudData.customTracks && cloudData.customTracks.length > 0) {
      cloudData.customTracks.forEach((t) => {
        musicAudio.addCustomTrack(t);
      });
    }
    if (cloudData.userProfiles && cloudData.userProfiles.length > 0) {
      bookAudio.updateVoiceSettings({
        userProfiles: cloudData.userProfiles,
      });
    }
  });

  const isAdmin = Boolean(
    userSync.user?.isAdmin ||
    userSync.user?.email.trim().toLowerCase() === ADMIN_SUPER_EMAIL
  );

  const sleepTimer = useSleepTimer({
    onTimerEnd: () => {
      bookAudio.pause();
      musicAudio.pauseMusic();
    },
  });

  // Navigation handlers
  const navigateTo = useCallback(
    (view: ViewMode, book?: Book | null) => {
      // If entering a studio view (tạo nhạc, tạo sách, huấn luyện giọng), pause background playback to prevent audio conflict
      if (
        view === 'audiobook-studio' ||
        view === 'aimusic-studio' ||
        view === 'voice-training'
      ) {
        if (bookAudio.isPlaying) bookAudio.pause();
        if (musicAudio.isPlayingMusic) musicAudio.pauseMusic();
      }
      setCurrentView(view);
      if (book !== undefined) {
        setSelectedBook(book);
      }
      setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), view]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex, bookAudio, musicAudio]
  );

  const handleNavigateBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentView(historyStack[prevIdx]);
    }
  }, [historyIndex, historyStack]);

  const handleNavigateForward = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentView(historyStack[nextIdx]);
    }
  }, [historyIndex, historyStack]);

  // Book Selection
  const handleSelectBook = useCallback(
    (book: Book) => {
      setSelectedBook(book);
      navigateTo('book-detail', book);
    },
    [navigateTo]
  );

  // Start Playing a Book
  const handlePlayBook = useCallback(
    (book: Book, chapter?: Chapter) => {
      musicAudio.pauseMusic();
      setPlaybackMode('book');

      if (book.appliedVoiceType === 'user_voice') {
        bookAudio.updateVoiceSettings({ engine: 'user_voice' });
      }

      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, readCount: (b.readCount || 0) + 1 } : b))
      );

      bookAudio.playBook(book, chapter);
    },
    [bookAudio, musicAudio]
  );

  // Start Playing a Music Track
  const handlePlayTrack = useCallback(
    (track: MusicTrack) => {
      bookAudio.pause();
      setPlaybackMode('music');
      musicAudio.playTrack(track);
    },
    [bookAudio, musicAudio]
  );

  // Start Playing Random Music Track with Shuffle Mode
  const handlePlayRandomTrack = useCallback(() => {
    bookAudio.pause();
    setPlaybackMode('music');
    musicAudio.playRandomTrack();
  }, [bookAudio, musicAudio]);

  // Add Book
  const handleAddBook = useCallback(
    (newBook: Book) => {
      setBooks((prev) => {
        const updated = [newBook, ...prev];
        userSync.syncCloudData(updated, musicAudio.tracks, bookAudio.voiceSettings.userProfiles || []);
        return updated;
      });
      handleSelectBook(newBook);
      handlePlayBook(newBook);
    },
    [bookAudio.voiceSettings.userProfiles, handlePlayBook, handleSelectBook, musicAudio.tracks, userSync]
  );

  // Add Chapter to Existing Book
  const handleAddChapterToBook = useCallback(
    (bookId: string, newChapter: Chapter) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === bookId) {
            const updated = {
              ...b,
              chapters: [...b.chapters, newChapter],
            };
            if (selectedBook?.id === bookId) {
              setSelectedBook(updated);
            }
            return updated;
          }
          return b;
        })
      );
    },
    [selectedBook?.id]
  );

  // Delete Book (Admin only)
  const handleDeleteBook = useCallback(
    (bookId: string) => {
      if (!isAdmin) {
        alert('Chỉ tài khoản admin xuanduy.cn@gmail.com mới có quyền xóa sách.');
        return;
      }
      if (bookAudio.currentBook?.id === bookId) {
        bookAudio.pause();
      }
      const updatedBooks = books.filter((b) => b.id !== bookId);
      setBooks(updatedBooks);
      if (selectedBook?.id === bookId) {
        setSelectedBook(null);
        navigateTo('all');
      }
      userSync.syncCloudData(
        updatedBooks,
        musicAudio.tracks,
        bookAudio.voiceSettings.userProfiles || [],
        { deletedBookIds: [bookId] }
      );
    },
    [isAdmin, bookAudio, books, selectedBook?.id, navigateTo, userSync, musicAudio.tracks]
  );

  // Delete Chapter
  const handleDeleteChapter = useCallback(
    (bookId: string, chapterId: string) => {
      if (!isAdmin) {
        alert('Chỉ tài khoản admin xuanduy.cn@gmail.com mới có quyền xóa chương sách.');
        return;
      }
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === bookId) {
            const filteredChapters = b.chapters.filter((c) => c.id !== chapterId);
            const updated = { ...b, chapters: filteredChapters };
            if (selectedBook?.id === bookId) {
              setSelectedBook(updated);
            }
            return updated;
          }
          return b;
        })
      );
    },
    [isAdmin, selectedBook?.id]
  );

  // Delete Track (Admin only)
  const handleDeleteTrack = useCallback(
    (trackId: string) => {
      if (!isAdmin) {
        alert('Chỉ tài khoản admin xuanduy.cn@gmail.com mới có quyền xóa bài hát.');
        return;
      }
      musicAudio.deleteTrack(trackId);
      const remainingTracks = musicAudio.tracks.filter((t) => t.id !== trackId);
      userSync.syncCloudData(books, remainingTracks, bookAudio.voiceSettings.userProfiles || [], {
        deletedTrackIds: [trackId],
      });
    },
    [isAdmin, musicAudio, books, bookAudio.voiceSettings.userProfiles, userSync]
  );

  // Toggle Favorite
  const handleToggleFavorite = useCallback(
    (bookId: string) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === bookId) {
            const nextFav = !b.isFavorite;
            const updated = {
              ...b,
              isFavorite: nextFav,
              likesCount: nextFav ? (b.likesCount || 0) + 1 : Math.max(0, (b.likesCount || 1) - 1),
            };
            if (selectedBook?.id === bookId) {
              setSelectedBook(updated);
            }
            return updated;
          }
          return b;
        })
      );
    },
    [selectedBook?.id]
  );

  // User Voice Training save
  const handleSaveVoiceProfile = useCallback(
    (profile: UserVoiceProfile) => {
      const existing = bookAudio.voiceSettings.userProfiles || [];
      const updated = [profile, ...existing.filter((p) => p.id !== profile.id)];
      bookAudio.updateVoiceSettings({
        userProfiles: updated,
        activeUserProfileId: profile.id,
        engine: 'user_voice',
      });
      userSync.syncCloudData(books, musicAudio.tracks, updated);
    },
    [bookAudio, books, musicAudio.tracks, userSync]
  );

  // Remix Handlers for Books and Music
  const handleRemixBook = useCallback(
    (book: Book) => {
      setRemixBook(book);
      navigateTo('audiobook-studio');
    },
    [navigateTo]
  );

  const handleRemixTrack = useCallback(
    (track: MusicTrack) => {
      setRemixTrack(track);
      navigateTo('aimusic-studio');
    },
    [navigateTo]
  );

  const isStudioView =
    currentView === 'audiobook-studio' ||
    currentView === 'aimusic-studio' ||
    currentView === 'voice-training';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-[#ffffff] font-sans antialiased selection:bg-[#1ed760] selection:text-black">
      {/* Top PWA Banner */}
      <PWAInstallBanner />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <SpotifySidebar
          books={books}
          activeBookId={bookAudio.currentBook?.id || null}
          isPlaying={bookAudio.isPlaying}
          currentView={currentView}
          onNavigateAll={() => navigateTo('all')}
          onNavigateAudiobook={() => navigateTo('audiobook-studio')}
          onNavigateAIMusic={() => navigateTo('aimusic-studio')}
          onNavigateVoiceTraining={() => navigateTo('voice-training')}
          onNavigateMusic={() => navigateTo('music-library')}
          onNavigateBookLibrary={() => navigateTo('book-library')}
          onSelectBook={handleSelectBook}
          onOpenAddModal={() => {
            setTargetBookForChapter(null);
            setIsAddModalOpen(true);
          }}
          user={userSync.user}
          onOpenUserAccount={() => setIsUserAccountOpen(true)}
        />

        {/* Right Main Stage */}
        <main className="flex-1 bg-[#121212] rounded-none md:rounded-2xl overflow-hidden flex flex-col relative shadow-xl">
          {/* Top Navigation Bar with User Avatar replacing logo */}
          <SpotifyTopBar
            currentView={currentView}
            onViewChange={(v) => navigateTo(v)}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (q && currentView !== 'all') {
                setCurrentView('all');
              }
            }}
            onNavigateBack={handleNavigateBack}
            onNavigateForward={handleNavigateForward}
            onOpenVoiceSettings={() => navigateTo('voice-training')}
            onOpenAddModal={() => {
              setTargetBookForChapter(null);
              setIsAddModalOpen(true);
            }}
            onOpenUserAccount={() => setIsUserAccountOpen(true)}
            user={userSync.user}
            syncStatus={userSync.syncStatus}
            bookTitle={selectedBook?.title}
            voiceSettings={bookAudio.voiceSettings}
          />

          {/* Main Views Container */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {/* 1. AUDIOBOOK CREATOR STUDIO (Tạo Sách Audio) */}
            {currentView === 'audiobook-studio' && (
              <AudiobookCreatorStudio
                initialBook={remixBook}
                userVoiceProfiles={bookAudio.voiceSettings.userProfiles || []}
                onSaveBookToLibrary={(newBook: Book) => {
                  handleAddBook(newBook);
                }}
                onOpenVoiceTraining={() => navigateTo('voice-training')}
                isLoggedIn={Boolean(userSync.user?.isLoggedIn)}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {/* 2. AI MUSIC GENERATOR STUDIO (Tạo Nhạc AI) */}
            {currentView === 'aimusic-studio' && (
              <AIMusicStudio
                initialTrack={remixTrack}
                onSaveTrackToLibrary={(newTrack: MusicTrack) => {
                  musicAudio.addCustomTrack(newTrack);
                  handlePlayTrack(newTrack);
                  userSync.syncCloudData(
                    books,
                    [newTrack, ...musicAudio.tracks],
                    bookAudio.voiceSettings.userProfiles || []
                  );
                }}
                savedTracks={musicAudio.tracks}
                isLoggedIn={Boolean(userSync.user?.isLoggedIn)}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {/* 3. USER VOICE TRAINING STUDIO (Huấn Luyện Giọng) */}
            {currentView === 'voice-training' && (
              <UserVoiceTrainingStudio
                userProfiles={bookAudio.voiceSettings.userProfiles || []}
                activeProfileId={bookAudio.voiceSettings.activeUserProfileId}
                onSaveProfile={handleSaveVoiceProfile}
                onSelectActiveProfile={(id) => {
                  bookAudio.updateVoiceSettings({
                    activeUserProfileId: id,
                    engine: 'user_voice',
                  });
                }}
              />
            )}

            {/* 4. HOME BROWSE VIEW ('all' - Tất cả, Kho sách, Kho nhạc) */}
            {currentView === 'all' && (
              <HomeBrowseView
                books={books}
                activeBookId={bookAudio.currentBook?.id || null}
                isPlaying={bookAudio.isPlaying}
                onSelectBook={handleSelectBook}
                onPlayBook={handlePlayBook}
                onOpenAddModal={() => {
                  setTargetBookForChapter(null);
                  setIsAddModalOpen(true);
                }}
                searchQuery={searchQuery}
                tracks={musicAudio.tracks}
                currentTrack={musicAudio.currentTrack}
                isPlayingMusic={musicAudio.isPlayingMusic}
                onPlayTrack={handlePlayTrack}
                onNavigateMusic={() => navigateTo('music-library')}
                onNavigateBookLibrary={() => navigateTo('book-library')}
                onNavigateAudiobook={() => navigateTo('audiobook-studio')}
                onNavigateAIMusic={() => navigateTo('aimusic-studio')}
                onNavigateVoiceTraining={() => navigateTo('voice-training')}
                onRemixBook={handleRemixBook}
                onRemixTrack={handleRemixTrack}
                onDeleteBook={handleDeleteBook}
                onDeleteTrack={handleDeleteTrack}
                isAdmin={isAdmin}
                isLoggedIn={Boolean(userSync.user?.isLoggedIn)}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {/* 5. BOOK LIBRARY VIEW */}
            {currentView === 'book-library' && (
              <BookLibraryView
                books={books}
                activeBookId={bookAudio.currentBook?.id || null}
                isPlaying={bookAudio.isPlaying}
                onSelectBook={handleSelectBook}
                onPlayBook={handlePlayBook}
                onOpenAddModal={() => {
                  setTargetBookForChapter(null);
                  setIsAddModalOpen(true);
                }}
                onToggleFavorite={handleToggleFavorite}
                onRemixBook={handleRemixBook}
                onDeleteBook={handleDeleteBook}
                isAdmin={isAdmin}
                isLoggedIn={Boolean(userSync.user?.isLoggedIn)}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {/* 6. BOOK DETAIL VIEW */}
            {currentView === 'book-detail' && selectedBook && (
              <BookDetailView
                book={selectedBook}
                activeChapterId={bookAudio.currentChapter?.id}
                isPlaying={bookAudio.isPlaying}
                isAdmin={isAdmin}
                onPlayBook={handlePlayBook}
                onTogglePlay={() => {
                  setPlaybackMode('book');
                  musicAudio.pauseMusic();
                  bookAudio.togglePlay();
                }}
                onToggleFavorite={handleToggleFavorite}
                onOpenReader={(chapter) => {
                  if (chapter && bookAudio.currentChapter?.id !== chapter.id) {
                    handlePlayBook(selectedBook, chapter);
                  }
                  setIsReaderOpen(true);
                }}
                onOpenAddChapter={(b) => {
                  setTargetBookForChapter(b);
                  setIsAddModalOpen(true);
                }}
                onDeleteBook={handleDeleteBook}
                onDeleteChapter={handleDeleteChapter}
                onRemixBook={handleRemixBook}
                isLoggedIn={Boolean(userSync.user?.isLoggedIn)}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {/* 7. MUSIC LIBRARY VIEW */}
            {currentView === 'music-library' && (
              <MusicLibraryView
                tracks={musicAudio.tracks}
                currentTrack={musicAudio.currentTrack}
                isPlaying={musicAudio.isPlayingMusic}
                isAdmin={isAdmin}
                isShuffle={musicAudio.isShuffle}
                onToggleShuffle={musicAudio.toggleShuffle}
                onPlayRandomTrack={handlePlayRandomTrack}
                onPlayTrack={handlePlayTrack}
                onTogglePlay={() => {
                  setPlaybackMode('music');
                  bookAudio.pause();
                  musicAudio.togglePlayMusic();
                }}
                onOpenAddMusicModal={() => setIsAddMusicModalOpen(true)}
                onDeleteTrack={handleDeleteTrack}
                onToggleFavoriteTrack={musicAudio.toggleFavoriteTrack}
                onOpenLyrics={(track) => setSelectedTrackForLyrics(track)}
                onRemixTrack={handleRemixTrack}
                isLoggedIn={Boolean(userSync.user?.isLoggedIn)}
                onRequireLogin={handleRequireLogin}
              />
            )}
          </div>

          {/* Sticky Bottom Player Bar (Dual Spotify Player for Book & Music) - Ẩn hoàn toàn khi vào tạo sách, tạo nhạc, huấn luyện giọng để không vướng màn hình */}
          {!isStudioView && (
            <SpotifyBottomPlayer
              playbackMode={playbackMode}
              currentBook={bookAudio.currentBook}
              currentChapter={bookAudio.currentChapter}
              isPlayingBook={bookAudio.isPlaying}
              onTogglePlayBook={() => {
                setPlaybackMode('book');
                musicAudio.pauseMusic();
                bookAudio.togglePlay();
              }}
              onNextChapter={bookAudio.nextChapter}
              onPrevChapter={bookAudio.prevChapter}
              onRewindBook={bookAudio.rewind}
              onForwardBook={bookAudio.forward}
              onSeekSentence={bookAudio.seekToSentence}
              currentSentenceIndex={bookAudio.currentSentenceIndex}
              totalSentences={bookAudio.sentences.length}
              bookProgressPercent={bookAudio.progressPercent}
              bookCurrentTimeSec={bookAudio.currentTimeSec}
              bookTotalDurationSec={bookAudio.totalDurationSec}
              isReaderOpen={isReaderOpen}
              onToggleReader={() => setIsReaderOpen((prev) => !prev)}
              onToggleFavoriteBook={handleToggleFavorite}
              onOpenBookDetail={(b) => handleSelectBook(b)}
              currentTrack={musicAudio.currentTrack}
              isPlayingMusic={musicAudio.isPlayingMusic}
              onTogglePlayMusic={() => {
                setPlaybackMode('music');
                bookAudio.pause();
                musicAudio.togglePlayMusic();
              }}
              onNextTrack={musicAudio.nextTrack}
              onPrevTrack={musicAudio.prevTrack}
              onSeekTrack={musicAudio.seekTrack}
              musicCurrentTimeSec={musicAudio.currentTimeSec}
              musicDurationSec={musicAudio.durationSec}
              isShuffle={musicAudio.isShuffle}
              loopMode={musicAudio.loopMode}
              onToggleShuffle={musicAudio.toggleShuffle}
              onToggleLoop={musicAudio.toggleLoop}
              onToggleFavoriteTrack={musicAudio.toggleFavoriteTrack}
              onOpenMusicLyrics={(track) => setSelectedTrackForLyrics(track)}
              playbackRate={bookAudio.playbackRate}
              volume={bookAudio.volume}
              isMuted={bookAudio.isMuted}
              onSetSpeed={(s: PlaybackSpeed) => bookAudio.setSpeed(s)}
              onSetVolume={(v: number) => {
                bookAudio.setVolume(v);
              }}
              onToggleMute={bookAudio.toggleMute}
              sleepTimerOption={sleepTimer.timerOption}
              sleepTimerFormatted={sleepTimer.formattedTime}
              onSetSleepTimer={sleepTimer.setTimer}
              isSleepTimerActive={sleepTimer.isActive}
            />
          )}
        </main>
      </div>

      {/* Synchronized Reader Overlay */}
      {isReaderOpen && bookAudio.currentBook && bookAudio.currentChapter && (
        <ReaderModeView
          book={bookAudio.currentBook}
          chapter={bookAudio.currentChapter}
          sentences={bookAudio.sentences}
          currentSentenceIndex={bookAudio.currentSentenceIndex}
          isPlaying={bookAudio.isPlaying}
          onClose={() => setIsReaderOpen(false)}
          onSeekSentence={bookAudio.seekToSentence}
          onTogglePlay={bookAudio.togglePlay}
        />
      )}

      {/* Music Lyrics Modal */}
      <MusicLyricsModal
        isOpen={Boolean(selectedTrackForLyrics)}
        onClose={() => setSelectedTrackForLyrics(null)}
        track={selectedTrackForLyrics}
        isPlaying={musicAudio.isPlayingMusic && musicAudio.currentTrack?.id === selectedTrackForLyrics?.id}
        onTogglePlay={() => {
          if (musicAudio.currentTrack?.id === selectedTrackForLyrics?.id) {
            musicAudio.togglePlayMusic();
          } else if (selectedTrackForLyrics) {
            handlePlayTrack(selectedTrackForLyrics);
          }
        }}
      />

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTargetBookForChapter(null);
        }}
        onAddBook={handleAddBook}
        targetBookForChapter={targetBookForChapter}
        onAddChapterToBook={handleAddChapterToBook}
      />

      {/* Add Music Track Modal */}
      <AddMusicModal
        isOpen={isAddMusicModalOpen}
        onClose={() => setIsAddMusicModalOpen(false)}
        onAddTrack={(newTrack) => {
          musicAudio.addCustomTrack(newTrack);
          handlePlayTrack(newTrack);
          userSync.syncCloudData(books, [newTrack, ...musicAudio.tracks], bookAudio.voiceSettings.userProfiles || []);
        }}
      />

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        settings={bookAudio.voiceSettings}
        onUpdateSettings={(newSettings) => {
          bookAudio.updateVoiceSettings(newSettings);
          if (newSettings.userProfiles) {
            userSync.syncCloudData(books, musicAudio.tracks, newSettings.userProfiles);
          }
        }}
        availableVoices={bookAudio.availableVoices}
      />

      {/* User Account & App Settings Modal (Clicking on user icon opens this) */}
      <UserAccountModal
        isOpen={isUserAccountOpen}
        onClose={() => {
          setIsUserAccountOpen(false);
          setLoginNotice(null);
        }}
        user={userSync.user}
        syncStatus={userSync.syncStatus}
        lastSyncedAt={userSync.lastSyncedAt}
        onManualSync={() => {
          userSync.syncCloudData(books, musicAudio.tracks, bookAudio.voiceSettings.userProfiles || []);
        }}
        onLogin={userSync.loginWithEmail}
        onLoginWithCredentials={userSync.loginWithCredentials}
        onUpdateProfile={userSync.updateProfile}
        onResetPassword={userSync.resetPassword}
        onLogout={userSync.logout}
        onOpenVoiceSettings={() => navigateTo('voice-training')}
        totalBooksCount={books.length}
        totalTracksCount={musicAudio.tracks.length}
        totalCustomCount={
          books.filter((b) => b.id.startsWith('custom-')).length +
          musicAudio.tracks.filter((t) => t.isCustom).length
        }
        sleepTimerOption={sleepTimer.timerOption}
        sleepTimerFormatted={sleepTimer.formattedTime}
        onSetSleepTimer={sleepTimer.setTimer}
        voiceSettings={bookAudio.voiceSettings}
        initialNotice={loginNotice}
      />

      {/* Dedicated Mobile Bottom Navigation (4 ergonomic studio tabs, no redundant settings button) */}
      <MobileBottomNav
        currentView={currentView}
        onNavigateAudiobook={() => navigateTo('audiobook-studio')}
        onNavigateAIMusic={() => navigateTo('aimusic-studio')}
        onNavigateVoiceTraining={() => navigateTo('voice-training')}
        onNavigateLibrary={() => navigateTo('all')}
      />
    </div>
  );
}
