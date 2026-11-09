/**
 * IndexedDB Persistent Audio Vault for DiNo Studio.
 * Safely stores large uploaded audio files (MP3, WAV, M4A, FLAC, OGG)
 * without exceeding the strict 5MB localStorage quota limit.
 */

const DB_NAME = 'dino_audio_vault';
const DB_VERSION = 1;
const STORE_NAME = 'audio_blobs';

let dbPromise: Promise<IDBDatabase> | null = null;
const memoryUrlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('Failed to open audio vault IndexedDB:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Stores an audio Blob into IndexedDB with an associated track ID.
 */
export async function storeAudioBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id,
        blob,
        size: blob.size,
        type: blob.type,
        updatedAt: Date.now(),
      };
      const req = store.put(record);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
    });

    // Revoke old object URL if exists, create fresh one
    if (memoryUrlCache.has(id)) {
      try {
        URL.revokeObjectURL(memoryUrlCache.get(id)!);
      } catch {}
      memoryUrlCache.delete(id);
    }
  } catch (err) {
    console.warn(`[AudioVault] Failed to store blob for track ${id}:`, err);
  }
}

/**
 * Retrieves the stored audio Blob from IndexedDB by track ID.
 */
export async function getAudioBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.blob instanceof Blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn(`[AudioVault] Failed to get blob for track ${id}:`, err);
    return null;
  }
}

/**
 * Gets or creates a valid Object URL for a stored track.
 */
export async function getAudioObjectUrl(id: string): Promise<string | null> {
  if (memoryUrlCache.has(id)) {
    return memoryUrlCache.get(id)!;
  }

  const blob = await getAudioBlob(id);
  if (!blob) return null;

  try {
    const url = URL.createObjectURL(blob);
    memoryUrlCache.set(id, url);
    return url;
  } catch (err) {
    console.warn(`[AudioVault] Failed to create object URL for track ${id}:`, err);
    return null;
  }
}

/**
 * Deletes audio blob from IndexedDB.
 */
export async function deleteAudioBlob(id: string): Promise<void> {
  try {
    if (memoryUrlCache.has(id)) {
      try {
        URL.revokeObjectURL(memoryUrlCache.get(id)!);
      } catch {}
      memoryUrlCache.delete(id);
    }

    const db = await openDatabase();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn(`[AudioVault] Failed to delete blob for track ${id}:`, err);
  }
}

/**
 * Check if track audio exists in IndexedDB vault.
 */
export async function isAudioInVault(id: string): Promise<boolean> {
  try {
    const db = await openDatabase();
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(id);
      req.onsuccess = () => resolve((req.result || 0) > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
