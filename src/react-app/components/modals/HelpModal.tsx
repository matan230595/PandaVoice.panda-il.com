import { useState } from 'react';
import { Book, Mic, Sparkles, Languages, Volume2, Settings } from 'lucide-react';
import Modal from './Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState('start');

  const tabs = [
    { id: 'start', label: 'התחלה', icon: Book },
    { id: 'record', label: 'הקלטה', icon: Mic },
    { id: 'ai', label: 'AI', icon: Sparkles },
    { id: 'translate', label: 'תרגום', icon: Languages },
    { id: 'tts', label: 'הקראה', icon: Volume2 },
    { id: 'settings', label: 'הגדרות', icon: Settings }
  ];

  const content = {
    start: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-emerald-500">ברוכים הבאים ל-Pandavoice! 🐼</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Pandavoice היא מערכת מתקדמת להקלטת קול והמרתו לטקסט בעברית, עם תכונות AI חכמות לעיבוד, תרגום והקראת טקסט.
        </p>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-700">
          <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">תכונות עיקריות:</h4>
          <ul className="space-y-2 text-sm text-emerald-600 dark:text-emerald-400">
            <li>🎤 הקלטת קול והמרה לטקסט בזמן אמת</li>
            <li>✨ עיבוד טקסט חכם עם AI (תיקון, שיפור, סיכום)</li>
            <li>🌐 תרגום ל-8 שפות שונות</li>
            <li>🔊 הקראת טקסט בקולות שונים</li>
            <li>💾 שמירה אוטומטית בענן</li>
            <li>📱 שיתוף לווטסאפ וטלגרם</li>
          </ul>
        </div>
      </div>
    ),
    record: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-emerald-500">איך להקליט? 🎤</h3>
        <ol className="space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>לחץ על כפתור המיקרופון הגדול בתחתית המסך</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>אשר גישה למיקרופון בדפדפן (פעם ראשונה)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>דבר בקול ברור ורואה את הטקסט מופיע בזמן אמת</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <span>לחץ שוב לעצירת ההקלטה</span>
          </li>
        </ol>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>טיפ:</strong> המערכת תומכת בהקלטה רצופה - אפשר לדבר כמה שרוצים והטקסט יתווסף אוטומטית.
          </p>
        </div>
      </div>
    ),
    ai: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-emerald-500">עיבוד חכם עם AI ✨</h3>
        <p className="text-gray-700 dark:text-gray-300">
          כפתור ה-AI מאפשר לעבד את הטקסט במגוון דרכים:
        </p>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>📝 <strong>תיקון שגיאות</strong> - מתקן שגיאות כתיב ודקדוק</li>
          <li>✨ <strong>שיפור טקסט</strong> - משפר את הניסוח והסגנון</li>
          <li>📖 <strong>סיכום</strong> - מסכם טקסט ארוך לנקודות עיקריות</li>
          <li>🔄 <strong>פרפרזה</strong> - כותב מחדש באופן שונה</li>
          <li>📧 <strong>המרה למייל</strong> - הופך לפורמט מקצועי</li>
          <li>💡 <strong>הרחבה</strong> - מוסיף פירוט ונקודות נוספות</li>
        </ul>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>חשוב:</strong> יש להגדיר מפתח API בהגדרות לפני השימוש הראשון (Gemini, Groq או OpenAI).
          </p>
        </div>
      </div>
    ),
    translate: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-emerald-500">תרגום לשפות 🌐</h3>
        <p className="text-gray-700 dark:text-gray-300">
          המערכת תומכת בתרגום ל-8 שפות:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {['🇮🇱 עברית', '🇺🇸 אנגלית', '🇸🇦 ערבית', '🇷🇺 רוסית', '🇪🇸 ספרדית', '🇫🇷 צרפתית', '🇩🇪 גרמנית', '🇮🇹 איטלקית'].map(lang => (
            <div key={lang} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-sm text-center">
              {lang}
            </div>
          ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          בחר שפת מקור ושפת יעד, ולחץ "תרגם עכשיו". התרגום יחליף את הטקסט הנוכחי.
        </p>
      </div>
    ),
    tts: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-emerald-500">הקראת טקסט 🔊</h3>
        <p className="text-gray-700 dark:text-gray-300">
          המערכת מקריאה את הטקסט בקול ברור ומותאם אישית:
        </p>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>🎭 <strong>בחירת קול</strong> - עשרות קולות בשפות שונות</li>
          <li>⚡ <strong>מהירות</strong> - שליטה במהירות ההקראה (0.5x-2x)</li>
          <li>🎵 <strong>גובה צליל</strong> - התאמת גובה הקול</li>
          <li>🌍 <strong>סינון שפה</strong> - סינון קולות לפי שפה מועדפת</li>
        </ul>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>טיפ:</strong> ניתן לעצור ולהמשיך את ההקראה בכל רגע.
          </p>
        </div>
      </div>
    ),
    settings: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-emerald-500">הגדרות מערכת ⚙️</h3>
        <p className="text-gray-700 dark:text-gray-300">
          בהגדרות אפשר להגדיר מפתחות API לשירותי ה-AI:
        </p>
        <div className="space-y-3">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">🤖 Google Gemini</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">מהיר, חכם וחינמי - מומלץ להתחלה</p>
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 hover:underline">קבל מפתח חינם →</a>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">⚡ Groq</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">המהיר בעולם - תגובה מיידית</p>
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 hover:underline">קבל מפתח חינם →</a>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">🧠 OpenAI</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">החכם ביותר - איכות מקסימלית</p>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 hover:underline">קבל מפתח →</a>
          </div>
        </div>
      </div>
    )
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="מרכז עזרה" size="lg">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:w-48 flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto max-h-96">
          {content[activeTab as keyof typeof content]}
        </div>
      </div>
    </Modal>
  );
}
