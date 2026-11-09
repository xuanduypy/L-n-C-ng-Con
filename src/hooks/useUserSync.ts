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
        if (parsed && parsed.isLoggedIn) {
          const isAdmin = parsed.email?.trim().toLowerCase() === ADMIN_SUPER_EMAIL;
          return {
            ...parsed,
            role: isAdmin ? 'admin' : 'user',
            isAdmin,
            isLoggedIn: true,
          };
        }
      }
    } catch {}
    // Default: Guest mode (Chưa đăng nhập)
    return null;
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

  // Login with Email or Google
  const loginWithEmail = useCallback(async (email: string, name?: string): Promise<boolean> => {
    if (!email || !email.includes('@')) return false;

    setSyncStatus('syncing');
    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdmin = cleanEmail === ADMIN_SUPER_EMAIL;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: name?.trim(), loginType: 'email' }),
      });

      if (!res.ok) throw new Error('Không thể đăng nhập');
      const data = await res.json();

      if (data.user) {
        const loggedUser: UserAccount = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          username: data.user.username,
          zodiacId: data.user.zodiacId,
          zodiacEmoji: data.user.zodiacEmoji,
          hasPassword: data.user.hasPassword,
          role: isSuperAdmin ? 'admin' : 'user',
          isAdmin: isSuperAdmin,
          isLoggedIn: true,
          lastSyncedAt: data.user.lastSyncedAt || Date.now(),
        };
        setUser(loggedUser);
        setLastSyncedAt(loggedUser.lastSyncedAt || Date.now());
        setSyncStatus('synced');

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
      console.warn('Login error, using local fallback:', e);
      const localUser: UserAccount = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: name?.trim() || (isSuperAdmin ? 'Xuân Duy (Admin)' : cleanEmail.split('@')[0]),
        username: cleanEmail.split('@')[0],
        zodiacId: isSuperAdmin ? 'thin' : 'mao',
        zodiacEmoji: isSuperAdmin ? '🐲' : '🐱',
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

  // Login with Username & Password
  const loginWithCredentials = useCallback(
    async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      if (!username) return { success: false, error: 'Vui lòng nhập tên đăng nhập' };

      setSyncStatus('syncing');
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password: password?.trim() || '',
            loginType: 'username',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setSyncStatus('error');
          return { success: false, error: data.error || 'Đăng nhập không thành công' };
        }

        if (data.user) {
          const isSuperAdmin = data.user.email?.toLowerCase() === ADMIN_SUPER_EMAIL;
          const loggedUser: UserAccount = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            username: data.user.username,
            zodiacId: data.user.zodiacId,
            zodiacEmoji: data.user.zodiacEmoji,
            hasPassword: data.user.hasPassword,
            role: isSuperAdmin ? 'admin' : 'user',
            isAdmin: isSuperAdmin,
            isLoggedIn: true,
            lastSyncedAt: data.user.lastSyncedAt || Date.now(),
          };
          setUser(loggedUser);
          setLastSyncedAt(loggedUser.lastSyncedAt || Date.now());
          setSyncStatus('synced');

          if (data.cloudData && onDataMerged) {
            onDataMerged({
              books: data.cloudData.books,
              customTracks: data.cloudData.customTracks,
              userProfiles: data.cloudData.userProfiles,
            });
          }
          return { success: true };
        }
        return { success: false, error: 'Không nhận được dữ liệu người dùng' };
      } catch (err: any) {
        setSyncStatus('error');
        return { success: false, error: err.message || 'Lỗi mạng khi đăng nhập' };
      } finally {
        setTimeout(() => setSyncStatus((prev) => (prev === 'syncing' ? 'idle' : prev)), 3000);
      }
    },
    [onDataMerged]
  );

  // Update Profile (Name, Username, Password, Zodiac)
  const updateProfile = useCallback(
    async (profileData: {
      name?: string;
      username?: string;
      password?: string;
      zodiacId?: string;
      zodiacEmoji?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!user?.email) return { success: false, error: 'Chưa đăng nhập' };

      try {
        const res = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            ...profileData,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'Cập nhật thất bại' };
        }

        if (data.user) {
          setUser((prev) => (prev ? { ...prev, ...data.user } : null));
          return { success: true };
        }
        return { success: false, error: 'Không nhận được dữ liệu' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi cập nhật' };
      }
    },
    [user?.email]
  );

  // Logout - Thoát hẳn và dọn sạch session
  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
    } catch {}
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

  // Password Recovery / Reset (Quên pass phục hồi)
  const resetPassword = useCallback(async (identifier: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier.includes('@') ? identifier.trim() : undefined,
          username: !identifier.includes('@') ? identifier.trim() : undefined,
          newPassword: newPass.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Đặt lại mật khẩu thất bại' };
      }
      if (data.user) {
        setUser(data.user);
      }
      return { success: true, message: data.message };
    } catch (e: any) {
      return { success: false, error: e.message || 'Lỗi mạng khi phục hồi mật khẩu' };
    }
  }, []);

  return {
    user,
    syncStatus,
    lastSyncedAt,
    loginWithEmail,
    loginWithCredentials,
    updateProfile,
    resetPassword,
    logout,
    syncCloudData,
  };
}
