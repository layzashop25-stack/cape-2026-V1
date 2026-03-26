import type { Case, MonthlyStats, YearlyStats, ProblemType } from '@/types';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface DistributionItem { label: string; count: number; percent: number; }

class StatsService {
  calculateMonthlyStats(cases: Case[], date: Date): MonthlyStats {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const filtered = cases.filter(c => {
      const caseDate = new Date(c.date);
      return caseDate >= start && caseDate <= end;
    });
    return {
      month: format(date, 'yyyy-MM'),
      total: filtered.length,
      boys: filtered.filter(c => c.gender === 'male').length,
      girls: filtered.filter(c => c.gender === 'female').length,
      problemsDistribution: this.getProblemsDistribution(filtered)
    };
  }

  calculateYearlyStats(cases: Case[], year: number): YearlyStats {
    const start = startOfYear(new Date(year, 0));
    const end = endOfYear(new Date(year, 0));
    const filtered = cases.filter(c => {
      const caseDate = new Date(c.date);
      return caseDate >= start && caseDate <= end;
    });
    const monthlyData: MonthlyStats[] = [];
    for (let month = 0; month < 12; month++) {
      monthlyData.push(this.calculateMonthlyStats(cases, new Date(year, month)));
    }
    return {
      year,
      total: filtered.length,
      boys: filtered.filter(c => c.gender === 'male').length,
      girls: filtered.filter(c => c.gender === 'female').length,
      problemsDistribution: this.getProblemsDistribution(filtered),
      monthlyData
    };
  }

  getAgeDistribution(cases: Case[]): DistributionItem[] {
    const brackets = [
      { label: '0 - 5',   min: 0,  max: 5  },
      { label: '6 - 10',  min: 6,  max: 10 },
      { label: '11 - 14', min: 11, max: 14 },
      { label: '15 - 18', min: 15, max: 18 },
    ];
    const total = cases.length || 1;
    return brackets.map(b => {
      const count = cases.filter(c => c.age >= b.min && c.age <= b.max).length;
      return { label: b.label, count, percent: Math.round((count / total) * 100) };
    });
  }

  getCategoryDistribution(cases: Case[]): DistributionItem[] {
    const labels: Record<string, string> = {
      violence: 'عنف', addiction: 'إدمان', neglect: 'إهمال',
      exploitation: 'استغلال', family_issues: 'مشاكل عائلية', other: 'أخرى',
    };
    const total = cases.length || 1;
    return Object.entries(labels).map(([key, label]) => {
      const count = cases.filter(c => c.problemType === key).length;
      return { label, count, percent: Math.round((count / total) * 100) };
    }).filter(i => i.count > 0);
  }

  getViolenceDistribution(cases: Case[]): DistributionItem[] {
    const labels: Record<string, string> = {
      physical: 'جسدي', sexual: 'جنسي', psychological: 'نفسي', social: 'اجتماعي',
    };
    const total = cases.length || 1;
    return Object.entries(labels).map(([key, label]) => {
      const count = cases.filter(c => (c.violenceTypes ?? []).includes(key as any)).length;
      return { label, count, percent: Math.round((count / total) * 100) };
    }).filter(i => i.count > 0);
  }

  getEducationDistribution(cases: Case[]): DistributionItem[] {
    const dist: Record<string, number> = {};
    cases.forEach(c => {
      const key = c.educationLevel?.trim() || 'غير محدد';
      dist[key] = (dist[key] || 0) + 1;
    });
    const total = cases.length || 1;
    return Object.entries(dist)
      .map(([label, count]) => ({ label, count, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  private getProblemsDistribution(cases: Case[]): Record<ProblemType, number> {
    const dist: Record<string, number> = {};
    cases.forEach(c => { dist[c.problemType] = (dist[c.problemType] || 0) + 1; });
    return dist as Record<ProblemType, number>;
  }
}

export const stats = new StatsService();
