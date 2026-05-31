import { Sparkles, Globe, Volume2 } from 'lucide-react';
import { useAppStore } from '@/react-app/store/useAppStore';

interface ToolbarProps {
  onAIClick: () => void;
  onTranslateClick: () => void;
  onTTSClick: () => void;
}

export default function Toolbar({ onAIClick, onTranslateClick, onTTSClick }: ToolbarProps) {
  const { config, isSpeaking } = useAppStore();

  if (!config.showAI && !config.showTrans && !config.showTTS) {
    return null;
  }

  return (
    <div className="p-3 flex gap-2 bg-gray-50 dark:bg-gray-900 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
      {config.showAI && (
        <button
          onClick={onAIClick}
          className="flex-1 min-w-[100px] px-3 py-2 rounded-xl border border-emerald-500 bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>{config.txtAI}</span>
        </button>
      )}
      
      {config.showTrans && (
        <button
          onClick={onTranslateClick}
          className="flex-1 min-w-[100px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
        >
          <Globe className="w-4 h-4" />
          <span>{config.txtTrans}</span>
        </button>
      )}
      
      {config.showTTS && (
        <button
          onClick={onTTSClick}
          className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isSpeaking
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isSpeaking ? 'עצור' : config.txtTTS}</span>
        </button>
      )}
    </div>
  );
}
