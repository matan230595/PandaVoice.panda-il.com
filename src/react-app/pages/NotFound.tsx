import { useNavigate } from 'react-router';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="text-center p-8">
        <div className="text-7xl mb-4">🐼</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">הדף שחיפשת לא נמצא</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
        >
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );
}
