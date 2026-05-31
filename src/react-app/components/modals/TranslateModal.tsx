import { useState } from 'react';
import { Languages, ArrowLeftRight, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { useAppStore } from '@/react-app/store/useAppStore';
import toast from 'react-hot-toast';

interface TranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'auto', name: 'זיהוי אוטומטי', flag: '🌐' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default function TranslateModal({ isOpen, onClose }: TranslateModalProps) {
  const { content, setContent, apiKeys } = useAppStore();
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!content.trim()) {
      toast.error('אין טקסט לתרגום');
      return;
    }

    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      toast.error('בחר שפות שונות');
      return;
    }

    if (!apiKeys.gemini && !apiKeys.groq) {
      toast.error('נא להגדיר מפתח API בהגדרות');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          sourceLang: sourceLang === 'auto' ? 'auto' : sourceLang,
          targetLang,
          apiKey: apiKeys.gemini || apiKeys.groq,
          provider: apiKeys.gemini ? 'gemini' : 'groq',
        }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setContent(data.translation);
      toast.success('התרגום הושלם');
      onClose();
    } catch {
      toast.error('שגיאה בתרגום. בדוק מפתח API.');
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="תרגום" size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
              משפה:
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
              dir="rtl"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swapLanguages}
            disabled={sourceLang === 'auto'}
            className="mt-7 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="החלף שפות"
          >
            <ArrowLeftRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex-1">
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
              לשפה:
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
              dir="rtl"
            >
              {languages
                .filter((l) => l.code !== 'auto')
                .map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              מתרגם...
            </>
          ) : (
            <>
              <Languages className="w-5 h-5" />
              תרגם עכשיו
            </>
          )}
        </button>

        {!apiKeys.gemini && !apiKeys.groq && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              ⚠️ לא הוגדר מפתח API. עבור להגדרות להגדרת מפתח Gemini או Groq
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
