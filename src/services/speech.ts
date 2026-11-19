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

export const getAllVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };

    // Fallback timeout after 1 second
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
};

export const getVoicesForLanguage = async (langCode: string = 'en-IN'): Promise<SpeechSynthesisVoice[]> => {
  const all = await getAllVoices();
  const prefix = langCode.split('-')[0].toLowerCase();
  const matching = all.filter(
    (v) =>
      v.lang.toLowerCase() === langCode.toLowerCase() ||
      v.lang.toLowerCase().startsWith(prefix)
  );
  return matching.length > 0 ? matching : all;
};

export const getAvailableEnglishVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  return getVoicesForLanguage('en-IN');
};

export const speakText = (
  text: string,
  options?: {
    lang?: string;
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
  utterance.lang = options?.lang || 'en-IN';
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;

  if (options?.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.voiceURI === options.voiceURI);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    }
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
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
  speakText(text, options);
};

export const stopSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};
