import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { Select } from '@/components/Select';
import { db } from '@/services/database';
import { stats } from '@/services/stats';
import { exportSingleDistribution, exportMasterReport } from '@/services/distributionReports';
import type { YearlyStats, MonthlyStats, Case } from '@/types';
import { FileDown, TrendingUp, Users, BarChart3, BookOpen } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { monthNames } from '@/i18n/translations';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1'];

function ChartCard({ title, color, children, onExport, exportLabel }: {
  title: string; color: string; children: React.ReactNode;
  onExport: () => void; exportLabel: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 md:p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className={`w-2 h-7 bg-gradient-to-b ${color} rounded-full`} />
          {title}
        </h3>
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
        >
          <FileDown className="w-3.5 h-3.5" />
          {exportLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

export function Dashboard() {
  const [viewType, setViewType]           = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [statsData, setStatsData]         = useState<YearlyStats | MonthlyStats | null>(null);
  const [allCases, setAllCases]           = useState<Case[]>([]);
  const { t, language } = useLanguage();

  const loadStats = useCallback(async () => {
    const cases = await db.getAllCases();
    setAllCases(cases);
    if (viewType === 'yearly') {
      setStatsData(stats.calculateYearlyStats(cases, selectedYear));
    } else {
      setStatsData(stats.calculateMonthlyStats(cases, new Date(selectedYear, selectedMonth)));
    }
  }, [viewType, selectedYear, selectedMonth]);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (!statsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const getCaseTypeLabel = (type: string) => ({
    violence: t.caseTypeViolence,
    addiction: t.caseTypeAddiction,
    neglect: t.caseTypeNeglect,
    exploitation: t.caseTypeExploitation,
    family_issues: t.caseTypeFamilyIssues,
    other: t.caseTypeOther,
  }[type] || type);

  const problemsChartData = Object.entries(statsData.problemsDistribution || {})
    .map(([name, value], i) => ({ name: getCaseTypeLabel(name), value, fill: COLORS[i % COLORS.length] }))
    .filter(i => i.value > 0);

  const genderData = [
    { name: t.boys,  value: statsData.boys  || 0, fill: '#3B82F6' },
    { name: t.girls, value: statsData.girls || 0, fill: '#EC4899' },
  ].filter(i => i.value > 0);

  const monthlyTrend = viewType === 'yearly' && (statsData as YearlyStats).monthlyData
    ? (statsData as YearlyStats).monthlyData.map((m, idx) => ({
        month: monthNames[language][idx],
        total: m.total,
      }))
    : [];

  // Distribution data — labels come from translations via stats service
  const ageDist  = stats.getAgeDistribution(allCases);
  const catDist  = stats.getCategoryDistribution(allCases, t);
  const violDist = stats.getViolenceDistribution(allCases, t);
  const eduDist  = stats.getEducationDistribution(allCases, t);

  const toChartData = (dist: typeof ageDist) =>
    dist.map((d, i) => ({ name: d.label, value: d.count, fill: COLORS[i % COLORS.length] }));

  const noData = (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      {t.noDataAvailable}
    </div>
  );

  const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' };

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
            options={[{ value: 'monthly', label: t.monthly }, { value: 'yearly', label: t.yearly }]}
            value={viewType}
            onChange={e => setViewType(e.target.value as 'monthly' | 'yearly')}
          />
          {viewType === 'monthly' && (
            <Select
              options={Array.from({ length: 12 }, (_, i) => ({ value: i.toString(), label: monthNames[language][i] }))}
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
        {[
          { label: t.totalCases, value: statsData.total || 0, icon: TrendingUp, grad: 'from-blue-500 to-indigo-600', textGrad: 'from-blue-600 to-indigo-600' },
          { label: t.boys,  value: statsData.boys  || 0, icon: Users, grad: 'from-blue-400 to-cyan-500',  textGrad: 'from-blue-500 to-cyan-500',  sub: `👦 ${statsData.total > 0 ? ((statsData.boys / statsData.total) * 100).toFixed(0) : 0}%` },
          { label: t.girls, value: statsData.girls || 0, icon: Users, grad: 'from-pink-500 to-rose-600',  textGrad: 'from-pink-500 to-rose-500',  sub: `👧 ${statsData.total > 0 ? ((statsData.girls / statsData.total) * 100).toFixed(0) : 0}%` },
        ].map((card, i) => (
          <div key={i} className="glass rounded-xl md:rounded-2xl p-3 md:p-6 card-hover">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <div className={`p-2 bg-gradient-to-br ${card.grad} rounded-lg w-fit`}>
                <card.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h3 className="text-slate-600 font-semibold text-xs md:text-sm">{card.label}</h3>
            </div>
            <p className={`text-3xl md:text-5xl font-black bg-gradient-to-r ${card.textGrad} bg-clip-text text-transparent`}>{card.value}</p>
            {card.sub && <p className="text-xs text-slate-500 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Gender + Problems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {genderData.length > 0 ? (
          <div className="glass rounded-2xl p-4 md:p-6 card-hover">
            <h3 className="text-base md:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-7 bg-gradient-to-b from-blue-500 to-pink-500 rounded-full" />
              {t.genderDistribution}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {genderData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : <div className="glass rounded-2xl p-6 flex items-center justify-center h-64">{noData}</div>}

        {problemsChartData.length > 0 ? (
          <div className="glass rounded-2xl p-4 md:p-6 card-hover">
            <h3 className="text-base md:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-7 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              {t.problemTypes}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={problemsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {problemsChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <div className="glass rounded-2xl p-6 flex items-center justify-center h-64">{noData}</div>}
      </div>

      {/* Monthly trend */}
      {viewType === 'yearly' && monthlyTrend.length > 0 && (
        <div className="glass rounded-2xl p-4 md:p-6 card-hover">
          <h3 className="text-base md:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-7 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
            {t.monthlyEvolution}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribution section divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm font-bold text-slate-500 px-3">📊 {t.distributionAnalysis}</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard
          title={t.ageDistribution}
          color="from-blue-500 to-cyan-500"
          exportLabel={t.exportChart}
          onExport={() => exportSingleDistribution(t.ageDistribution, ageDist, allCases.length, 'age_distribution')}
        >
          {ageDist.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={toChartData(ageDist)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {toChartData(ageDist).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : noData}
        </ChartCard>

        <ChartCard
          title={t.categoryDistribution}
          color="from-purple-500 to-pink-500"
          exportLabel={t.exportChart}
          onExport={() => exportSingleDistribution(t.categoryDistribution, catDist, allCases.length, 'category_distribution')}
        >
          {catDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={toChartData(catDist)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {toChartData(catDist).map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : noData}
        </ChartCard>

        <ChartCard
          title={t.violenceDistribution}
          color="from-red-500 to-orange-500"
          exportLabel={t.exportChart}
          onExport={() => exportSingleDistribution(t.violenceDistribution, violDist, allCases.length, 'violence_distribution')}
        >
          {violDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={toChartData(violDist)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {toChartData(violDist).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : noData}
        </ChartCard>

        <ChartCard
          title={t.educationDistribution}
          color="from-emerald-500 to-teal-500"
          exportLabel={t.exportChart}
          onExport={() => exportSingleDistribution(t.educationDistribution, eduDist, allCases.length, 'education_distribution')}
        >
          {eduDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={toChartData(eduDist)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {toChartData(eduDist).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : noData}
        </ChartCard>

      </div>

      {/* Master report */}
      <div className="glass rounded-2xl p-4 md:p-6 card-hover">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileDown className="w-5 h-5" />
          {t.exportReports}
        </h3>
        <button
          onClick={() => exportMasterReport(ageDist, catDist, violDist, eduDist, allCases.length)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <BookOpen className="w-5 h-5" />
          📋 {t.masterReport}
        </button>
      </div>

    </div>
  );
}
