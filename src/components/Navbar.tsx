import React from 'react';
import { Calendar, Users, MessageSquare, LineChart, Settings, Calculator, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'schedule' | 'students' | 'progress' | 'settings';
  setActiveTab: (tab: 'schedule' | 'students' | 'progress' | 'settings') => void;
  unpaidCount: number;
  todayLessonsCount: number;
  onRefresh?: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unpaidCount,
  todayLessonsCount,
  onRefresh,
  isSaving,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#161129]/90 backdrop-blur border-b border-purple-900/40 text-purple-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-600/30 text-white font-bold border border-purple-400/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white">
                Математичний Помічник
              </h1>
              <p className="text-xs text-purple-300 font-medium hidden sm:block">
                Особистий кабінет репетитора
              </p>
            </div>
          </div>

          {/* Cloud Sync Status & Quick Refresh */}
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center gap-1.5 animate-pulse font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Збереження...
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Синхронізовано
              </span>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/40 transition"
                title="Оновити дані"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-purple-900/30">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                : 'text-purple-300/80 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Розклад
            {todayLessonsCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'schedule' ? 'bg-purple-800 text-white' : 'bg-purple-900/80 text-purple-200'
              }`}>
                {todayLessonsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                : 'text-purple-300/80 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            Учні та Оплата
            {unpaidCount > 0 && (
              <span className="ml-1 bg-amber-950/80 text-amber-300 border border-amber-700/50 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {unpaidCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition whitespace-nowrap ${
              activeTab === 'progress'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                : 'text-purple-300/80 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <LineChart className="w-4 h-4" />
            Прогрес та Нотатки
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                : 'text-purple-300/80 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            Налаштування & Google Sheets
          </button>
        </nav>
      </div>
    </header>
  );
};
