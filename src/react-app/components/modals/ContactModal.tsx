import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import Modal from './Modal';
import { useAppStore } from '@/react-app/store/useAppStore';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { config } = useAppStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="צור קשר" size="md">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{config.emoji}</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{config.brand}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">נשמח לעמוד לשירותכם</p>
        </div>

        <a
          href={`tel:${config.phone.replace(/[^0-9+]/g, '')}`}
          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
            <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
          </div>
          <div className="flex-1 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">טלפון</div>
            <div className="font-bold text-gray-900 dark:text-gray-100">{config.phone}</div>
          </div>
        </a>

        <a
          href={`mailto:${config.email}`}
          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
            <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
          </div>
          <div className="flex-1 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">אימייל</div>
            <div className="font-bold text-gray-900 dark:text-gray-100">{config.email}</div>
          </div>
        </a>

        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">כתובת</div>
            <div className="font-bold text-gray-900 dark:text-gray-100">{config.address}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">או שלחו הודעה ישירות:</p>
          <div className="flex gap-2">
            <a
              href={config.wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#1da851] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              וואטסאפ
            </a>
            <a
              href={config.tg}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-[#0088cc] text-white rounded-xl font-bold hover:bg-[#0077b5] transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              טלגרם
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
