import { useState, createContext, useContext, useCallback, useRef, ReactNode } from 'react';
import { CaseFormArabic } from '@/features/cases/CaseFormArabic';
import { CaseList } from '@/features/cases/CaseList';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { Calendar } from '@/features/calendar/Calendar';
import { Settings } from '@/features/settings/Settings';
import {
  LayoutDashboard, FileText, List, Shield,
  CalendarDays, Settings as SettingsIcon,
  CheckCircle, AlertCircle, Info, X,
} from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import type { Language } from './i18n/translations';
import { AnimatedBackground } from './components/AnimatedBackground';

// ─── Toast system ────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, type, message }]);

    // Start exit animation after 2.7s, remove after 3s
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    }, 2700);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 shrink-0" />,
    error:   <AlertCircle className="w-5 h-5 shrink-0" />,
    info:    <Info className="w-5 h-5 shrink-0" />,
  };

  const colors: Record<ToastType, string> = {
    success: 'bg-gradient-to-r from-emerald-500 to-green-600',
    error:   'bg-gradient-to-r from-red-500 to-rose-600',
    info:    'bg-gradient-to-r from-blue-500 to-indigo-600',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — bottom-right on desktop, bottom-center on mobile */}
      <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-2xl
              pointer-events-auto max-w-xs
              ${colors[toast.type]}
              ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}
            `}
          >
            {icons[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

type View = 'dashboard' | 'new-case' | 'cases' | 'calendar' | 'settings';

function AppInner() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { language, setLanguage, t, isRTL } = useLanguage();

  const navItems = [
    { id: 'dashboard' as View, label: t.dashboard,              icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-600'   },
    { id: 'new-case'  as View, label: t.newCase,                icon: FileText,        gradient: 'from-emerald-500 to-green-600' },
    { id: 'cases'     as View, label: t.casesList,              icon: List,            gradient: 'from-purple-500 to-pink-600'   },
    { id: 'calendar'  as View, label: t.calendar,               icon: CalendarDays,    gradient: 'from-orange-500 to-red-600'    },
    { id: 'settings'  as View, label: t.settings || 'Settings', icon: SettingsIcon,    gradient: 'from-slate-500 to-gray-600'    },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', flag: 'ع'  },
    { code: 'fr', label: 'Français', flag: 'Fr' },
    { code: 'en', label: 'English',  flag: 'En' },
  ];

  const currentLabel = navItems.find(i => i.id === currentView)?.label ?? '';

  return (
    <div className="app-root" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatedBackground />

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.appName}
            </h1>
            <p className="text-xs text-slate-500">{t.appSubtitle}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`sidebar-btn ${active ? `bg-gradient-to-r ${item.gradient} text-white shadow-md` : 'text-slate-600 hover:bg-white/60'}`}
              >
                <div className={`p-1.5 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="text-center mb-3 pt-1 border-t border-white/10">
            <p className="text-xs text-slate-500">Made by</p>
            <p className="text-xs font-bold text-slate-700">Mohammed seffar</p>
          </div>
          <div className="flex gap-1 mb-2">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === lang.code
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow'
                    : 'bg-white/50 text-slate-600 hover:bg-white/80'
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center">{t.localData}</p>
        </div>
      </aside>

      {/* ── MAIN COLUMN ── */}
      <div className="main-col">

        {/* Mobile top bar */}
        <header className="mobile-topbar">
          <div className="flex items-center gap-2">
            <div className="logo-icon-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CAPE
            </span>
            <span className="text-slate-400 text-sm">· {currentLabel}</span>
          </div>
          <div className="flex gap-1">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  language === lang.code
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow'
                    : 'bg-white/70 text-slate-600'
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>
        </header>

        {/* Desktop page title */}
        <div className="desktop-title">
          <h2 className="text-3xl font-black text-slate-800">{currentLabel}</h2>
          <p className="text-slate-500 text-sm mt-1">{t.professionalManagement}</p>
        </div>

        {/* Page content */}
        <main className="page-content">
          <div className="animate-slide-up">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'new-case'  && <CaseFormArabic onSuccess={() => setCurrentView('cases')} />}
            {currentView === 'cases'     && <CaseList />}
            {currentView === 'calendar'  && <Calendar />}
            {currentView === 'settings'  && <Settings />}
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="bottom-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className="bottom-nav-btn">
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? `bg-gradient-to-br ${item.gradient} shadow-md` : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[9px] font-semibold leading-tight truncate w-full text-center ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
