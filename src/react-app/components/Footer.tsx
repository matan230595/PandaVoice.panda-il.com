import { Copy, Download, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAppStore } from '@/react-app/store/useAppStore';
import toast from 'react-hot-toast';

interface FooterProps {
  onLegalClick: (type: 'access' | 'terms' | 'privacy') => void;
  onContactClick: () => void;
  onAdminClick: () => void;
  onClearClick: () => void;
}

export default function Footer({ onLegalClick, onContactClick, onAdminClick, onClearClick }: FooterProps) {
  const { config, content } = useAppStore();

  const handleCopy = () => {
    if (!content) {
      toast.error('אין טקסט להעתקה');
      return;
    }
    navigator.clipboard.writeText(content);
    toast.success('הטקסט הועתק');
  };

  const handleSave = () => {
    if (!content) {
      toast.error('אין טקסט לשמירה');
      return;
    }
    const words = content.trim().split(/\s+/).slice(0, 2).join('_').replace(/[^a-zA-Z0-9\u0590-\u05FF_]/g, '');
    const date = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
    const filename = `${words}_${date}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('קובץ הורד למכשיר');
  };

  const handleWhatsApp = () => {
    if (!content) {
      toast.error('אין טקסט לשיתוף');
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(content)}`, '_blank');
  };

  const handleTelegram = () => {
    if (!content) {
      toast.error('אין טקסט לשיתוף');
      return;
    }
    window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(content)}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-3 grid grid-cols-5 gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onClearClick}
          className="flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer text-gray-500 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-500 transition-colors"
          aria-label="חדש"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[11px] font-semibold">חדש</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer text-gray-500 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-500 transition-colors"
          aria-label="העתק"
        >
          <Copy className="w-5 h-5" />
          <span className="text-[11px] font-semibold">העתק</span>
        </button>

        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer text-gray-500 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-500 transition-colors"
          aria-label="שמור"
        >
          <Download className="w-5 h-5" />
          <span className="text-[11px] font-semibold">שמור</span>
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer text-gray-500 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#25D366] transition-colors"
          aria-label="וואטסאפ"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[11px] font-semibold">וואטסאפ</span>
        </button>

        <button
          onClick={handleTelegram}
          className="flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer text-gray-500 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#0088cc] transition-colors"
          aria-label="טלגרם"
        >
          <Send className="w-5 h-5" />
          <span className="text-[11px] font-semibold">טלגרם</span>
        </button>
      </div>

      <div className="p-3 flex justify-center gap-4 flex-wrap bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => onLegalClick('access')}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
        >
          הצהרת נגישות
        </button>
        <button
          onClick={() => onLegalClick('terms')}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
        >
          תנאי שימוש
        </button>
        <button
          onClick={() => onLegalClick('privacy')}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
        >
          מדיניות פרטיות
        </button>
        <button
          onClick={onContactClick}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
        >
          📞 צור קשר
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 text-center text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 relative">
        <span>{config.copyright}</span>
        <button
          onClick={onAdminClick}
          className="absolute bottom-1 left-2 opacity-5 hover:opacity-100 cursor-pointer text-base transition-opacity"
          aria-label="כניסת מנהל"
        >
          🐼
        </button>
      </div>
    </div>
  );
}
