import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import Modal from './Modal';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
}

type Tab = 'login' | 'register';

export default function LoginModal({ isOpen }: LoginModalProps) {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    }
  }, [isOpen, tab]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בלתי צפויה');
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="ברוכים הבאים לסדנת הדיבור">
      <div className="space-y-5 py-2" dir="rtl">

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            aria-controls="login-panel"
            onClick={() => switchTab('login')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2
              ${tab === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <LogIn className="w-4 h-4" />
            כניסה
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            aria-controls="register-panel"
            onClick={() => switchTab('register')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2
              ${tab === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <UserPlus className="w-4 h-4" />
            הרשמה
          </button>
        </div>

        {/* Form */}
        <form
          id={tab === 'login' ? 'login-panel' : 'register-panel'}
          role="tabpanel"
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label={tab === 'login' ? 'טופס כניסה' : 'טופס הרשמה'}
          noValidate
        >
          {tab === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                שם מלא
              </label>
              <input
                id="auth-name"
                ref={tab === 'register' ? firstFocusRef : undefined}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ישראל ישראלי"
                autoComplete="name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              אימייל
            </label>
            <input
              id="auth-email"
              ref={tab === 'login' ? firstFocusRef : undefined}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              aria-required="true"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              סיסמה
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'לפחות 8 תווים' : '••••••••'}
              required
              minLength={tab === 'register' ? 8 : undefined}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              aria-required="true"
              aria-describedby={tab === 'register' ? 'password-hint' : undefined}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {tab === 'register' && (
              <p id="password-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                לפחות 8 תווים
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700
                text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
              text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true" />
            ) : (
              <>
                {tab === 'login' ? <LogIn className="w-5 h-5" aria-hidden="true" /> : <UserPlus className="w-5 h-5" aria-hidden="true" />}
                <span>{tab === 'login' ? 'כניסה' : 'הרשמה'}</span>
              </>
            )}
          </button>
        </form>

        {/* Google OAuth */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          <span className="text-xs text-gray-400">או</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 w-full border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-medium transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.1l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.4C9.7 35.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.6l6.2 5.2C42.3 35.5 44 30.1 44 24c0-1.3-.1-2.7-.4-3.9z"/>
          </svg>
          המשך עם Google
        </a>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          בלחיצה על כניסה/הרשמה, אתה מסכים לתנאי השימוש ולמדיניות הפרטיות
        </p>
      </div>
    </Modal>
  );
}
