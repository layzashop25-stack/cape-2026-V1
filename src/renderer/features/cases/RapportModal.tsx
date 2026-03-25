import { useState } from 'react';
import { X, Plus, Trash2, Download } from 'lucide-react';
import type { Case } from '@/types';
import { generateCaseRapport, buildDefaultOverrides, type RapportOverrides } from '@/services/rapportExport';

interface Props {
  caseData: Case;
  onClose: () => void;
}

// ─── editable bullet list sub-component ─────────────────────────────────────

function BulletList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const update = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
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
          <Plus className="w-3 h-3" /> إضافة
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

// ─── main modal ──────────────────────────────────────────────────────────────

export function RapportModal({ caseData, onClose }: Props) {
  const [overrides, setOverrides] = useState<RapportOverrides>(() =>
    buildDefaultOverrides(caseData)
  );
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
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
              <h3 className="text-lg font-bold text-slate-800">تقرير الحالة</h3>
              <p className="text-xs text-slate-500">{childName} — {caseData.fileNumber || caseData.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Section 1 — Intervention table fields */}
          <div className="glass rounded-xl p-5 border border-emerald-100">
            <h4 className="text-base font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
              📋 جدول التدخلات
            </h4>

            <BulletList
              label="نوعية التدخل"
              items={overrides.interventionItems}
              onChange={v => setField('interventionItems', v)}
            />
            <BulletList
              label="النتائج المحققة"
              items={overrides.resultsItems}
              onChange={v => setField('resultsItems', v)}
            />
            <BulletList
              label="الخطوات المستقبلية"
              items={overrides.futureStepsItems}
              onChange={v => setField('futureStepsItems', v)}
            />
            <BulletList
              label="المتدخلون في الحالة"
              items={overrides.stakeholdersItems}
              onChange={v => setField('stakeholdersItems', v)}
            />
          </div>

          {/* Section 2 — Free text sections */}
          <div className="glass rounded-xl p-5 border border-blue-100">
            <h4 className="text-base font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
              📝 نصوص الصفحة الثانية
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-600 mb-2">
                ملخص حول وضعية الحالة
              </label>
              <textarea
                dir="rtl"
                rows={6}
                value={overrides.summaryText}
                onChange={e => setField('summaryText', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all resize-y leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">
                معلومات عن الحالة
              </label>
              <textarea
                dir="rtl"
                rows={6}
                value={overrides.caseInfoText}
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
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {loading ? 'جاري التحميل...' : 'تحميل التقرير'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/60 text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-white/90 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
