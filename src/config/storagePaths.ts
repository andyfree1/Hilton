import { format } from 'date-fns';

export interface StoragePath {
  root: string;
  projects: string;
  reports: string;
  media: string;
  templates: string;
  backups: string;
  temp: string;
}

export interface StorageConfig {
  paths: StoragePath;
  maxVersions: number;
  autoSaveInterval: number; // in milliseconds
  backupInterval: number; // in milliseconds
}

// Base storage configuration
export const storageConfig: StorageConfig = {
  paths: {
    root: 'Hilton Media',
    projects: 'Hilton Media/Projects',
    reports: 'Hilton Media/Reports',
    media: 'Hilton Media/Media',
    templates: 'Hilton Media/Templates',
    backups: 'Hilton Media/Backups',
    temp: 'Hilton Media/Temp'
  },
  maxVersions: 4,
  autoSaveInterval: 60000, // 1 minute
  backupInterval: 3600000  // 1 hour
};

export function getProjectPath(projectId: string): string {
  return `${storageConfig.paths.projects}/${projectId}`;
}

export function getReportPath(projectId: string, reportDate: Date): string {
  const formattedDate = format(reportDate, 'yyyy-MM');
  return `${storageConfig.paths.reports}/${projectId}/${formattedDate}`;
}

export function getMediaPath(projectId: string): string {
  return `${storageConfig.paths.media}/${projectId}`;
}

export function getBackupPath(timestamp: Date = new Date()): string {
  const formattedDate = format(timestamp, 'yyyy-MM-dd-HHmmss');
  return `${storageConfig.paths.backups}/backup-${formattedDate}`;
}

export function getVersionPath(projectId: string, version: number): string {
  return `${storageConfig.paths.projects}/${projectId}/versions/v${version}`;
}

export function getTempPath(prefix: string = ''): string {
  const timestamp = format(new Date(), 'yyyyMMddHHmmss');
  return `${storageConfig.paths.temp}/${prefix}${timestamp}`;
}

// Storage keys for localStorage/IndexedDB
export const storageKeys = {
  versionHistory: 'hilton-version-history',
  cloudSync: 'hilton-cloud-sync',
  mediaStorage: 'hilton-media-storage',
  userPreferences: 'hilton-user-preferences',
  lastBackup: 'hilton-last-backup',
  autoSaveStatus: 'hilton-auto-save-status'
};

// File type configurations
export const fileTypes = {
  allowed: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  maxSize: 50 * 1024 * 1024, // 50MB
  imageMaxSize: 10 * 1024 * 1024, // 10MB
  thumbnailSize: {
    width: 200,
    height: 200
  }
};

// Storage quota management
export const quotaConfig = {
  maxStorageSize: 500 * 1024 * 1024, // 500MB total
  warningThreshold: 0.8, // 80% of max storage
  cleanupThreshold: 0.9, // 90% of max storage
  minFreeSpace: 50 * 1024 * 1024 // 50MB minimum free space
};

// Export utility functions
export function isStorageAvailable(): boolean {
  try {
    const storage = window.localStorage;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

export async function getStorageUsage(): Promise<{
  used: number;
  total: number;
  available: number;
}> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      total: estimate.quota || 0,
      available: (estimate.quota || 0) - (estimate.usage || 0)
    };
  }
  
  return {
    used: 0,
    total: quotaConfig.maxStorageSize,
    available: quotaConfig.maxStorageSize
  };
}

export function formatStorageSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}