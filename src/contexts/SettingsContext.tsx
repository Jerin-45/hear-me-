import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccessibilitySettings, EnglishDialect, SavedTranscript } from '../types';

interface SettingsContextType {
  settings: UserAccessibilitySettings;
  updateSetting: <K extends keyof UserAccessibilitySettings>(key: K, value: UserAccessibilitySettings[K]) => void;
  resetSettings: () => void;
  savedTranscripts: SavedTranscript[];
  saveTranscript: (transcript: Omit<SavedTranscript, 'id' | 'timestamp'>) => void;
  deleteTranscript: (id: string) => void;
  clearAllTranscripts: () => void;
  getFontSizeClass: () => string;
}

const DEFAULT_SETTINGS: UserAccessibilitySettings = {
  captionFontSize: 'xl',
  highContrast: false,
  theme: 'light',
  speechRecognitionDialect: 'en-IN',
  ttsSpeed: 1.0,
  ttsPitch: 1.0,
  ttsVoiceURI: '',
  reducedMotion: false,
  saveTranscriptsLocally: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'hearme_accessibility_settings';
const TRANSCRIPTS_STORAGE_KEY = 'hearme_saved_transcripts';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserAccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [savedTranscripts, setSavedTranscripts] = useState<SavedTranscript[]>(() => {
    try {
      const stored = localStorage.getItem(TRANSCRIPTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load transcripts from storage', e);
    }
    return [];
  });

  // Apply high contrast and theme classes to html root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  // Persist transcripts
  useEffect(() => {
    try {
      localStorage.setItem(TRANSCRIPTS_STORAGE_KEY, JSON.stringify(savedTranscripts));
    } catch (e) {
      console.warn('Failed to save transcripts', e);
    }
  }, [savedTranscripts]);

  const updateSetting = <K extends keyof UserAccessibilitySettings>(key: K, value: UserAccessibilitySettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const saveTranscript = (item: Omit<SavedTranscript, 'id' | 'timestamp'>) => {
    if (!settings.saveTranscriptsLocally) return;
    const newEntry: SavedTranscript = {
      ...item,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
    };
    setSavedTranscripts((prev) => [newEntry, ...prev]);
  };

  const deleteTranscript = (id: string) => {
    setSavedTranscripts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTranscripts = () => {
    setSavedTranscripts([]);
  };

  const getFontSizeClass = (): string => {
    switch (settings.captionFontSize) {
      case 'sm':
        return 'text-base sm:text-lg leading-relaxed';
      case 'md':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'lg':
        return 'text-xl sm:text-2xl leading-relaxed';
      case 'xl':
        return 'text-2xl sm:text-3xl leading-relaxed font-medium';
      case '2xl':
        return 'text-3xl sm:text-4xl leading-relaxed font-semibold';
      case '3xl':
        return 'text-4xl sm:text-5xl leading-relaxed font-bold tracking-tight';
      default:
        return 'text-2xl sm:text-3xl leading-relaxed font-medium';
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        savedTranscripts,
        saveTranscript,
        deleteTranscript,
        clearAllTranscripts,
        getFontSizeClass,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
