import { EnglishDialect } from '../types';

// Web Speech API interface definitions for TypeScript
export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

export interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

// Check if browser supports Web Speech API
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Create a SpeechRecognition instance
export const createSpeechRecognitionInstance = (
  dialect: EnglishDialect = 'en-IN'
): ISpeechRecognition | null => {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const recognition: ISpeechRecognition = new SpeechRecognitionConstructor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = dialect;

  return recognition;
};

// Text-to-Speech Helper Functions
export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const getAvailableEnglishVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    const filterEnglish = (voices: SpeechSynthesisVoice[]) => {
      return voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('en') ||
          v.lang.toLowerCase().includes('en-in') ||
          v.lang.toLowerCase().includes('en-us') ||
          v.lang.toLowerCase().includes('en-gb')
      );
    };

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(filterEnglish(voices));
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(filterEnglish(voices));
    };

    // Timeout fallback after 1 second
    setTimeout(() => {
      resolve(filterEnglish(window.speechSynthesis.getVoices()));
    }, 1000);
  });
};

export const speakEnglishText = (
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) => {
  if (!isSpeechSynthesisSupported() || !text.trim()) return;

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;

  if (options?.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.voiceURI === options.voiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};
