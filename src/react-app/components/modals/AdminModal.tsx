import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import Modal from './Modal';
import { useAppStore } from '@/react-app/store/useAppStore';
import toast from 'react-hot-toast';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{7,15}$/;

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { user } = useAuth();
  const { config, setConfig, resetConfig } = useAppStore();
  const [localConfig, setLocalConfig] = useState(config);

  const isAdmin = user != null && (user.email === config.email);

  const handleSave = () => {
    if (localConfig.email && !EMAIL_REGEX.test(localConfig.email)) {
      toast.error('כתובת אימייל לא תקינה');
      return;
    }
    if (localConfig.phone && !PHONE_REGEX.test(localConfig.phone)) {
      toast.error('מספר טלפון לא תקין');
      return;
    }
    setConfig(localConfig);
    toast.success('ההגדרות נשמרו');
    onClose();
  };

  const handleReset = () => {
    if (confirm('האם למחוק את כל ההגדרות ולחזור לברירת מחדל?')) {
      resetConfig();
      toast.success('ההגדרות אופסו');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🐼 ניהול מערכת" size="lg">
      {!isAdmin ? (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-500 dark:text-gray-400">
            גישה זו מותרת למנהל המערכת בלבד.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                שם המותג
              </label>
              <input
                type="text"
                value={localConfig.brand}
                onChange={(e) => setLocalConfig({ ...localConfig, brand: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                אימוג'י
              </label>
              <input
                type="text"
                value={localConfig.emoji}
                onChange={(e) => setLocalConfig({ ...localConfig, emoji: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none text-center text-2xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                טלפון
              </label>
              <input
                type="tel"
                value={localConfig.phone}
                onChange={(e) => setLocalConfig({ ...localConfig, phone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                אימייל
              </label>
              <input
                type="email"
                value={localConfig.email}
                onChange={(e) => setLocalConfig({ ...localConfig, email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
              כתובת
            </label>
            <input
              type="text"
              value={localConfig.address}
              onChange={(e) => setLocalConfig({ ...localConfig, address: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
              טקסט מקום שמור
            </label>
            <input
              type="text"
              value={localConfig.placeholder}
              onChange={(e) => setLocalConfig({ ...localConfig, placeholder: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                כפתור AI
              </label>
              <input
                type="text"
                value={localConfig.txtAI}
                onChange={(e) => setLocalConfig({ ...localConfig, txtAI: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                כפתור תרגום
              </label>
              <input
                type="text"
                value={localConfig.txtTrans}
                onChange={(e) => setLocalConfig({ ...localConfig, txtTrans: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                כפתור הקראה
              </label>
              <input
                type="text"
                value={localConfig.txtTTS}
                onChange={(e) => setLocalConfig({ ...localConfig, txtTTS: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
              זכויות יוצרים
            </label>
            <input
              type="text"
              value={localConfig.copyright}
              onChange={(e) => setLocalConfig({ ...localConfig, copyright: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 outline-none"
              dir="rtl"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              שמור שינויים
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              איפוס
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
