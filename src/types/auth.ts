export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'user';
  createdAt: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  passkeyEnabled: boolean;
  preferredRegion: 'me-central-1' | 'eu-west-1' | 'ap-southeast-1';
  allocatedStorageGB: number;
}

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-otp';
