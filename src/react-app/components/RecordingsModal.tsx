import { useEffect, useState } from 'react';
import { X, Play, Download, Trash2, Clock, Pause } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from './modals/ConfirmModal';

interface Recording {
  id: number;
  title: string;
  audio_key: string;
  duration_seconds?: number;
  file_size_bytes: number;
  created_at: string;
}

interface RecordingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordingsModal({ isOpen, onClose }: RecordingsModalProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recording | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRecordings();
    } else if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
      setPlayingId(null);
    }
  }, [isOpen]);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recordings/list', { credentials: 'include' });
      if (!response.ok) {
        toast.error('שגיאה בטעינת ההקלטות');
        return;
      }
      const data = await response.json();
      setRecordings(data.recordings || []);
    } catch {
      toast.error('שגיאה בטעינת ההקלטות');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (recording: Recording) => {
    if (playingId === recording.id) {
      audioElement?.pause();
      setPlayingId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    try {
      const response = await fetch(`/api/recordings/${recording.id}/audio`, { credentials: 'include' });
      if (!response.ok) { toast.error('שגיאה בטעינת האודיו'); return; }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      audio.play();
      setAudioElement(audio);
      setPlayingId(recording.id);
    } catch {
      toast.error('שגיאה בניגון ההקלטה');
    }
  };

  const handleDownload = async (recording: Recording) => {
    try {
      const response = await fetch(`/api/recordings/${recording.id}/audio`, { credentials: 'include' });
      if (!response.ok) { toast.error('שגיאה בהורדת ההקלטה'); return; }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.title}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('ההקלטה הורדה בהצלחה');
    } catch {
      toast.error('שגיאה בהורדת ההקלטה');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const recording = deleteTarget;
    setDeleteTarget(null);

    try {
      const response = await fetch(`/api/recordings/${recording.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setRecordings(prev => prev.filter(r => r.id !== recording.id));
        toast.success('ההקלטה נמחקה');
        if (playingId === recording.id) {
          audioElement?.pause();
          setPlayingId(null);
        }
      } else {
        toast.error('שגיאה במחיקת ההקלטה');
      }
    } catch {
      toast.error('שגיאה במחיקת ההקלטה');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-label="ההקלטות שלי"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ההקלטות שלי</h2>
            <button
              onClick={onClose}
              aria-label="סגור"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" aria-label="טוען..." />
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
                <p className="text-gray-500 dark:text-gray-400">עדיין אין הקלטות</p>
              </div>
            ) : (
              <ul className="space-y-3" aria-label="רשימת הקלטות">
                {recordings.map((recording) => (
                  <li
                    key={recording.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <button
                      onClick={() => handlePlay(recording)}
                      aria-label={playingId === recording.id ? `עצור ${recording.title}` : `נגן ${recording.title}`}
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        playingId === recording.id
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-gray-800 dark:bg-gray-700 text-white hover:scale-105'
                      }`}
                    >
                      {playingId === recording.id
                        ? <Pause className="w-5 h-5" aria-hidden="true" />
                        : <Play className="w-5 h-5" aria-hidden="true" />
                      }
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {recording.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(recording.created_at)} · {formatFileSize(recording.file_size_bytes)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(recording)}
                        aria-label={`הורד ${recording.title}`}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(recording)}
                        aria-label={`מחק ${recording.title}`}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="מחיקת הקלטה"
        message={`האם למחוק את "${deleteTarget?.title}"? לא ניתן לשחזר לאחר המחיקה.`}
      />
    </>
  );
}
