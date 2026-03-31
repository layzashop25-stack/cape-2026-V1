import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/Input';
import { db } from '@/services/database';
import type { Case } from '@/types';
import { Search, Users, Calendar, AlertTriangle, Trash2, Edit, FileText, Filter } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { EditCaseModal } from './EditCaseModal';
import { RapportModal } from './RapportModal';

type SortKey = 'date' | 'name' | 'age';

export function CaseList() {
  const [allCases, setAllCases]       = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterType, setFilterType]   = useState<string>('all');
  const [sortKey, setSortKey]         = useState<SortKey>('date');
  const [loading, setLoading]         = useState(true);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [rapportCase, setRapportCase] = useState<Case | null>(null);
  const { t, isRTL } = useLanguage();

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    setLoading(true);
    const cases = await db.getAllCases();
    setAllCases(cases);
    setLoading(false);
  };

  // Multi-field search + filters + sort — all in memory, no extra DB calls
  const filteredCases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = allCases.filter(c => {
      if (q) {
        const match = [
          c.name, c.firstName, c.lastName, c.fileNumber, c.phone,
          c.motherFirstName, c.motherLastName, c.motherPhone,
          c.fatherFirstName, c.fatherLastName, c.fatherPhone,
          c.notes, c.birthPlace, c.institution,
          c.abuserFirstName, c.abuserLastName,
        ].filter(Boolean).some(f => f!.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (filterGender !== 'all' && c.gender !== filterGender) return false;
      if (filterType !== 'all' && c.problemType !== filterType) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortKey === 'date') return b.date.localeCompare(a.date);
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'age')  return b.age - a.age;
      return 0;
    });

    return result;
  }, [allCases, searchQuery, filterGender, filterType, sortKey]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    await db.deleteCase(id);
    setAllCases(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdate = async (updatedCase: Case) => {
    const fullName = `${updatedCase.firstName} ${updatedCase.lastName}`.trim();
    await db.updateCase(updatedCase.id, { ...updatedCase, name: fullName });
    setEditingCase(null);
    loadCases();
  };

  const getCaseTypeLabel = (type: string) => ({
    violence: t.caseTypeViolence,
    addiction: t.caseTypeAddiction,
    neglect: t.caseTypeNeglect,
    exploitation: t.caseTypeExploitation,
    family_issues: t.caseTypeFamilyIssues,
    other: t.caseTypeOther,
  }[type] || type);

  const getProblemIcon = (type: string) => ({
    violence: '⚠️', addiction: '🚬', neglect: '🚫',
    exploitation: '⛔', family_issues: '👨‍👩‍👧', other: '📋',
  }[type] || '📋');

  const caseTypeOptions = [
    { value: 'all', label: t.filterAll },
    { value: 'violence', label: t.caseTypeViolence },
    { value: 'addiction', label: t.caseTypeAddiction },
    { value: 'neglect', label: t.caseTypeNeglect },
    { value: 'exploitation', label: t.caseTypeExploitation },
    { value: 'family_issues', label: t.caseTypeFamilyIssues },
    { value: 'other', label: t.caseTypeOther },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Search + Filters */}
      <div className="glass rounded-2xl p-6 card-hover space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t.casesList}
          </h2>
        </div>

        <Input
          icon={<Search className="w-5 h-5" />}
          placeholder={t.searchPlaceholderFull}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Gender filter */}
          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value as any)}
            className="px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">{t.filterGender}: {t.filterAll}</option>
            <option value="male">{t.boy}</option>
            <option value="female">{t.girl}</option>
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {caseTypeOptions.map(o => (
              <option key={o.value} value={o.value}>
                {o.value === 'all' ? `${t.filterType}: ${t.filterAll}` : o.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="date">{t.sortBy}: {t.sortDate}</option>
            <option value="name">{t.sortBy}: {t.sortName}</option>
            <option value="age">{t.sortBy}: {t.sortAge}</option>
          </select>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-xl text-slate-600">{t.noCasesFound}</p>
          <p className="text-slate-500 mt-2">{t.startAddingCases}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass rounded-2xl overflow-hidden card-hover">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    {[t.name, t.gender, t.age, t.problem, t.date, t.actions].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-blue-50/50 transition-colors duration-200" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                            {(c.firstName || c.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{c.name}</span>
                            {c.fileNumber && <span className="text-xs text-slate-400">#{c.fileNumber}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                          {c.gender === 'male' ? t.boy : t.girl}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">{c.age} {t.years}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                          {getProblemIcon(c.problemType)} {getCaseTypeLabel(c.problemType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(c.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button onClick={() => setRapportCase(c)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title={t.rapportTitle}>
                            <FileText className="w-5 h-5" />
                          </button>
                          <button onClick={() => setEditingCase(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t.editCase}>
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t.confirmDelete}>
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredCases.map(c => (
              <div key={c.id} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {(c.firstName || c.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setRapportCase(c)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileText className="w-5 h-5" /></button>
                    <button onClick={() => setEditingCase(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {c.gender === 'male' ? t.boy : t.girl}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {c.age} {t.years}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {getProblemIcon(c.problemType)} {getCaseTypeLabel(c.problemType)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <span className="text-slate-600 font-medium">
          📊 {t.total}: <span className="text-blue-600 font-bold text-lg">{filteredCases.length}</span> {t.cases}
          {filteredCases.length !== allCases.length && (
            <span className="text-slate-400 text-sm ms-2">/ {allCases.length}</span>
          )}
        </span>
      </div>

      {editingCase && (
        <EditCaseModal caseData={editingCase} onClose={() => setEditingCase(null)} onSave={handleUpdate} />
      )}
      {rapportCase && (
        <RapportModal caseData={rapportCase} onClose={() => setRapportCase(null)} />
      )}
    </div>
  );
}
