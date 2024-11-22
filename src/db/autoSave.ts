import { db, Project } from './database';
import type { Sale } from '../types/sales';

interface VersionedData {
  version: number;
  timestamp: string;
  projectId: string;
  data: {
    project: Project;
    sales: Sale[];
  };
}

class AutoSaveManager {
  private static instance: AutoSaveManager;
  private readonly MAX_VERSIONS = 4;
  private readonly SAVE_INTERVAL = 60000; // 1 minute
  private intervalId: NodeJS.Timer | null = null;
  private versionKey = 'hilton-version-history';

  private constructor() {
    this.startAutoSave();
  }

  static getInstance(): AutoSaveManager {
    if (!AutoSaveManager.instance) {
      AutoSaveManager.instance = new AutoSaveManager();
    }
    return AutoSaveManager.instance;
  }

  private async saveVersion(projectId: string) {
    try {
      // Get current project data
      const project = await db.projects.get(projectId);
      const sales = await db.sales.where('projectId').equals(projectId).toArray();

      if (!project) return;

      // Get existing versions
      const versionsStr = localStorage.getItem(this.versionKey);
      const versions: VersionedData[] = versionsStr ? JSON.parse(versionsStr) : [];

      // Filter versions for current project
      const projectVersions = versions.filter(v => v.projectId === projectId);

      // Create new version
      const newVersion: VersionedData = {
        version: (projectVersions[0]?.version || 0) + 1,
        timestamp: new Date().toISOString(),
        projectId,
        data: {
          project,
          sales
        }
      };

      // Add new version and keep only last MAX_VERSIONS
      const updatedVersions = [
        newVersion,
        ...versions.filter(v => v.projectId !== projectId)
      ];

      // Keep only MAX_VERSIONS per project
      const finalVersions = [
        ...updatedVersions.filter(v => v.projectId !== projectId),
        ...updatedVersions
          .filter(v => v.projectId === projectId)
          .slice(0, this.MAX_VERSIONS)
      ];

      // Save updated versions
      localStorage.setItem(this.versionKey, JSON.stringify(finalVersions));

      console.log(`Auto-saved version ${newVersion.version} for project ${projectId}`);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  async getVersions(projectId: string): Promise<VersionedData[]> {
    const versionsStr = localStorage.getItem(this.versionKey);
    const versions: VersionedData[] = versionsStr ? JSON.parse(versionsStr) : [];
    return versions
      .filter(v => v.projectId === projectId)
      .sort((a, b) => b.version - a.version);
  }

  async restoreVersion(versionData: VersionedData): Promise<void> {
    try {
      await db.transaction('rw', db.projects, db.sales, async () => {
        // Update project
        await db.projects.put(versionData.data.project);
        
        // Delete existing sales and add version sales
        await db.sales.where('projectId').equals(versionData.projectId).delete();
        await db.sales.bulkAdd(versionData.data.sales);
      });

      console.log(`Restored version ${versionData.version} for project ${versionData.projectId}`);
    } catch (error) {
      console.error('Version restore failed:', error);
      throw error;
    }
  }

  startAutoSave() {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      const projects = await db.projects.toArray();
      for (const project of projects) {
        if (project.id) {
          await this.saveVersion(project.id);
        }
      }
    }, this.SAVE_INTERVAL);
  }

  stopAutoSave() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const autoSave = AutoSaveManager.getInstance();