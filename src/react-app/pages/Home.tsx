import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useAppStore } from '@/react-app/store/useAppStore';
import Header from '@/react-app/components/Header';
import Toolbar from '@/react-app/components/Toolbar';
import Editor from '@/react-app/components/Editor';
import Footer from '@/react-app/components/Footer';
import ConfirmModal from '@/react-app/components/modals/ConfirmModal';
import LoginModal from '@/react-app/components/modals/LoginModal';

// Heavy modals — loaded on first open
const AIModal = lazy(() => import('@/react-app/components/modals/AIModal'));
const TranslateModal = lazy(() => import('@/react-app/components/modals/TranslateModal'));
const TTSModal = lazy(() => import('@/react-app/components/modals/TTSModal'));
const SettingsModal = lazy(() => import('@/react-app/components/modals/SettingsModal'));
const HelpModal = lazy(() => import('@/react-app/components/modals/HelpModal'));
const LegalModal = lazy(() => import('@/react-app/components/modals/LegalModal'));
const ContactModal = lazy(() => import('@/react-app/components/modals/ContactModal'));
const AdminModal = lazy(() => import('@/react-app/components/modals/AdminModal'));
const RecordingsModal = lazy(() => import('@/react-app/components/RecordingsModal'));

export default function Home() {
  const { user, isPending } = useAuth();
  const { isDarkMode, setContent } = useAppStore();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalType, setLegalType] = useState<'access' | 'terms' | 'privacy'>('access');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFontSizeChange = (delta: number) => {
    window.dispatchEvent(new CustomEvent('changeFontSize', { detail: delta }));
  };

  const handleClear = () => {
    setContent('');
    setShowClearModal(false);
  };

  const handleLegalClick = (type: 'access' | 'terms' | 'privacy') => {
    setLegalType(type);
    setShowLegalModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-0 md:p-4" dir="rtl">
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            borderRadius: '50px',
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '12px 20px'
          },
          success: {
            style: {
              borderBottom: '3px solid #10b981'
            }
          },
          error: {
            style: {
              borderBottom: '3px solid #ef4444'
            }
          }
        }}
      />

      <div className="w-full md:max-w-3xl mx-auto flex-1 flex flex-col bg-white dark:bg-gray-800 md:shadow-2xl border-0 md:border border-gray-200 dark:border-gray-700 md:rounded-3xl overflow-hidden">
        <Header
          onHelpClick={() => setShowHelpModal(true)}
          onSettingsClick={() => setShowSettingsModal(true)}
          onRecordingsClick={() => setShowRecordingsModal(true)}
          onFontSizeChange={handleFontSizeChange}
        />
        <Toolbar
          onAIClick={() => setShowAIModal(true)}
          onTranslateClick={() => setShowTranslateModal(true)}
          onTTSClick={() => setShowTTSModal(true)}
        />
        <Editor />
        <Footer
          onLegalClick={handleLegalClick}
          onContactClick={() => setShowContactModal(true)}
          onAdminClick={() => setShowAdminModal(true)}
          onClearClick={() => setShowClearModal(true)}
        />
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClear}
        title="למחוק הכל?"
        message="פעולה זו תמחק את הטקסט הנוכחי."
      />

      <LoginModal isOpen={!isPending && !user} />

      <Suspense fallback={null}>
        <AIModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
        <TranslateModal isOpen={showTranslateModal} onClose={() => setShowTranslateModal(false)} />
        <TTSModal isOpen={showTTSModal} onClose={() => setShowTTSModal(false)} />
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
        <LegalModal isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} type={legalType} />
        <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
        <RecordingsModal isOpen={showRecordingsModal} onClose={() => setShowRecordingsModal(false)} />
      </Suspense>
    </div>
  );
}
