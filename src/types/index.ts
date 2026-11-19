export type SupportedLanguageCode =
  | 'en-IN'
  | 'ta-IN'
  | 'ml-IN'
  | 'hi-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'bn-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'pa-IN'
  | 'en-US';

export type EnglishDialect = SupportedLanguageCode;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt?: string;
}

export interface UserAccessibilitySettings {
  captionFontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  highContrast: boolean;
  theme: 'dark' | 'light';
  speechRecognitionDialect: EnglishDialect;
  ttsSpeed: number; // 0.5 to 2.0
  ttsPitch: number; // 0.5 to 1.5
  ttsVoiceURI: string;
  reducedMotion: boolean;
  saveTranscriptsLocally: boolean;
}

export interface SavedTranscript {
  id: string;
  userId?: string;
  title: string;
  content: string;
  timestamp: string;
  durationSeconds?: number;
  wordCount: number;
  dialect: EnglishDialect;
}

export type SignCategory =
  | 'Greetings'
  | 'Everyday Communication'
  | 'Emergency'
  | 'Education'
  | 'Medical Communication'
  | 'Food and Drinks'
  | 'Travel'
  | 'Common Responses';

export interface SignLanguageCard {
  id: string;
  phrase: string;
  category: SignCategory;
  meaning: string;
  context: string;
  instructions: string[];
  isISLVerified: boolean;
  referenceSource?: string;
  svgVisualType: 'hand_wave' | 'namaste' | 'help' | 'thank_you' | 'yes' | 'no' | 'doctor' | 'water' | 'stop' | 'slow';
  imageSrc?: string;
  isFavorite?: boolean;
  isLearned?: boolean;
}

export interface GeminiExplainerResult {
  phrase: string;
  meaning: string;
  context: string;
  simpleExplanation: string;
  signGuidance: string;
  politeAlternatives: string[];
  verifiedReferenceNote: string;
}

export interface GestureDetectionResult {
  gesture: string;
  confidence: number;
  description: string;
  isRecognized: boolean;
  timestamp: number;
  englishMeaning?: string;
  status?: 'Recognized' | 'No Hand Detected' | 'Partial Match' | 'Unknown Gesture';
  handsCount?: number;
}

export interface SummarizerOutput {
  shortSummary: string;
  importantPoints: string[];
  instructions: string[];
  tasksAndActions: string[];
  datesAndDeadlines: string[];
  simpleExplanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
