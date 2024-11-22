import Dexie, { Table } from 'dexie';
import type { Sale, CommissionLevel } from '../types/sales';
import { DEFAULT_COMMISSION_LEVELS } from '../types/sales';

export interface Project {
  id?: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  commissionLevels: CommissionLevel[];
}

export class HiltonDatabase extends Dexie {
  sales!: Table<Sale>;
  projects!: Table<Project>;

  constructor() {
    super('HiltonSalesDB');
    
    this.version(1).stores({
      sales: '++id, projectId, date, clientLastName, saleType, isCancelled',
      projects: '++id, name, createdAt'
    });
  }

  async initialize() {
    try {
      // Create default project if none exists
      const projectCount = await this.projects.count();
      if (projectCount === 0) {
        await this.projects.add({
          name: 'Default Project',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          commissionLevels: DEFAULT_COMMISSION_LEVELS
        });
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
}

export const db = new HiltonDatabase();

// Initialize database when module is loaded
db.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
});

// Export commission level update function
export async function updateCommissionLevels(projectId: number, levels: CommissionLevel[]): Promise<Project> {
  try {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    project.commissionLevels = levels;
    project.updatedAt = new Date().toISOString();
    
    await db.projects.put(project);
    return project;
  } catch (error) {
    console.error('Failed to update commission levels:', error);
    throw error;
  }
}

// Export project creation function
export async function createProject(name: string): Promise<number> {
  try {
    const id = await db.projects.add({
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commissionLevels: DEFAULT_COMMISSION_LEVELS
    });
    return id;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}