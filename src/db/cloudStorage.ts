import { db } from './database';
import type { CloudProvider, CloudStorageConfig, CloudCredentials } from '../types/cloudStorage';

interface SharedResource {
  id: string;
  name: string;
  type: string;
  url: string;
  sharedAt: string;
  sharedBy: string;
}

interface ProjectMedia {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  size: number;
}

class CloudStorageManager {
  private static instance: CloudStorageManager;
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private cloudConfig: CloudStorageConfig | null = null;
  private sharedResources: SharedResource[] = [];
  private projectMedia: Map<string, ProjectMedia[]> = new Map();

  private constructor() {
    this.loadCloudConfig();
  }

  static getInstance(): CloudStorageManager {
    if (!CloudStorageManager.instance) {
      CloudStorageManager.instance = new CloudStorageManager();
    }
    return CloudStorageManager.instance;
  }

  private async loadCloudConfig() {
    const config = localStorage.getItem('hilton-cloud-config');
    this.cloudConfig = config ? JSON.parse(config) : null;
  }

  private async saveCloudConfig(config: CloudStorageConfig) {
    localStorage.setItem('hilton-cloud-config', JSON.stringify(config));
    this.cloudConfig = config;
  }

  async getCloudSettings(): Promise<CloudStorageConfig | null> {
    return this.cloudConfig;
  }

  async updateCloudSettings(settings: Partial<CloudStorageConfig>) {
    const currentConfig = await this.getCloudSettings();
    const newConfig = {
      ...currentConfig,
      ...settings
    } as CloudStorageConfig;
    await this.saveCloudConfig(newConfig);
  }

  async connectCloudProvider(provider: CloudProvider): Promise<void> {
    try {
      // In a real implementation, this would handle OAuth flow
      await this.saveCloudConfig({
        provider,
        enabled: true,
        lastSync: null,
        autoSync: false
      });
      console.log(`Connected to ${provider}`);
    } catch (error) {
      console.error('Failed to connect to provider:', error);
      throw error;
    }
  }

  async getProjectMedia(projectId: string): Promise<ProjectMedia[]> {
    return this.projectMedia.get(projectId) || [];
  }

  async getSharedResources(): Promise<SharedResource[]> {
    return this.sharedResources;
  }

  async syncData(): Promise<void> {
    if (this.syncInProgress) return;

    try {
      this.syncInProgress = true;
      // In a real implementation, this would sync with the cloud provider
      console.log('Syncing data...');
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.lastSyncTime = new Date();
      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  async uploadFile(projectId: string, file: File): Promise<void> {
    try {
      const media: ProjectMedia = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        size: file.size
      };

      const projectFiles = this.projectMedia.get(projectId) || [];
      projectFiles.push(media);
      this.projectMedia.set(projectId, projectFiles);

      console.log(`File uploaded: ${file.name}`);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  async shareResource(projectId: string, mediaId: string): Promise<void> {
    try {
      const projectFiles = this.projectMedia.get(projectId) || [];
      const media = projectFiles.find(m => m.id === mediaId);
      
      if (media) {
        const sharedResource: SharedResource = {
          id: Date.now().toString(),
          name: media.name,
          type: media.type,
          url: media.url,
          sharedAt: new Date().toISOString(),
          sharedBy: 'Current User' // In a real app, this would be the actual user
        };

        this.sharedResources.push(sharedResource);
        console.log(`Resource shared: ${media.name}`);
      }
    } catch (error) {
      console.error('Share failed:', error);
      throw error;
    }
  }

  async deleteResource(projectId: string, mediaId: string): Promise<void> {
    try {
      const projectFiles = this.projectMedia.get(projectId) || [];
      const updatedFiles = projectFiles.filter(m => m.id !== mediaId);
      this.projectMedia.set(projectId, updatedFiles);
      
      console.log(`Resource deleted: ${mediaId}`);
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    return this.lastSyncTime;
  }

  async getSyncStatus(): Promise<boolean> {
    return this.syncInProgress;
  }
}

export const cloudStorage = CloudStorageManager.getInstance();