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

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          בלחיצה על כניסה/הרשמה, אתה מסכים לתנאי השימוש ולמדיניות הפרטיות
        </p>
      </div>
    </Modal>
  );
}
