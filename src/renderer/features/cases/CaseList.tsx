import { useState, useEffect } from 'react';
import { Input } from '@/components/Input';
import { db } from '@/services/database';
import type { Case } from '@/types';
import { Search, Users, Calendar, AlertTriangle, Trash2, Edit, FileText } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { EditCaseModal } from './EditCaseModal';
import { RapportModal } from './RapportModal';

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [rapportCase, setRapportCase] = useState<Case | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    const allCases = await db.getAllCases();
    setCases(allCases);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await db.searchCases(query);
      setCases(results);
    } else {
      loadCases();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('حذف هذه الحالة؟ / Delete this case?')) {
      await db.deleteCase(id);
      loadCases();
    }
  };

  const handleEdit = (caseData: Case) => {
    setEditingCase(caseData);
  };

  const handleRapport = (caseData: Case) => {
    setRapportCase(caseData);
  };

  const handleUpdate = async (updatedCase: Case) => {
    // Update name field from firstName + lastName
    const fullName = `${updatedCase.firstName} ${updatedCase.lastName}`;
    await db.updateCase(updatedCase.id, { ...updatedCase, name: fullName });
    setEditingCase(null);
    loadCases();
  };

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

  const getProblemIcon = (type: string) => {
    const icons: Record<string, string> = {
      violence: '⚠️',
      addiction: '🚬',
      neglect: '🚫',
      exploitation: '⛔',
      family_issues: '👨👩👧',
      other: '📋'
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="glass rounded-2xl p-6 card-hover">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t.casesList}</h2>
        </div>
        
        <Input
          icon={<Search className="w-5 h-5" />}
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {cases.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-xl text-slate-600">{t.noCasesFound}</p>
          <p className="text-slate-500 mt-2">{t.startAddingCases}</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden card-hover">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.name}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.gender}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.age}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.problem}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.date}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition-colors duration-200" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        c.gender === 'male' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
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
                        <button
                          onClick={() => handleRapport(c)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="تقرير / Rapport"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل / Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف / Delete"
                        >
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
      )}
      
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <span className="text-slate-600 font-medium">📊 {t.total}: <span className="text-blue-600 font-bold text-lg">{cases.length}</span> {t.cases}</span>
      </div>

      {editingCase && (
        <EditCaseModal
          caseData={editingCase}
          onClose={() => setEditingCase(null)}
          onSave={handleUpdate}
        />
      )}

      {rapportCase && (
        <RapportModal
          caseData={rapportCase}
          onClose={() => setRapportCase(null)}
        />
      )}
    </div>
  );
}
