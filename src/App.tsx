import React, { useState, useEffect, useCallback } from 'react';
import { Book, Chapter, PlaybackSpeed, MusicTrack, ViewMode } from './types/book';
import { INITIAL_BOOKS } from './data/initialBooks';
import { useBookAudioPlayer } from './hooks/useBookAudioPlayer';
import { useMusicAudioPlayer } from './hooks/useMusicAudioPlayer';
import { SpotifySidebar } from './components/SpotifySidebar';
import { SpotifyTopBar } from './components/SpotifyTopBar';
import { SpotifyBottomPlayer } from './components/SpotifyBottomPlayer';
import { HomeBrowseView } from './components/HomeBrowseView';
import { BookDetailView } from './components/BookDetailView';
import { MusicLibraryView } from './components/MusicLibraryView';
import { ReaderModeView } from './components/ReaderModeView';
import { AddBookModal } from './components/AddBookModal';
import { AddMusicModal } from './components/AddMusicModal';
import { MusicLyricsModal } from './components/MusicLyricsModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';

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

  // 2. Navigation & Views
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [historyStack, setHistoryStack] = useState<ViewMode[]>(['home']);
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

  // 5. Audio Hooks (Books & Music)
  const bookAudio = useBookAudioPlayer(books);

  const musicAudio = useMusicAudioPlayer(() => {
    // Automatically pause book reading when music starts
    bookAudio.pause();
    setPlaybackMode('music');
  });

  // Navigation handlers
  const navigateTo = useCallback(
    (view: ViewMode, book?: Book | null) => {
      setCurrentView(view);
      if (book !== undefined) {
        setSelectedBook(book);
      }
      setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), view]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
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
      setBooks((prev) => [newBook, ...prev]);
      handleSelectBook(newBook);
      // Auto-start reading
      handlePlayBook(newBook);
    },
    [handlePlayBook, handleSelectBook]
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

  // Delete Book
  const handleDeleteBook = useCallback(
    (bookId: string) => {
      if (bookAudio.currentBook?.id === bookId) {
        bookAudio.pause();
      }
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      if (selectedBook?.id === bookId) {
        setSelectedBook(null);
        navigateTo('home');
      }
    },
    [bookAudio, navigateTo, selectedBook?.id]
  );

  // Delete Chapter
  const handleDeleteChapter = useCallback(
    (bookId: string, chapterId: string) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === bookId) {
            const updatedChapters = b.chapters.filter((c) => c.id !== chapterId);
            const updated = { ...b, chapters: updatedChapters };
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

  // Toggle Favorite Book
  const handleToggleFavorite = useCallback((bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b))
    );
    setSelectedBook((prev) =>
      prev && prev.id === bookId ? { ...prev, isFavorite: !prev.isFavorite } : prev
    );
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Upper Area: Sidebar + Main Content Stage */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left Spotify Sidebar */}
        <SpotifySidebar
          books={books}
          activeBookId={bookAudio.currentBook?.id || null}
          isPlaying={bookAudio.isPlaying}
          currentView={currentView}
          onNavigateHome={() => {
            setSearchQuery('');
            navigateTo('home');
          }}
          onNavigateSearch={() => {
            navigateTo('search');
          }}
          onNavigateMusic={() => {
            navigateTo('music-library');
          }}
          onSelectBook={handleSelectBook}
          onOpenAddModal={() => {
            setTargetBookForChapter(null);
            setIsAddModalOpen(true);
          }}
          onOpenAddMusicModal={() => {
            setIsAddMusicModalOpen(true);
          }}
        />

        {/* Right Main Stage */}
        <main className="flex-1 bg-[#121212] rounded-lg overflow-hidden flex flex-col relative shadow-xl">
          {/* Persistent Top Navigation Bar */}
          <SpotifyTopBar
            currentView={currentView}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (q && currentView !== 'search') {
                setCurrentView('search');
              }
            }}
            onNavigateBack={handleNavigateBack}
            onNavigateForward={handleNavigateForward}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            voiceSettings={bookAudio.voiceSettings}
          />

          {/* Main Views Container */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {(currentView === 'home' || currentView === 'search') && (
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
              />
            )}

            {currentView === 'book-detail' && selectedBook && (
              <BookDetailView
                book={selectedBook}
                activeChapterId={bookAudio.currentChapter?.id}
                isPlaying={bookAudio.isPlaying}
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
              />
            )}

            {currentView === 'music-library' && (
              <MusicLibraryView
                tracks={musicAudio.tracks}
                currentTrack={musicAudio.currentTrack}
                isPlaying={musicAudio.isPlayingMusic}
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
                onDeleteTrack={musicAudio.deleteTrack}
                onToggleFavoriteTrack={musicAudio.toggleFavoriteTrack}
                onOpenLyrics={(track) => setSelectedTrackForLyrics(track)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Sticky Bottom Player Bar (The Dual Spotify Player for Book & Music) */}
      <SpotifyBottomPlayer
        playbackMode={playbackMode}
        // Book Props
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

        // Music Props
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

        // Shared Controls
        playbackRate={bookAudio.playbackRate}
        volume={bookAudio.volume}
        isMuted={bookAudio.isMuted}
        onSetSpeed={(s: PlaybackSpeed) => bookAudio.setSpeed(s)}
        onSetVolume={(v: number) => {
          bookAudio.setVolume(v);
        }}
        onToggleMute={bookAudio.toggleMute}
      />

      {/* Synchronized Reader / Spotify Lyrics View Overlay for Books */}
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

      {/* Music Lyrics Karaoke Modal for Songs */}
      <MusicLyricsModal
        isOpen={!!selectedTrackForLyrics}
        onClose={() => setSelectedTrackForLyrics(null)}
        track={selectedTrackForLyrics}
        isPlaying={musicAudio.isPlayingMusic}
        onTogglePlay={() => {
          setPlaybackMode('music');
          bookAudio.pause();
          musicAudio.togglePlayMusic();
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

      {/* Add Music Track Modal (User can add songs via upload, link, or melody) */}
      <AddMusicModal
        isOpen={isAddMusicModalOpen}
        onClose={() => setIsAddMusicModalOpen(false)}
        onAddTrack={(newTrack) => {
          musicAudio.addCustomTrack(newTrack);
          handlePlayTrack(newTrack);
        }}
      />

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        settings={bookAudio.voiceSettings}
        onUpdateSettings={bookAudio.updateVoiceSettings}
        availableVoices={bookAudio.availableVoices}
      />
    </div>
  );
}
