import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { db } from '@/services/database';
import { stats } from '@/services/stats';
import { exportService } from '@/services/export';
import type { YearlyStats, MonthlyStats } from '@/types';
import { FileDown, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { monthNames } from '@/i18n/translations';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1'];

export function Dashboard() {
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [statsData, setStatsData] = useState<YearlyStats | MonthlyStats | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadStats();
  }, [viewType, selectedYear, selectedMonth]);

  const loadStats = async () => {
    const cases = await db.getAllCases();
    if (viewType === 'yearly') {
      setStatsData(stats.calculateYearlyStats(cases, selectedYear));
    } else {
      setStatsData(stats.calculateMonthlyStats(cases, new Date(selectedYear, selectedMonth)));
    }
  };

  if (!statsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const getCaseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      violence: t.caseTypeViolence || 'Violence',
      addiction: t.caseTypeAddiction || 'Addiction',
      neglect: t.caseTypeNeglect || 'Neglect',
      exploitation: t.caseTypeExploitation || 'Exploitation',
      family_issues: t.caseTypeFamilyIssues || 'Family Issues',
      other: t.caseTypeOther || 'Other'
    };
    return labels[type] || type;
  };

  const problemsChartData = Object.entries(statsData.problemsDistribution || {}).map(([name, value]) => ({
    name: getCaseTypeLabel(name),
    value,
    fill: COLORS[Math.floor(Math.random() * COLORS.length)]
  })).filter(item => item.value > 0);

  const genderData = [
    { name: t.boys, value: statsData.boys || 0, fill: '#3B82F6' },
    { name: t.girls, value: statsData.girls || 0, fill: '#EC4899' }
  ].filter(item => item.value > 0);

  const monthlyTrend = viewType === 'yearly' && (statsData as YearlyStats).monthlyData
    ? (statsData as YearlyStats).monthlyData.map((m, idx) => ({
        month: monthNames[language][idx],
        total: m.total
      }))
    : [];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Controls */}
      <div className="glass rounded-2xl p-4 md:p-6 card-hover">
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">{t.analysisperiod}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            options={[
              { value: 'monthly', label: t.monthly },
              { value: 'yearly', label: t.yearly }
            ]}
            value={viewType}
            onChange={e => setViewType(e.target.value as 'monthly' | 'yearly')}
          />
          {viewType === 'monthly' && (
            <Select
              options={Array.from({ length: 12 }, (_, i) => ({
                value: i.toString(),
                label: monthNames[language][i]
              }))}
              value={selectedMonth.toString()}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
            />
          )}
          <input
            type="number"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border-2 border-slate-200 rounded-xl w-24 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="glass rounded-xl md:rounded-2xl p-3 md:p-6 card-hover relative overflow-hidden">
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl shadow-lg w-fit">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-slate-600 font-semibold text-xs md:text-base">{t.totalCases}</h3>
            </div>
            <p className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{statsData.total || 0}</p>
          </div>
        </div>

        <div className="glass rounded-xl md:rounded-2xl p-3 md:p-6 card-hover relative overflow-hidden">
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg md:rounded-xl shadow-lg w-fit">
                <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-slate-600 font-semibold text-xs md:text-base">{t.boys}</h3>
            </div>
            <p className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{statsData.boys || 0}</p>
            <p className="text-xs text-slate-500 mt-1">👦 {statsData.total > 0 ? ((statsData.boys / statsData.total) * 100).toFixed(0) : 0}%</p>
          </div>
        </div>

        <div className="glass rounded-xl md:rounded-2xl p-3 md:p-6 card-hover relative overflow-hidden">
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg md:rounded-xl shadow-lg w-fit">
                <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-slate-600 font-semibold text-xs md:text-base">{t.girls}</h3>
            </div>
            <p className="text-3xl md:text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">{statsData.girls || 0}</p>
            <p className="text-xs text-slate-500 mt-1">👧 {statsData.total > 0 ? ((statsData.girls / statsData.total) * 100).toFixed(0) : 0}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        {genderData.length > 0 ? (
          <div className="glass rounded-2xl p-6 card-hover">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-pink-500 rounded-full"></div>
              {t.genderDistribution}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={genderData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 card-hover flex items-center justify-center h-[380px]">
            <div className="text-center">
              <p className="text-slate-400 text-lg">{t.noDataAvailable}</p>
              <p className="text-slate-500 text-sm mt-2">{t.addCasesToSeeStats}</p>
            </div>
          </div>
        )}

        {/* Problems Distribution */}
        {problemsChartData.length > 0 ? (
          <div className="glass rounded-2xl p-6 card-hover">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              {t.problemTypes}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={problemsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {problemsChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 card-hover flex items-center justify-center h-[380px]">
            <div className="text-center">
              <p className="text-slate-400 text-lg">{t.noDataAvailable}</p>
              <p className="text-slate-500 text-sm mt-2">{t.addCasesToSeeStats}</p>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Trend (Yearly view only) */}
      {viewType === 'yearly' && monthlyTrend.length > 0 && (
        <div className="glass rounded-2xl p-6 card-hover">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></div>
            {t.monthlyEvolution}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="url(#colorGradient)" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 6 }}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export Buttons */}
      <div className="glass rounded-2xl p-4 md:p-6 card-hover">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileDown className="w-5 h-5" />
          {t.exportReports}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={() => exportService.exportToPDF(statsData, viewType)} size="lg" className="w-full">
            {t.exportPDF}
          </Button>
          <Button onClick={() => exportService.exportToExcel(statsData, viewType)} variant="success" size="lg" className="w-full">
            {t.exportExcel}
          </Button>
          <Button onClick={() => exportService.exportToWord(statsData, viewType)} variant="secondary" size="lg" className="w-full">
            {t.exportWord}
          </Button>
        </div>
      </div>
    </div>
  );
}
