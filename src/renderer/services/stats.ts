import type { Case, MonthlyStats, YearlyStats, ProblemType } from '@/types';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

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

  private getProblemsDistribution(cases: Case[]): Record<ProblemType, number> {
    const dist: Record<string, number> = {};
    cases.forEach(c => {
      dist[c.problemType] = (dist[c.problemType] || 0) + 1;
    });
    return dist as Record<ProblemType, number>;
  }
}

export const stats = new StatsService();
