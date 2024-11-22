import { db } from './database';
import type { Sale } from '../types/sales';
import { saveAs } from 'file-saver';

interface HiltonMediaFolder {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: HiltonMediaFolder[];
  content?: any;
  createdAt: string;
  updatedAt: string;
  metadata: {
    version?: string;
    projectId?: string;
    fileType?: string;
    size?: number;
    tags?: string[];
  };
}

class HiltonMediaStorage {
  private static instance: HiltonMediaStorage;
  private baseFolder: string = 'Hilton Media';
  private storageKey: string = 'hilton-media-storage';

  private constructor() {
    this.initializeStorage();
  }

  static getInstance(): HiltonMediaStorage {
    if (!HiltonMediaStorage.instance) {
      HiltonMediaStorage.instance = new HiltonMediaStorage();
    }
    return HiltonMediaStorage.instance;
  }

  private async initializeStorage() {
    const structure = await this.getStorageStructure();
    if (!structure) {
      const initialStructure: HiltonMediaFolder = {
        id: 'root',
        name: this.baseFolder,
        path: '/',
        type: 'folder',
        children: [
          {
            id: 'projects',
            name: 'Projects',
            path: '/projects',
            type: 'folder',
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {}
          },
          {
            id: 'reports',
            name: 'Reports',
            path: '/reports',
            type: 'folder',
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {}
          },
          {
            id: 'media',
            name: 'Media',
            path: '/media',
            type: 'folder',
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {}
          },
          {
            id: 'templates',
            name: 'Templates',
            path: '/templates',
            type: 'folder',
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {}
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {}
      };
      await this.saveStorageStructure(initialStructure);
    }
  }

  private async getStorageStructure(): Promise<HiltonMediaFolder | null> {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  private async saveStorageStructure(structure: HiltonMediaFolder): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(structure));
  }

  async exportToFile(): Promise<void> {
    const structure = await this.getStorageStructure();
    const blob = new Blob([JSON.stringify(structure, null, 2)], { type: 'application/json' });
    saveAs(blob, `${this.baseFolder}-${new Date().toISOString().split('T')[0]}.json`);
  }

  async importFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const structure = JSON.parse(text);
      await this.saveStorageStructure(structure);
    } catch (error) {
      console.error('Failed to import storage structure:', error);
      throw error;
    }
  }

  async addProject(projectId: string, name: string): Promise<void> {
    const structure = await this.getStorageStructure();
    if (!structure) throw new Error('Storage not initialized');

    const projectsFolder = structure.children?.find(child => child.id === 'projects');
    if (!projectsFolder) throw new Error('Projects folder not found');

    const projectFolder: HiltonMediaFolder = {
      id: projectId,
      name,
      path: `/projects/${projectId}`,
      type: 'folder',
      children: [
        {
          id: `${projectId}-sales`,
          name: 'Sales Data',
          path: `/projects/${projectId}/sales`,
          type: 'folder',
          children: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: { projectId }
        },
        {
          id: `${projectId}-media`,
          name: 'Media Files',
          path: `/projects/${projectId}/media`,
          type: 'folder',
          children: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: { projectId }
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { projectId }
    };

    projectsFolder.children?.push(projectFolder);
    await this.saveStorageStructure(structure);
  }

  async addFile(path: string, file: File, metadata: any = {}): Promise<void> {
    const structure = await this.getStorageStructure();
    if (!structure) throw new Error('Storage not initialized');

    const content = await this.fileToBase64(file);
    const newFile: HiltonMediaFolder = {
      id: Date.now().toString(),
      name: file.name,
      path: `${path}/${file.name}`,
      type: 'file',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        fileType: file.type,
        size: file.size
      }
    };

    const folder = this.findFolderByPath(structure, path);
    if (!folder) throw new Error('Folder not found');

    folder.children = folder.children || [];
    folder.children.push(newFile);
    await this.saveStorageStructure(structure);
  }

  private findFolderByPath(structure: HiltonMediaFolder, path: string): HiltonMediaFolder | null {
    if (structure.path === path) return structure;
    if (!structure.children) return null;

    for (const child of structure.children) {
      if (child.type === 'folder') {
        const found = this.findFolderByPath(child, path);
        if (found) return found;
      }
    }

    return null;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async moveToExternalStorage(destinationPath: string): Promise<void> {
    const structure = await this.getStorageStructure();
    if (!structure) throw new Error('Storage not initialized');

    try {
      const blob = new Blob([JSON.stringify(structure, null, 2)], { type: 'application/json' });
      const file = new File([blob], `${this.baseFolder}.json`, { type: 'application/json' });
      
      // In a real implementation, this would use the File System Access API
      // or other methods to save to external storage
      saveAs(file, `${this.baseFolder}.json`);
    } catch (error) {
      console.error('Failed to move to external storage:', error);
      throw error;
    }
  }

  async getProjectFiles(projectId: string): Promise<HiltonMediaFolder[]> {
    const structure = await this.getStorageStructure();
    if (!structure) return [];

    const projectFolder = this.findProjectFolder(structure, projectId);
    return projectFolder?.children || [];
  }

  private findProjectFolder(structure: HiltonMediaFolder, projectId: string): HiltonMediaFolder | null {
    const projectsFolder = structure.children?.find(child => child.id === 'projects');
    if (!projectsFolder) return null;

    return projectsFolder.children?.find(project => project.id === projectId) || null;
  }
}

export const hiltonMediaStorage = HiltonMediaStorage.getInstance();