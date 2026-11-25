export type MessagePlatform = 'whatsapp' | 'sms';

export interface ChatMessageItem {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
  hasAttachment?: boolean;
  attachmentType?: 'image' | 'voice' | 'video' | 'document' | 'location';
  attachmentName?: string;
  attachmentSize?: string;
  attachmentUrl?: string;
}

export interface ChatConversation {
  id: string;
  platform: MessagePlatform;
  contactName: string;
  phoneNumber: string;
  avatarUrl?: string;
  lastMessageText: string;
  lastMessageTime: string;
  totalMessagesCount: number;
  totalMediaSizeBytes: number;
  isE2EEEncrypted: boolean;
  encryptionKeyFingerprint: string;
  backupStatus: 'synced' | 'pending' | 'syncing';
  messages: ChatMessageItem[];
}

export interface MessagesBackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: 'realtime' | 'daily' | 'weekly' | 'manual';
  wifiOnly: boolean;
  includeMediaAttachments: boolean;
  smartAudioCompression: boolean; // Compress WhatsApp voice notes to Opus 32kbps
  endToEndEncryptionEnabled: boolean;
  backupKeyFingerprint: string;
  lastSyncTimestamp: string;
  totalSmsCount: number;
  totalWhatsappCount: number;
  totalMediaSizeBytes: number;
  userMasterKey64?: string;
  keySavedLocally?: boolean;
  lastAuditCheck?: string;
  backupToEncryptedVault?: boolean;
}
