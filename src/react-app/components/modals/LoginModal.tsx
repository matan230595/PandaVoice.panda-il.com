import { useAuth } from '@/react-app/hooks/useAuth';
import Modal from './Modal';
import { LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
}

export default function LoginModal({ isOpen }: LoginModalProps) {
  const { redirectToLogin, isPending } = useAuth();

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="התחברות">
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ברוכים הבאים לסדנת הדיבור
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            התחבר כדי לשמור את ההקלטות שלך
          </p>
        </div>

        <button
          onClick={redirectToLogin}
          disabled={isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>התחבר עם Google</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          בלחיצה על התחבר, אתה מסכים לתנאי השימוש ולמדיניות הפרטיות
        </p>
      </div>
    </Modal>
  );
}
