import { useEffect, useState } from 'react';
import { X, Play, Download, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    if (isOpen) {
      loadRecordings();
    }
  }, [isOpen]);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recordings/list');
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

    const audio = new Audio(`/api/recordings/${recording.id}/audio`);
    audio.onended = () => setPlayingId(null);
    audio.play();
    setAudioElement(audio);
    setPlayingId(recording.id);
  };

  const handleDownload = async (recording: Recording) => {
    try {
      const response = await fetch(`/api/recordings/${recording.id}/audio`);
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

  const handleDelete = async (recording: Recording) => {
    if (!confirm('למחוק את ההקלטה?')) return;

    try {
      const response = await fetch(`/api/recordings/${recording.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecordings(recordings.filter(r => r.id !== recording.id));
        toast.success('ההקלטה נמחקה');
        if (playingId === recording.id) {
          audioElement?.pause();
          setPlayingId(null);
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ההקלטות שלי</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">עדיין אין הקלטות</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <button
                    onClick={() => handlePlay(recording)}
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      playingId === recording.id
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-gray-800 dark:bg-gray-700 text-white hover:scale-105'
                    }`}
                  >
                    <Play className="w-5 h-5" />
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
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="הורדה"
                    >
                      <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(recording)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="מחיקה"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
