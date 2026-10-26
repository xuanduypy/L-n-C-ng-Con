import { useState, useEffect, useCallback, useRef } from 'react';
import { UserAccount, Book, MusicTrack, UserVoiceProfile, ADMIN_SUPER_EMAIL } from '../types/book';

const STORAGE_USER_KEY = 'dino_user_account';

export function useUserSync(
  onDataMerged?: (data: {
    books?: Book[];
    customTracks?: MusicTrack[];
    userProfiles?: UserVoiceProfile[];
    deletedBookIds?: string[];
    deletedTrackIds?: string[];
  }) => void
) {
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const isAdmin = parsed.email?.trim().toLowerCase() === ADMIN_SUPER_EMAIL;
        return {
          ...parsed,
          role: isAdmin ? 'admin' : 'user',
          isAdmin,
        };
      }
    } catch {}
    // Default user account: xuanduy.cn@gmail.com with Super Admin rights
    return {
      id: 'usr-admin-xuanduy',
      email: ADMIN_SUPER_EMAIL,
      name: 'Xuân Duy (Admin)',
      role: 'admin',
      isAdmin: true,
      isLoggedIn: true,
      lastSyncedAt: Date.now(),
    };
  });

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(() => user?.lastSyncedAt || Date.now());
  const isSyncingRef = useRef(false);

  // Save user account changes to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    } catch {}
  }, [user]);

  // Login with Email
  const loginWithEmail = useCallback(async (email: string, name?: string): Promise<boolean> => {
    if (!email || !email.includes('@')) return false;

    setSyncStatus('syncing');
    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdmin = cleanEmail === ADMIN_SUPER_EMAIL;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: name?.trim() }),
      });

      if (!res.ok) throw new Error('Không thể đăng nhập');
      const data = await res.json();

      if (data.user) {
        const loggedUser: UserAccount = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: isSuperAdmin ? 'admin' : 'user',
          isAdmin: isSuperAdmin,
          isLoggedIn: true,
          lastSyncedAt: data.user.lastSyncedAt || Date.now(),
        };
        setUser(loggedUser);
        setLastSyncedAt(loggedUser.lastSyncedAt || Date.now());
        setSyncStatus('synced');

        // Apply cloud books and music if found
        if (data.cloudData && onDataMerged) {
          onDataMerged({
            books: data.cloudData.books,
            customTracks: data.cloudData.customTracks,
            userProfiles: data.cloudData.userProfiles,
            deletedBookIds: data.cloudData.deletedBookIds,
            deletedTrackIds: data.cloudData.deletedTrackIds,
          });
        }
        return true;
      }
    } catch (e) {
      console.warn('Login / Cloud sync error, using local fallback:', e);
      // Fallback local signin
      const localUser: UserAccount = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: name?.trim() || (isSuperAdmin ? 'Xuân Duy (Admin)' : cleanEmail.split('@')[0]),
        role: isSuperAdmin ? 'admin' : 'user',
        isAdmin: isSuperAdmin,
        isLoggedIn: true,
        lastSyncedAt: Date.now(),
      };
      setUser(localUser);
      setSyncStatus('synced');
      return true;
    } finally {
      setTimeout(() => setSyncStatus((prev) => (prev === 'syncing' ? 'idle' : prev)), 3000);
    }
    return false;
  }, [onDataMerged]);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setSyncStatus('idle');
  }, []);

  // Sync Cloud Data (Push and Pull)
  const syncCloudData = useCallback(
    async (
      books: Book[],
      customTracks: MusicTrack[],
      userProfiles: UserVoiceProfile[],
      deletedIds?: { deletedBookIds?: string[]; deletedTrackIds?: string[] }
    ) => {
      if (!user?.email || isSyncingRef.current) return;
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      try {
        const res = await fetch('/api/sync/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            books: books.filter((b) => b.id.startsWith('custom-') || b.isFavorite),
            customTracks: customTracks.filter((t) => t.isCustom || t.isFavorite),
            userProfiles,
            deletedBookIds: user.isAdmin ? deletedIds?.deletedBookIds : undefined,
            deletedTrackIds: user.isAdmin ? deletedIds?.deletedTrackIds : undefined,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          const syncedTimestamp = result.lastSyncedAt || Date.now();
          setLastSyncedAt(syncedTimestamp);
          setSyncStatus('synced');

          if (user) {
            setUser((prev) => (prev ? { ...prev, lastSyncedAt: syncedTimestamp } : null));
          }

          if (onDataMerged && (result.books || result.customTracks || result.userProfiles)) {
            onDataMerged({
              books: result.books,
              customTracks: result.customTracks,
              userProfiles: result.userProfiles,
              deletedBookIds: result.deletedBookIds,
              deletedTrackIds: result.deletedTrackIds,
            });
          }
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.warn('Cloud sync network error:', err);
        setSyncStatus('error');
      } finally {
        isSyncingRef.current = false;
        setTimeout(() => {
          setSyncStatus((prev) => (prev === 'synced' ? 'idle' : prev));
        }, 4000);
      }
    },
    [onDataMerged, user]
  );

  return {
    user,
    syncStatus,
    lastSyncedAt,
    loginWithEmail,
    logout,
    syncCloudData,
  };
}
