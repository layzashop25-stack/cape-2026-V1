import type { Case, Database } from '@/types';

const DB_KEY = 'cape_database';
const DB_VERSION = 2;

function sanitizeCase(c: Record<string, unknown>): Case {
  return {
    id: String(c.id ?? crypto.randomUUID()),
    fileNumber: String(c.fileNumber ?? ''),
    completedBy: String(c.completedBy ?? ''),
    sender: String(c.sender ?? ''),
    reportSource: String(c.reportSource ?? ''),
    firstName: String(c.firstName ?? ''),
    lastName: String(c.lastName ?? ''),
    birthDate: String(c.birthDate ?? ''),
    birthPlace: String(c.birthPlace ?? ''),
    gender: (c.gender === 'female' ? 'female' : 'male'),
    civilRegistration: Boolean(c.civilRegistration ?? false),
    phone: String(c.phone ?? ''),
    siblingsCount: Number(c.siblingsCount ?? 0),
    orderAmongSiblings: Number(c.orderAmongSiblings ?? 0),
    educationLevel: String(c.educationLevel ?? ''),
    institution: String(c.institution ?? ''),
    stoppedSchool: Boolean(c.stoppedSchool ?? false),
    schoolStopDate: String(c.schoolStopDate ?? ''),
    socialCoverage: String(c.socialCoverage ?? ''),
    substances: Array.isArray(c.substances) ? c.substances : [],
    medicalHistory: Array.isArray(c.medicalHistory) ? c.medicalHistory : [],
    motherFirstName: String(c.motherFirstName ?? ''),
    motherLastName: String(c.motherLastName ?? ''),
    motherBirthDate: String(c.motherBirthDate ?? ''),
    motherBirthPlace: String(c.motherBirthPlace ?? ''),
    motherNationalId: String(c.motherNationalId ?? ''),
    motherPhone: String(c.motherPhone ?? ''),
    motherEducation: String(c.motherEducation ?? ''),
    motherProfession: String(c.motherProfession ?? ''),
    motherAddress: String(c.motherAddress ?? ''),
    fatherFirstName: String(c.fatherFirstName ?? ''),
    fatherLastName: String(c.fatherLastName ?? ''),
    fatherBirthDate: String(c.fatherBirthDate ?? ''),
    fatherBirthPlace: String(c.fatherBirthPlace ?? ''),
    fatherNationalId: String(c.fatherNationalId ?? ''),
    fatherPhone: String(c.fatherPhone ?? ''),
    fatherEducation: String(c.fatherEducation ?? ''),
    fatherProfession: String(c.fatherProfession ?? ''),
    fatherAddress: String(c.fatherAddress ?? ''),
    parentsStatus: String(c.parentsStatus ?? ''),
    childLivingPlace: String(c.childLivingPlace ?? ''),
    abuserFirstName: String(c.abuserFirstName ?? ''),
    abuserLastName: String(c.abuserLastName ?? ''),
    abuserAge: String(c.abuserAge ?? ''),
    abuserNationalId: String(c.abuserNationalId ?? ''),
    abuserPhone: String(c.abuserPhone ?? ''),
    abuserEducation: String(c.abuserEducation ?? ''),
    abuserProfession: String(c.abuserProfession ?? ''),
    abuserAddress: String(c.abuserAddress ?? ''),
    abuserRelation: String(c.abuserRelation ?? ''),
    violenceTypes: Array.isArray(c.violenceTypes) ? c.violenceTypes : [],
    violenceNature: String(c.violenceNature ?? ''),
    childStatement: String(c.childStatement ?? ''),
    childCondition: String(c.childCondition ?? ''),
    childRequests: String(c.childRequests ?? ''),
    notes: String(c.notes ?? ''),
    // Legacy
    name: String(c.name ?? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()),
    age: Number(c.age ?? 0),
    problemType: (c.problemType as any) ?? 'other',
    date: String(c.date ?? new Date().toISOString().split('T')[0]),
    createdAt: String(c.createdAt ?? new Date().toISOString()),
  };
}

function migrate(raw: Record<string, unknown>): Database {
  const version = Number(raw.version ?? 1);
  let cases: Case[] = [];

  if (Array.isArray(raw.cases)) {
    cases = raw.cases
      .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
      .map(sanitizeCase);
  }

  // v1 → v2: ensure all cases have firstName/lastName split from name
  if (version < 2) {
    cases = cases.map(c => {
      if (!c.firstName && c.name) {
        const parts = c.name.trim().split(' ');
        return { ...c, firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
      }
      return c;
    });
  }

  return {
    version: DB_VERSION,
    cases,
    users: Array.isArray(raw.users) ? raw.users : [],
    settings: (raw.settings && typeof raw.settings === 'object') ? raw.settings as any : {},
    calendarEvents: Array.isArray(raw.calendarEvents) ? raw.calendarEvents : [],
  };
}

class DatabaseService {
  private getDB(): Database {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) return this.getDefaultDB();
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return this.getDefaultDB();
      return migrate(parsed);
    } catch {
      console.warn('[CAPE] localStorage data corrupted — using empty database');
      return this.getDefaultDB();
    }
  }

  private saveDB(db: Database): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify({ ...db, version: DB_VERSION }, null, 2));
    } catch (e) {
      console.error('[CAPE] Failed to save database:', e);
    }
  }

  private getDefaultDB(): Database {
    return { version: DB_VERSION, cases: [], users: [], settings: {}, calendarEvents: [] };
  }

  async getAllCases(): Promise<Case[]> {
    return this.getDB().cases;
  }

  async addCase(caseData: Omit<Case, 'id' | 'createdAt'>): Promise<Case> {
    const db = this.getDB();
    const newCase: Case = {
      ...sanitizeCase({ ...caseData } as Record<string, unknown>),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    db.cases.push(newCase);
    this.saveDB(db);
    return newCase;
  }

  async updateCase(id: string, caseData: Partial<Case>): Promise<Case | null> {
    const db = this.getDB();
    const index = db.cases.findIndex(c => c.id === id);
    if (index === -1) return null;
    db.cases[index] = sanitizeCase({ ...db.cases[index], ...caseData } as Record<string, unknown>);
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

  async searchCases(query: string): Promise<Case[]> {
    if (!query.trim()) return this.getDB().cases;
    const q = query.toLowerCase().trim();
    return this.getDB().cases.filter(c =>
      [
        c.name, c.firstName, c.lastName, c.fileNumber, c.phone,
        c.motherFirstName, c.motherLastName, c.motherPhone,
        c.fatherFirstName, c.fatherLastName, c.fatherPhone,
        c.notes, c.birthPlace, c.institution, c.abuserFirstName, c.abuserLastName,
      ]
        .filter(Boolean)
        .some(field => field!.toLowerCase().includes(q))
    );
  }

  async getCasesByDateRange(startDate: string, endDate: string): Promise<Case[]> {
    return this.getDB().cases.filter(c => c.date >= startDate && c.date <= endDate);
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
    const parsed = JSON.parse(jsonData);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON structure');
    const migrated = migrate(parsed);
    this.saveDB(migrated);
  }
}

export const db = new DatabaseService();
