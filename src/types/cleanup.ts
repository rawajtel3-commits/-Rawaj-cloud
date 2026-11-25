export interface DuplicateFileInfo {
  id: string;
  name: string;
  folderId: string | null;
  folderName: string;
  sizeBytes: number;
  updatedAt: string;
  checksum: string;
  isOriginal: boolean;
  selectedForDeletion: boolean;
}

export interface DuplicateGroup {
  id: string;
  checksum: string;
  baseName: string;
  sizeBytes: number;
  copiesCount: number;
  recoverableBytes: number; // sizeBytes * (copiesCount - 1)
  files: DuplicateFileInfo[];
}

export interface LargeUnusedFile {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  extension: string;
  folderId: string | null;
  folderName: string;
  updatedAt: string;
  daysInactive: number;
  selectedForDeletion: boolean;
}

export interface TempCacheItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sizeBytes: number;
  itemCount: number;
  category: 'offline_chunks' | 'upload_staging' | 'thumbnail_cache' | 'preview_buffers';
  selectedForDeletion: boolean;
}

export interface CleanupScanSummary {
  scannedFilesCount: number;
  totalStorageBytes: number;
  totalRecoverableBytes: number;
  duplicatesBytes: number;
  largeFilesBytes: number;
  tempCacheBytes: number;
  lastScannedAt: string;
}
