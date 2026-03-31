import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { translations } from '@/i18n/translations';
import type { Language } from '@/i18n/translations';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('[CAPE] Uncaught error:', error, errorInfo);
  }

  private getT() {
    const lang = (localStorage.getItem('cape_language') as Language) || 'fr';
    return translations[lang];
  }

  render() {
    if (this.state.hasError) {
      const t = this.getT();
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass rounded-2xl p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.errorTitle}</h2>
            <p className="text-slate-600 mb-4 text-sm font-mono bg-slate-100 rounded-lg p-3">
              {this.state.error?.message || '—'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {t.errorReload}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
