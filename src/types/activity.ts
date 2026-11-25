export type ActivityActionType =
  | 'upload'
  | 'delete'
  | 'create_folder'
  | 'rename'
  | 'move'
  | 'share'
  | 'restore'
  | 'security'
  | 'vault'
  | 'system';

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'danger';

export interface ActivityLogItem {
  id: string;
  type: ActivityActionType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  targetName: string;
  targetType: 'file' | 'folder' | 'vault' | 'security' | 'share' | 'system';
  timestamp: string; // ISO string
  ipAddress: string;
  device: string;
  actor: string;
  severity: ActivitySeverity;
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    sha256?: string;
    previousName?: string;
    folderPath?: string;
    sharePermission?: 'view' | 'edit';
    expirationDays?: number;
    securityMethod?: string;
    [key: string]: unknown;
  };
}
