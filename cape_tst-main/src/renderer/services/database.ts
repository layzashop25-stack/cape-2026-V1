import type { Case, Database } from '@/types';

const DB_KEY = 'cape_database';

class DatabaseService {
  private getDB(): Database {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : this.getDefaultDB();
    } catch {
      return this.getDefaultDB();
    }
  }

  private saveDB(db: Database): void {
    localStorage.setItem(DB_KEY, JSON.stringify(db, null, 2));
  }

  private getDefaultDB(): Database {
    return {
      cases: [],
      users: [],
      settings: {},
      calendarEvents: []
    };
  }

  async getAllCases(): Promise<Case[]> {
    return this.getDB().cases;
  }

  async addCase(caseData: Omit<Case, 'id' | 'createdAt'>): Promise<Case> {
    const db = this.getDB();
    const newCase: Case = {
      ...caseData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    db.cases.push(newCase);
    this.saveDB(db);
    return newCase;
  }

  async updateCase(id: string, caseData: Partial<Case>): Promise<Case | null> {
    const db = this.getDB();
    const index = db.cases.findIndex(c => c.id === id);
    if (index === -1) return null;
    db.cases[index] = { ...db.cases[index], ...caseData };
    this.saveDB(db);
    return db.cases[index];
  }

  async deleteCase(id: string): Promise<boolean> {
    const db = this.getDB();
    const index = db.cases.findIndex(c => c.id === id);
    if (index === -1) return false;
    db.cases.splice(index, 1);
    this.saveDB(db);
    return true;
  }

  async getCasesByDateRange(startDate: string, endDate: string): Promise<Case[]> {
    return this.getDB().cases.filter(c => c.date >= startDate && c.date <= endDate);
  }

  async searchCases(query: string): Promise<Case[]> {
    const lowerQuery = query.toLowerCase();
    return this.getDB().cases.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.notes.toLowerCase().includes(lowerQuery)
    );
  }

  async getCalendarEvents(): Promise<any[]> {
    return this.getDB().calendarEvents || [];
  }

  async saveCalendarEvents(events: any[]): Promise<void> {
    const db = this.getDB();
    db.calendarEvents = events;
    this.saveDB(db);
  }

  async exportData(): Promise<string> {
    return JSON.stringify(this.getDB(), null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    this.saveDB(data);
  }
}

export const db = new DatabaseService();
