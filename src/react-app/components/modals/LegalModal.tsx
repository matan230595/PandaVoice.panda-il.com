import Modal from './Modal';
import { useAppStore } from '@/react-app/store/useAppStore';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'access' | 'terms' | 'privacy';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const { config } = useAppStore();

  const titles = {
    access: 'הצהרת נגישות',
    terms: 'תנאי שימוש',
    privacy: 'מדיניות פרטיות'
  };

  const content = {
    access: config.legalAccess,
    terms: config.legalTerms,
    privacy: config.legalPrivacy
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[type]} size="lg">
      <div 
        className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
        dangerouslySetInnerHTML={{ __html: content[type] }}
      />
    </Modal>
  );
}
