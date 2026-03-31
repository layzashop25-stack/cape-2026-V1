import { useState } from 'react';
import { X, Plus, Trash2, Download } from 'lucide-react';
import type { Case } from '@/types';
import { generateCaseRapport, buildDefaultOverrides, type RapportOverrides } from '@/services/rapportExport';
import { useLanguage } from '@/i18n/LanguageContext';

interface Props {
  caseData: Case;
  onClose: () => void;
}

function BulletList({ label, items, onChange, addLabel }: {
  label: string; items: string[];
  onChange: (items: string[]) => void; addLabel: string;
}) {
  const update = (idx: number, val: string) => {
    const next = [...items]; next[idx] = val; onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, '']);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
          {label}
        </span>
        <button
          onClick={add}
          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" /> {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">•</span>
            <input
              dir="rtl"
              value={item}
              onChange={e => update(idx, e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
            />
            <button
              onClick={() => remove(idx)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RapportModal({ caseData, onClose }: Props) {
  const { t } = useLanguage();
  const [overrides, setOverrides] = useState<RapportOverrides>(() => buildDefaultOverrides(caseData));
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof RapportOverrides>(key: K, val: RapportOverrides[K]) =>
    setOverrides(prev => ({ ...prev, [key]: val }));

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generateCaseRapport(caseData, overrides);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const childName = `${caseData.firstName} ${caseData.lastName}`.trim() || caseData.name;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="glass w-full md:max-w-3xl md:rounded-2xl rounded-t-2xl overflow-y-auto shadow-2xl flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 64px)', marginBottom: 0 }}
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-white/20 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{t.rapportTitle}</h3>
              <p className="text-xs text-slate-500">{childName} — {caseData.fileNumber || caseData.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Intervention table */}
          <div className="glass rounded-xl p-5 border border-emerald-100">
            <h4 className="text-base font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
              📋 {t.rapportInterventionTable}
            </h4>
            <BulletList label={t.rapportInterventions}  items={overrides.interventionItems}  onChange={v => setField('interventionItems', v)}  addLabel={t.rapportAdd} />
            <BulletList label={t.rapportResults}        items={overrides.resultsItems}        onChange={v => setField('resultsItems', v)}        addLabel={t.rapportAdd} />
            <BulletList label={t.rapportFutureSteps}    items={overrides.futureStepsItems}    onChange={v => setField('futureStepsItems', v)}    addLabel={t.rapportAdd} />
            <BulletList label={t.rapportStakeholders}   items={overrides.stakeholdersItems}   onChange={v => setField('stakeholdersItems', v)}   addLabel={t.rapportAdd} />
          </div>

          {/* Free text sections */}
          <div className="glass rounded-xl p-5 border border-blue-100">
            <h4 className="text-base font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
              📝 {t.rapportPage2}
            </h4>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-600 mb-2">{t.rapportSummary}</label>
              <textarea
                dir="rtl" rows={6} value={overrides.summaryText}
                onChange={e => setField('summaryText', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all resize-y leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">{t.rapportCaseInfo}</label>
              <textarea
                dir="rtl" rows={6} value={overrides.caseInfoText}
                onChange={e => setField('caseInfoText', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all resize-y leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass border-t border-white/20 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Download className="w-5 h-5" />}
            {loading ? t.rapportDownloading : t.rapportDownload}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/60 text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-white/90 transition-all"
          >
            {t.rapportCancel}
          </button>
        </div>
      </div>
    </div>
  );
}
