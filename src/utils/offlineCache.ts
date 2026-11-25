import { FileItem, FolderItem } from '../types/storage';

export const OFFLINE_CACHE_NAME = 'rawaj-file-explorer-offline-v1';
export const OFFLINE_METADATA_URL = '/__offline/metadata.json';
const OFFLINE_METADATA_LS_KEY = 'rawaj_offline_metadata_v1';

// Default offline browser cache budget (512 MB) for clear quota tracking
export const DEFAULT_OFFLINE_QUOTA_BYTES = 512 * 1024 * 1024;

export interface OfflineMetadataSnapshot {
  files: FileItem[];
  folders: FolderItem[];
  cachedFileIds: string[];
  lastSyncedAt: string;
}

export interface OfflineCacheStats {
  usedBytes: number;
  quotaBytes: number;
  cachedFilesCount: number;
  percentUsed: number;
  lastSyncedAt: string | null;
  browserEstimateUsedBytes?: number;
  browserEstimateQuotaBytes?: number;
}

function isCacheApiAvailable(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

export function getOfflineFileCacheUrl(fileId: string): string {
  return `/__offline/files/${encodeURIComponent(fileId)}`;
}

/**
 * Persists FileExplorer metadata (files + folders) into both the Service Worker
 * Cache Storage API and localStorage fallback so it survives offline reloads.
 */
export async function syncMetadataToOfflineCache(
  files: FileItem[],
  folders: FolderItem[]
): Promise<OfflineMetadataSnapshot> {
  const cachedFileIds = files.filter(f => f.isOffline && !f.isTrash).map(f => f.id);
  const snapshot: OfflineMetadataSnapshot = {
    files,
    folders,
    cachedFileIds,
    lastSyncedAt: new Date().toISOString(),
  };

  const payload = JSON.stringify(snapshot);

  try {
    localStorage.setItem(OFFLINE_METADATA_LS_KEY, payload);
  } catch {
    // Ignore storage quota errors in restricted frames
  }

  if (isCacheApiAvailable()) {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      const response = new Response(payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Rawaj-Offline-Synced': snapshot.lastSyncedAt,
        },
      });
      await cache.put(OFFLINE_METADATA_URL, response);
    } catch {
      // Cache API may be unavailable in some opaque origins
    }
  }

  return snapshot;
}

/**
 * Loads the most recent cached FileExplorer metadata from Cache Storage or localStorage.
 */
export async function loadMetadataFromOfflineCache(): Promise<OfflineMetadataSnapshot | null> {
  if (isCacheApiAvailable()) {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      const cached = await cache.match(OFFLINE_METADATA_URL);
      if (cached) {
        const data = (await cached.json()) as OfflineMetadataSnapshot;
        if (data && Array.isArray(data.files) && Array.isArray(data.folders)) {
          return data;
        }
      }
    } catch {
      // Fallback to localStorage
    }
  }

  try {
    const raw = localStorage.getItem(OFFLINE_METADATA_LS_KEY);
    if (raw) {
      const data = JSON.parse(raw) as OfflineMetadataSnapshot;
      if (data && Array.isArray(data.files) && Array.isArray(data.folders)) {
        return data;
      }
    }
  } catch {
    // Ignore corrupt cache
  }

  return null;
}

/**
 * Stores a file's preview/asset payload and metadata inside the Service Worker Cache Storage.
 */
export async function cacheFileForOffline(file: FileItem): Promise<boolean> {
  if (!isCacheApiAvailable()) return false;
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const cacheUrl = getOfflineFileCacheUrl(file.id);

    const offlineRecord = {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      extension: file.extension,
      sizeBytes: file.sizeBytes,
      checksum: file.checksum,
      updatedAt: file.updatedAt,
      previewContent:
        file.previewContent ||
        `[Cached Offline Copy]\nFile: ${file.name}\nSHA-256: ${file.checksum}\nSize: ${file.sizeBytes} bytes`,
      thumbnailUrl: file.thumbnailUrl,
      mediaUrl: file.mediaUrl,
      cachedAt: new Date().toISOString(),
    };

    await cache.put(
      cacheUrl,
      new Response(JSON.stringify(offlineRecord), {
        headers: {
          'Content-Type': 'application/json',
          'X-Rawaj-File-Id': file.id,
        },
      })
    );

    // Also warm same-origin media/thumbnail URLs if present
    if (file.thumbnailUrl && file.thumbnailUrl.startsWith('/')) {
      try {
        await cache.add(file.thumbnailUrl);
      } catch {
        // Non-fatal if asset is not fetchable
      }
    }
    if (file.mediaUrl && file.mediaUrl.startsWith('/')) {
      try {
        await cache.add(file.mediaUrl);
      } catch {
        // Non-fatal
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Removes a single file from the Service Worker Cache Storage.
 */
export async function removeFileFromOfflineCache(fileId: string): Promise<boolean> {
  if (!isCacheApiAvailable()) return false;
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    return await cache.delete(getOfflineFileCacheUrl(fileId));
  } catch {
    return false;
  }
}

/**
 * Retrieves a cached file record from the Service Worker Cache Storage.
 */
export async function getOfflineCachedFile(
  fileId: string
): Promise<{ previewContent?: string; cachedAt?: string } | null> {
  if (!isCacheApiAvailable()) return null;
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const res = await cache.match(getOfflineFileCacheUrl(fileId));
    if (!res) return null;
    return (await res.json()) as { previewContent?: string; cachedAt?: string };
  } catch {
    return null;
  }
}

/**
 * Clears all cached offline files while preserving metadata snapshot.
 */
export async function clearAllOfflineFileCache(): Promise<void> {
  if (!isCacheApiAvailable()) return;
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const keys = await cache.keys();
    await Promise.all(
      keys
        .filter(req => new URL(req.url).pathname.startsWith('/__offline/files/'))
        .map(req => cache.delete(req))
    );
  } catch {
    // Ignore errors
  }
}

/**
 * Computes how much of the offline storage quota is currently occupied by cached files.
 * Combines real FileItem cached bytes with browser StorageManager.estimate() when available.
 */
export async function estimateOfflineStorageQuota(
  files: FileItem[],
  lastSyncedAt: string | null
): Promise<OfflineCacheStats> {
  const offlineFiles = files.filter(f => f.isOffline && !f.isTrash);
  const usedBytes = offlineFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

  let browserEstimateUsedBytes: number | undefined;
  let browserEstimateQuotaBytes: number | undefined;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      browserEstimateUsedBytes = estimate.usage;
      browserEstimateQuotaBytes = estimate.quota;
    } catch {
      // Optional API
    }
  }

  // Use a clear dedicated offline quota allowance (512 MB or scaled up if cached files exceed 512 MB)
  const quotaBytes = Math.max(
    DEFAULT_OFFLINE_QUOTA_BYTES,
    Math.ceil((usedBytes * 1.25) / (128 * 1024 * 1024)) * (128 * 1024 * 1024)
  );
  const percentUsed = quotaBytes > 0 ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0;

  return {
    usedBytes,
    quotaBytes,
    cachedFilesCount: offlineFiles.length,
    percentUsed,
    lastSyncedAt,
    browserEstimateUsedBytes,
    browserEstimateQuotaBytes,
  };
}
