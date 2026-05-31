import { Moon, Sun, HelpCircle, Settings, Headphones, LogOut } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import { useAppStore } from '@/react-app/store/useAppStore';

interface HeaderProps {
  onHelpClick: () => void;
  onSettingsClick: () => void;
  onRecordingsClick: () => void;
  onFontSizeChange: (delta: number) => void;
}

export default function Header({ onHelpClick, onSettingsClick, onRecordingsClick, onFontSizeChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const { config, isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <header className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
      <div className="flex gap-2">
        {user && (
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 flex items-center justify-center hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 transition-colors"
            aria-label="התנתק"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onHelpClick}
          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-colors"
          aria-label="מרכז עזרה"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          onClick={onRecordingsClick}
          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-colors"
          aria-label="ההקלטות שלי"
        >
          <Headphones className="w-5 h-5" />
        </button>
        <button
          onClick={onSettingsClick}
          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-colors"
          aria-label="הגדרות"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2" style={{ fontFamily: config.hFont }}>
        {config.logo ? (
          <img src={config.logo} alt="Logo" className="h-9 w-auto object-contain" />
        ) : (
          <span className="text-3xl">{config.emoji}</span>
        )}
        <span className="text-xl font-bold">
          <span className="text-emerald-500">{config.brand}</span>
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onFontSizeChange(2)}
          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-colors font-bold"
          aria-label="הגדל"
        >
          A+
        </button>
        <button
          onClick={() => onFontSizeChange(-2)}
          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-colors font-bold"
          aria-label="הקטן"
        >
          A-
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-colors"
          aria-label="מצב לילה"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
