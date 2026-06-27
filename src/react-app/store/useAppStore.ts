import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppConfig {
  primary: string;
  brand: string;
  emoji: string;
  logo: string | null;
  phone: string;
  email: string;
  address: string;
  wa: string;
  tg: string;
  txtAI: string;
  txtTrans: string;
  txtTTS: string;
  placeholder: string;
  hFont: string;
  bFont: string;
  showAI: boolean;
  showTrans: boolean;
  showTTS: boolean;
  copyright: string;
  legalAccess: string;
  legalTerms: string;
  legalPrivacy: string;
}

interface AppState {
  config: AppConfig;
  content: string;
  isDarkMode: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  apiKeys: {
    gemini: string;
    groq: string;
    hf: string;
    openai: string;
    claude: string;
  };
  ttsSettings: {
    rate: number;
    pitch: number;
    voice: string;
    langFilter: string;
  };
  seenOnboarding: boolean;
  
  // Actions
  setContent: (content: string) => void;
  setConfig: (config: Partial<AppConfig>) => void;
  toggleDarkMode: () => void;
  setRecording: (recording: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setApiKey: (key: string, value: string) => void;
  setTTSSettings: (settings: Partial<AppState['ttsSettings']>) => void;
  setSeenOnboarding: () => void;
  resetConfig: () => void;
}

const defaultConfig: AppConfig = {
  primary: '#10b981',
  brand: 'Pandavoice',
  emoji: '🐼',
  logo: null,
  phone: '050-1234567',
  email: 'support@panda.co.il',
  address: 'תל אביב, ישראל',
  wa: 'https://wa.me/972501234567',
  tg: 'https://t.me/panda',
  txtAI: 'AI',
  txtTrans: 'תרגום',
  txtTTS: 'הקראה',
  placeholder: 'התחל להקליט...',
  hFont: "'Rubik', sans-serif",
  bFont: "'Heebo', sans-serif",
  showAI: true,
  showTrans: true,
  showTTS: true,
  copyright: 'כל הזכויות שמורות ל-פנדה סוכנות דיגיטל © 2026 מתן אלקיים',
  legalAccess: `<h2>הצהרת נגישות</h2>
<p>אנו ב-PandaVoice פועלים להנגיש את המערכת לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998 ותקנות הנגישות.</p>
<h3>התאמות הנגישות שבוצעו</h3>
<ul>
  <li>תמיכה מלאה בתצוגה מותאמת לגדלי מסך שונים (רספונסיביות)</li>
  <li>אפשרות לשינוי גודל טקסט באמצעות כפתורי A+ ו-A-</li>
  <li>תמיכה במצב לילה (Dark Mode)</li>
  <li>תוויות (aria-labels) לכל הכפתורים והאלמנטים האינטראקטיביים</li>
  <li>תמיכה בניווט באמצעות מקלדת</li>
  <li>התאמה לקוראי מסך</li>
  <li>ניגודיות צבעים גבוהה העומדת בתקן WCAG 2.1 AA</li>
</ul>
<h3>דרכי פנייה</h3>
<p>אם נתקלת בבעיית נגישות, אנא פנה אלינו:</p>
<p>📧 אימייל: support@panda.co.il<br>📞 טלפון: 050-1234567</p>
<p>נשמח לטפל בפנייתך בהקדם האפשרי.</p>
<p><em>עודכן לאחרונה: מאי 2026</em></p>`,
  legalTerms: `<h2>תנאי שימוש</h2>
<p>ברוכים הבאים לאפליקציית PandaVoice ("המערכת"). השימוש במערכת כפוף לתנאים המפורטים להלן.</p>
<h3>1. הגדרות</h3>
<p>"המערכת" – אפליקציית אינטרנט להקלטה, עיבוד טקסט, תרגום ודיבור סינטטי.<br>"המשתמש" – כל אדם או גוף המשתמש במערכת.<br>"החברה" – פנדה סוכנות דיגיטל, בבעלות מתן אלקיים.</p>
<h3>2. השימוש במערכת</h3>
<p>2.1 המשתמש רשאי לעשות שימוש במערכת לצרכים אישיים, מסחריים וחינוכיים, בכפוף לתנאים אלו.<br>2.2 אסור לעשות שימוש במערכת למטרות בלתי חוקיות, להפיץ תוכן פוגעני, מאיים, גזעני, או המפר זכויות יוצרים.<br>2.3 החברה שומרת לעצמה הזכות לחסום גישה למשתמשים המפרים תנאים אלו.</p>
<h3>3. מפתחות API</h3>
<p>3.1 המערכת משתמשת במפתחות API המסופקים על ידי המשתמש מול ספקי צד שלישי (Gemini, Groq, OpenAI).<br>3.2 מפתחות ה-API נשמרים אך ורק בדפדפן המשתמש (localStorage) ואינם מועברים לשרתי החברה.<br>3.3 החברה אינה אחראית לשימוש שנעשה במפתחות ה-API על ידי ספקי הצד השלישי.</p>
<h3>4. אחריות</h3>
<p>4.1 המערכת ניתנת "כמות שהיא" (AS-IS) ללא כל אחריות למהימנות, דיוק או זמינות.<br>4.2 החברה אינה אחראית לנזקים ישירים או עקיפים הנובעים משימוש במערכת.<br>4.3 החברה אינה אחראית לתוכן שנוצר על ידי בינה מלאכותית באמצעות המערכת.</p>
<h3>5. קניין רוחני</h3>
<p>5.1 כל זכויות הקניין הרוחני במערכת שייכות לחברה.<br>5.2 התוכן שנוצר על ידי המשתמש שייך למשתמש.</p>
<h3>6. שינויים</h3>
<p>החברה שומרת לעצמה הזכות לעדכן תנאים אלו מעת לעת. המשך השימוש במערכת מהווה הסכמה לתנאים המעודכנים.</p>
<p><em>עודכן לאחרונה: מאי 2026</em></p>`,
  legalPrivacy: `<h2>מדיניות פרטיות</h2>
<p>אנו ב-PandaVoice ("החברה") מכבדים את פרטיותך ומחויבים להגן על המידע האישי שלך.</p>
<h3>1. איסוף מידע</h3>
<p>1.1 <strong>מידע אישי:</strong> בעת ההרשמה באמצעות Google OAuth, אנו מקבלים את שמך וכתובת האימייל שלך.<br>1.2 <strong>מידע שימוש:</strong> אנו אוספים מידע סטטיסטי על השימוש במערכת לצורך שיפור השירות.<br>1.3 <strong>הקלטות:</strong> הקלטות אודיו נשמרות בשרת המערכת, והמידע עליהן נשמר במסד הנתונים המקומי.</p>
<h3>2. שימוש במידע</h3>
<p>המידע הנאסף משמש ל: (א) אספקת השירותים והתכונות השונות, (ב) שיפור וחוויית המשתמש, (ג) תמיכה טכנית, (ד) עמידה בדרישות חוק.</p>
<h3>3. אבטחת מידע</h3>
<p>3.1 אנו נוקטים באמצעי אבטחה מתקדמים להגנת המידע, לרבות הצפנת תעבורה ב-TLS.<br>3.2 מפתחות ה-API שלך נשמרים בדפדפן שלך. הם עוברים דרך שרת המערכת לצורך עיבוד הבקשות לספקי ה-AI, אך אינם נשמרים בשרת.<br>3.3 הגישה למערכת מנוהלת באמצעות הזדהות HTTP בסיסית ואינה דורשת יצירת חשבון.</p>
<h3>4. שיתוף מידע עם צדדים שלישיים</h3>
<p>4.1 אנו לא מוכרים או משכירים מידע אישי לצדדים שלישיים.<br>4.2 מידע עשוי להיות משותף עם: (א) ספקי AI (Gemini, Groq, OpenAI) – עיבוד טקסט לפי בחירתך.</p>
<h3>5. זכויותיך</h3>
<p>על פי חוק הגנת הפרטיות, התשמ"א-1981, זכותך: (א) לעיין במידע, (ב) לבקש תיקון מידע, (ג) לבקש מחיקת מידע, (ד) לבקש הפסקת שימוש במידע.</p>
<h3>6. צור קשר</h3>
<p>לכל שאלה או בקשה בנושא פרטיות, צור קשר:<br>📧 support@panda.co.il</p>
<p><em>עודכן לאחרונה: מאי 2026</em></p>`
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      content: '',
      isDarkMode: false,
      isRecording: false,
      isSpeaking: false,
      apiKeys: {
        gemini: '',
        groq: '',
        hf: '',
        openai: '',
        claude: ''
      },
      ttsSettings: {
        rate: 1,
        pitch: 1,
        voice: '',
        langFilter: 'all'
      },
      seenOnboarding: false,

      setContent: (content) => set({ content }),
      setConfig: (newConfig) => set((state) => ({
        config: { ...state.config, ...newConfig }
      })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setRecording: (recording) => set({ isRecording: recording }),
      setSpeaking: (speaking) => set({ isSpeaking: speaking }),
      setApiKey: (key, value) => set((state) => ({
        apiKeys: { ...state.apiKeys, [key]: value }
      })),
      setTTSSettings: (settings) => set((state) => ({
        ttsSettings: { ...state.ttsSettings, ...settings }
      })),
      setSeenOnboarding: () => set({ seenOnboarding: true }),
      resetConfig: () => set({ config: defaultConfig })
    }),
    {
      name: 'pandavoice-storage'
    }
  )
);
