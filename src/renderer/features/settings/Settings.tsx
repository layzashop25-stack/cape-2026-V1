import { Button } from '@/components/Button';
import { db } from '@/services/database';
import { Download, Upload, Database } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/App';

export function Settings() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleExport = async () => {
    try {
      const data = await db.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cape-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t.toastExportSuccess, 'success');
    } catch {
      showToast(t.toastError, 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        await db.importData(text);
        showToast(t.toastImportSuccess, 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showToast(t.toastError, 'error');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 animate-slide-up">

      <div className="glass rounded-2xl p-4 md:p-8 card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t.dataManagement || 'Data Management'}
            </h2>
            <p className="text-slate-600 text-sm">{t.backupRestore || 'Backup and restore your data'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export */}
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-400 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{t.exportData || 'Export Data'}</h3>
            </div>
            <p className="text-slate-600 mb-4">
              {t.exportDescription || 'Download all your cases and calendar events as a JSON file to your computer.'}
            </p>
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              {t.exportButton || 'Export to File'}
            </Button>
          </div>

          {/* Import */}
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-400 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{t.importData || 'Import Data'}</h3>
            </div>
            <p className="text-slate-600 mb-4">
              {t.importDescription || 'Restore your data from a previously exported JSON file.'}
            </p>
            <Button onClick={handleImport} variant="success" className="w-full" size="lg">
              <Upload className="w-5 h-5 mr-2" />
              {t.importButton || 'Import from File'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
