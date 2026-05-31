import { useState } from 'react';
import { Save, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { useAppStore } from '@/react-app/store/useAppStore';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_KEY_PATTERNS: Record<string, RegExp> = {
  gemini: /^AIza[A-Za-z0-9_-]{35}$/,
  groq: /^gsk_[A-Za-z0-9_-]{40,}$/,
  openai: /^sk-[A-Za-z0-9_-]{30,}$/,
  claude: /^sk-ant-[A-Za-z0-9_-]{30,}$/,
  hf: /^hf_[A-Za-z0-9_-]{20,}$/,
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiKeys, setApiKey } = useAppStore();
  const [localKeys, setLocalKeys] = useState(apiKeys);
  const [testingKey, setTestingKey] = useState<string | null>(null);

  const validateKey = (provider: string, value: string): boolean => {
    if (!value.trim()) return true;
    const pattern = API_KEY_PATTERNS[provider];
    return pattern ? pattern.test(value.trim()) : true;
  };

  const getKeyStatus = (provider: string, value: string): 'empty' | 'valid' | 'invalid' => {
    if (!value.trim()) return 'empty';
    return validateKey(provider, value) ? 'valid' : 'invalid';
  };

  const handleSave = () => {
    Object.entries(localKeys).forEach(([key, value]) => {
      setApiKey(key, value);
    });
    toast.success('ההגדרות נשמרו');
    onClose();
  };

  const handleTestKey = async (provider: string) => {
    const key = localKeys[provider as keyof typeof localKeys];
    if (!key) {
      toast.error('נא להזין מפתח קודם');
      return;
    }
    setTestingKey(provider);
    try {
      let success = false;
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] }),
        });
        success = res.ok;
      } else if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` },
        });
        success = res.ok;
      } else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` },
        });
        success = res.ok;
      }
      if (success) {
        toast.success(`מפתח ${provider} תקין`);
      } else {
        toast.error(`מפתח ${provider} לא תקין`);
      }
    } catch {
      toast.error('שגיאה בבדיקת המפתח');
    } finally {
      setTestingKey(null);
    }
  };

  const renderKeyField = (
    label: string,
    provider: string,
    placeholder: string,
    linkText: string,
    linkUrl: string
  ) => {
    const value = localKeys[provider as keyof typeof localKeys];
    const status = getKeyStatus(provider, value);
    const isTesting = testingKey === provider;

    return (
      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="password"
              value={value}
              onChange={(e) => setLocalKeys({ ...localKeys, [provider]: e.target.value })}
              placeholder={placeholder}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none text-left ${
                status === 'invalid'
                  ? 'border-red-400 dark:border-red-600'
                  : status === 'valid'
                  ? 'border-emerald-400 dark:border-emerald-600'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              dir="ltr"
            />
            {status !== 'empty' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                {status === 'valid' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </span>
            )}
          </div>
          <button
            onClick={() => handleTestKey(provider)}
            disabled={isTesting || !value.trim()}
            className="px-3 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
            title="בדוק מפתח"
          >
            {isTesting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </button>
        </div>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-500 hover:underline mt-1 inline-block"
        >
          {linkText}
        </a>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הגדרות API" size="lg">
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>טיפ:</strong> נדרש מפתח API אחד לפחות לשימוש בתכונות AI ותרגום.
          </p>
        </div>

        {renderKeyField(
          '🤖 Google Gemini API Key',
          'gemini',
          'הזן מפתח Gemini...',
          'קבל מפתח חינם מכאן →',
          'https://makersuite.google.com/app/apikey'
        )}

        {renderKeyField(
          '⚡ Groq API Key',
          'groq',
          'הזן מפתח Groq...',
          'קבל מפתח חינם מכאן →',
          'https://console.groq.com/keys'
        )}

        {renderKeyField(
          '🧠 OpenAI API Key',
          'openai',
          'הזן מפתח OpenAI...',
          'קבל מפתח מכאן →',
          'https://platform.openai.com/api-keys'
        )}

        <details className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <summary className="cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
            🔧 הגדרות מתקדמות (אופציונלי)
          </summary>

          <div className="space-y-4 mt-4">
            {renderKeyField(
              '🤗 Hugging Face API Key',
              'hf',
              'הזן מפתח Hugging Face...',
              '',
              ''
            )}

            {renderKeyField(
              '🔮 Claude API Key',
              'claude',
              'הזן מפתח Claude...',
              '',
              ''
            )}
          </div>
        </details>

        <button
          onClick={handleSave}
          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 mt-6"
        >
          <Save className="w-5 h-5" />
          שמור הגדרות
        </button>
      </div>
    </Modal>
  );
}
