import { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, Save, Undo2, Redo2 } from 'lucide-react';
import { useAppStore } from '@/react-app/store/useAppStore';
import toast from 'react-hot-toast';

const HISTORY_SIZE = 50;

export default function Editor() {
  const { config, content, setContent, isRecording, setRecording } = useAppStore();
  const [wordCount, setWordCount] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef(content);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldStopRef = useRef(false);
  const isActiveRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  contentRef.current = content;

  const pushHistory = useCallback((prevContent: string, newContent: string) => {
    setUndoStack((stack) => {
      const updated = [...stack, prevContent];
      return updated.length > HISTORY_SIZE ? updated.slice(-HISTORY_SIZE) : updated;
    });
    setRedoStack([]);
    setContent(newContent);
  }, [setContent]);

  const handleUndo = useCallback(() => {
    const prev = undoStack[undoStack.length - 1];
    if (prev === undefined) return;
    setRedoStack((stack) => [...stack, content]);
    setUndoStack((stack) => stack.slice(0, -1));
    setContent(prev);
  }, [undoStack, content, setContent]);

  const handleRedo = useCallback(() => {
    const next = redoStack[redoStack.length - 1];
    if (next === undefined) return;
    setUndoStack((stack) => [...stack, content]);
    setRedoStack((stack) => stack.slice(0, -1));
    setContent(next);
  }, [redoStack, content, setContent]);

  const playStartSound = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const playStopSound = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'he-IL';

      recognition.onstart = () => {
        isActiveRef.current = true;
        setRecording(true);
        playStartSound();
      };

      recognition.onend = () => {
        if (isActiveRef.current && !shouldStopRef.current) {
          setTimeout(() => {
            try {
              if (isActiveRef.current && !shouldStopRef.current) {
                recognition.start();
              }
            } catch (e) {
              console.error('שגיאה בהפעלה מחדש:', e);
              isActiveRef.current = false;
              setRecording(false);
            }
          }, 100);
        } else {
          isActiveRef.current = false;
          setRecording(false);
          shouldStopRef.current = false;
          playStopSound();
        }
      };

      recognition.onerror = (event) => {
        let message = 'שגיאת מיקרופון';
        if (event.error === 'not-allowed') {
          message = 'הגישה למיקרופון נחסמה. בדוק הרשאות.';
        }
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          message = 'חובה להריץ ב-HTTPS.';
        }
        toast.error(message);
        setRecording(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const currentContent = contentRef.current;
          const newContent = currentContent + (currentContent ? ' ' : '') + finalTranscript;
          setContent(newContent);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        shouldStopRef.current = true;
        isActiveRef.current = false;
        recognitionRef.current.stop();
      }
    };
  }, [setContent, setRecording]);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        const formData = new FormData();
        formData.append('audio', audioBlob, `recording-${Date.now()}.webm`);
        formData.append('title', `הקלטה ${new Date().toLocaleDateString('he-IL')}`);

        try {
          const response = await fetch('/api/recordings/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            toast.success('ההקלטה נשמרה בהצלחה');
          }
        } catch (error) {
          console.error('שגיאה בשמירת הקלטה:', error);
          toast.error('שגיאה בשמירת ההקלטה');
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('שגיאה בגישה למיקרופון:', error);
      toast.error('לא ניתן לגשת למיקרופון');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  const handleRecord = () => {
    if (!recognitionRef.current) {
      toast.error('הדפדפן לא נתמך. נסה Chrome.');
      return;
    }

    if (isRecording) {
      shouldStopRef.current = true;
      isActiveRef.current = false;
      recognitionRef.current.stop();
      stopAudioRecording();
    } else {
      shouldStopRef.current = false;
      isActiveRef.current = true;
      recognitionRef.current.start();
      startAudioRecording();
    }
  };

  useEffect(() => {
    const handleFontSize = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setFontSize((prev) => Math.max(12, Math.min(32, prev + customEvent.detail)));
    };
    window.addEventListener('changeFontSize', handleFontSize);
    return () => window.removeEventListener('changeFontSize', handleFontSize);
  }, []);

  return (
    <main className="flex-1 flex flex-col relative bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <span>{wordCount} מילים</span>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="בטל"
            title="בטל (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="בצע שוב"
            title="בצע שוב (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-emerald-500 font-bold flex items-center gap-1">
          <Save className="w-3 h-3" />
          נשמר בענן
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          pushHistory(content, newContent);
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
          }
        }}
        placeholder={config.placeholder}
        className="flex-1 w-full border-0 p-5 pb-24 outline-none resize-none bg-transparent text-gray-900 dark:text-gray-100 overflow-y-auto"
        style={{
          fontFamily: config.bFont,
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
        }}
        dir="rtl"
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="relative pointer-events-auto">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-60 animate-ping" />
          )}
          <button
            onClick={handleRecord}
            className={`relative w-[72px] h-[72px] rounded-full border-4 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 scale-110 shadow-red-500/50'
                : 'bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:scale-105'
            }`}
            aria-label="מיקרופון"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </main>
  );
}
