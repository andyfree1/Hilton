export type CloudProvider = 'icloud' | 'dropbox' | 'google-drive' | 'onedrive' | 'amazon-s3';

export interface CloudStorageConfig {
  provider: CloudProvider;
  enabled: boolean;
  lastSync: string | null;
  autoSync: boolean;
}

export interface CloudCredentials {
  provider: CloudProvider;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface CloudStorageStats {
  usedSpace: number;
  totalSpace: number;
  lastSync: string | null;
}

export const CLOUD_PROVIDERS = [
  {
    id: 'icloud',
    name: 'iCloud',
    icon: 'apple',
    color: '#000000'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: 'dropbox',
    color: '#0061FF'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: 'hard-drive',
    color: '#4285F4'
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: 'cloud',
    color: '#0078D4'
  },
  {
    id: 'amazon-s3',
    name: 'Amazon S3',
    icon: 'database',
    color: '#FF9900'
  }
];