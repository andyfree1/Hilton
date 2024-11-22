import {
  storageConfig,
  storageKeys,
  fileTypes,
  quotaConfig,
  getStorageUsage,
  formatStorageSize
} from '../config/storagePaths';

class StorageManager {
  private static instance: StorageManager;

  private constructor() {
    this.initializeStorage();
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private async initializeStorage() {
    try {
      // Create base directory structure
      Object.values(storageConfig.paths).forEach(path => {
        this.createDirectory(path);
      });

      // Check storage quota
      await this.checkStorageQuota();

      console.log('Storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  private createDirectory(path: string) {
    try {
      // Using localStorage to track directory structure
      const structure = JSON.parse(localStorage.getItem(storageKeys.mediaStorage) || '{}');
      
      path.split('/').reduce((current: any, folder: string) => {
        if (!current[folder]) {
          current[folder] = {
            type: 'directory',
            created: new Date().toISOString(),
            children: {}
          };
        }
        return current[folder].children;
      }, structure);

      localStorage.setItem(storageKeys.mediaStorage, JSON.stringify(structure));
    } catch (error) {
      console.error(`Failed to create directory ${path}:`, error);
      throw error;
    }
  }

  async checkStorageQuota() {
    const usage = await getStorageUsage();
    const usageRatio = usage.used / usage.total;

    if (usageRatio >= quotaConfig.warningThreshold) {
      console.warn(`Storage usage is at ${(usageRatio * 100).toFixed(1)}%`);
      
      if (usageRatio >= quotaConfig.cleanupThreshold) {
        await this.cleanupOldVersions();
      }
    }

    return {
      ...usage,
      formattedUsed: formatStorageSize(usage.used),
      formattedTotal: formatStorageSize(usage.total),
      formattedAvailable: formatStorageSize(usage.available),
      usageRatio
    };
  }

  private async cleanupOldVersions() {
    try {
      // Get all projects
      const structure = JSON.parse(localStorage.getItem(storageKeys.mediaStorage) || '{}');
      const projects = structure[storageConfig.paths.projects]?.children || {};

      // For each project, keep only the latest versions
      Object.keys(projects).forEach(projectId => {
        const versions = projects[projectId].children?.versions?.children || {};
        const versionList = Object.keys(versions)
          .sort((a, b) => versions[b].created.localeCompare(versions[a].created))
          .slice(storageConfig.maxVersions);

        // Remove old versions
        versionList.forEach(version => {
          delete versions[version];
        });
      });

      localStorage.setItem(storageKeys.mediaStorage, JSON.stringify(structure));
      console.log('Old versions cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup old versions:', error);
    }
  }

  async saveFile(path: string, content: any, metadata: any = {}) {
    try {
      const structure = JSON.parse(localStorage.getItem(storageKeys.mediaStorage) || '{}');
      const fileName = path.split('/').pop() || '';
      const directory = path.split('/').slice(0, -1).join('/');

      // Create directory if it doesn't exist
      this.createDirectory(directory);

      // Save file
      const file = {
        type: 'file',
        name: fileName,
        content,
        metadata: {
          ...metadata,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          size: JSON.stringify(content).length
        }
      };

      // Update structure
      let current = structure;
      directory.split('/').forEach(folder => {
        current = current[folder]?.children;
      });
      current[fileName] = file;

      localStorage.setItem(storageKeys.mediaStorage, JSON.stringify(structure));
      console.log(`File saved successfully: ${path}`);
    } catch (error) {
      console.error(`Failed to save file ${path}:`, error);
      throw error;
    }
  }

  async getFile(path: string) {
    try {
      const structure = JSON.parse(localStorage.getItem(storageKeys.mediaStorage) || '{}');
      const parts = path.split('/');
      let current = structure;

      for (const part of parts) {
        current = current[part]?.children || current[part];
        if (!current) throw new Error(`File not found: ${path}`);
      }

      return current;
    } catch (error) {
      console.error(`Failed to get file ${path}:`, error);
      throw error;
    }
  }

  async deleteFile(path: string) {
    try {
      const structure = JSON.parse(localStorage.getItem(storageKeys.mediaStorage) || '{}');
      const parts = path.split('/');
      const fileName = parts.pop() || '';
      let current = structure;

      for (const part of parts) {
        current = current[part]?.children;
        if (!current) throw new Error(`Path not found: ${path}`);
      }

      delete current[fileName];
      localStorage.setItem(storageKeys.mediaStorage, JSON.stringify(structure));
      console.log(`File deleted successfully: ${path}`);
    } catch (error) {
      console.error(`Failed to delete file ${path}:`, error);
      throw error;
    }
  }

  async listDirectory(path: string) {
    try {
      const structure = JSON.parse(localStorage.getItem(storageKeys.mediaStorage) || '{}');
      let current = structure;

      if (path !== '/') {
        for (const part of path.split('/')) {
          current = current[part]?.children;
          if (!current) throw new Error(`Directory not found: ${path}`);
        }
      }

      return Object.entries(current).map(([name, data]: [string, any]) => ({
        name,
        type: data.type,
        metadata: data.metadata || {},
        isDirectory: data.type === 'directory'
      }));
    } catch (error) {
      console.error(`Failed to list directory ${path}:`, error);
      throw error;
    }
  }
}

export const storageManager = StorageManager.getInstance();