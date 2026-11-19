import React, { useState } from 'react';
import {
  Settings,
  Contrast,
  Globe,
  Volume2,
  ShieldCheck,
  Trash2,
  Check,
  RotateCcw,
  Eye,
  Mic,
  Camera,
  Play,
  Moon,
  Sun,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { speakEnglishText } from '../services/speech';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSetting,
    resetSettings,
    savedTranscripts,
    clearAllTranscripts,
  } = useSettings();

  const [clearedNotice, setClearedNotice] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);

  const handleClearTranscripts = () => {
    if (window.confirm('Are you sure you want to delete all saved caption transcripts? This action cannot be undone.')) {
      clearAllTranscripts();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2000);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all accessibility preferences to default values?')) {
      resetSettings();
      setResetNotice(true);
      setTimeout(() => setResetNotice(false), 2000);
    }
  };

  const handleTestVoice = () => {
    setIsPlayingTestVoice(true);
    speakEnglishText(
      `Hello. Testing HearMe AI text-to-speech at ${settings.ttsSpeed.toFixed(1)} times speed.`,
      {
        rate: settings.ttsSpeed,
        pitch: settings.ttsPitch,
        voiceURI: settings.ttsVoiceURI,
        onEnd: () => setIsPlayingTestVoice(false),
        onError: () => setIsPlayingTestVoice(false),
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block mb-1">
              Configuration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              Accessibility Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-mono">
              TYPOGRAPHY • DIALECTS • HIGH CONTRAST • PRIVACY
            </p>
          </div>

          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-lg border border-[#D4D4D4] hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            {resetNotice ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>{resetNotice ? 'Defaults Restored' : 'Reset Defaults'}</span>
          </button>
        </div>

        {/* 1. Appearance Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-6">
          <div className="pb-3 border-b border-[#E5E5E5]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              1. Appearance
            </h2>
            <p className="text-xs text-[#777777]">Color contrast and visual theme</p>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs sm:text-sm font-bold text-black block">High-Contrast Mode</span>
              <span className="text-xs text-[#666666]">
                Maximizes black and white borders and text visibility for low vision users.
              </span>
            </div>
            {/* Monochrome Toggle Switch */}
            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.highContrast ? 'bg-black' : 'bg-[#D4D4D4]'
              }`}
              aria-label="Toggle High Contrast"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.highContrast ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-[#E5E5E5]">
            <div>
              <span className="text-xs sm:text-sm font-bold text-black block">Reduced Motion</span>
              <span className="text-xs text-[#666666]">
                Disables CSS animations, soundwave pulses, and slide transitions.
              </span>
            </div>
            <button
              onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.reducedMotion ? 'bg-black' : 'bg-[#D4D4D4]'
              }`}
              aria-label="Toggle Reduced Motion"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.reducedMotion ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Captions Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-6">
          <div className="pb-3 border-b border-[#E5E5E5]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              2. Captions
            </h2>
            <p className="text-xs text-[#777777]">Font sizing and readability scaling</p>
          </div>

          {/* Caption Size Selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-black block">Caption Font Size:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono">
              {(['sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSetting('captionFontSize', sz)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    settings.captionFontSize === sz
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-[#D4D4D4] hover:border-black'
                  }`}
                >
                  <span className="uppercase">{sz}</span>
                  <span className="block text-[10px] opacity-70 font-normal">
                    {sz === 'sm' ? '16px' : sz === 'md' ? '20px' : sz === 'lg' ? '24px' : sz === 'xl' ? '30px' : sz === '2xl' ? '36px' : '48px'}
                  </span>
                </button>
              ))}
            </div>

            {/* Live Size Preview Box */}
            <div className="p-5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] text-center mt-3">
              <span className="text-[10px] font-mono text-[#777777] uppercase tracking-widest block mb-1">
                Preview
              </span>
              <p
                className={`font-bold text-black tracking-tight ${
                  settings.captionFontSize === 'sm'
                    ? 'text-base'
                    : settings.captionFontSize === 'md'
                    ? 'text-lg'
                    : settings.captionFontSize === 'lg'
                    ? 'text-xl'
                    : settings.captionFontSize === 'xl'
                    ? 'text-2xl'
                    : settings.captionFontSize === '2xl'
                    ? 'text-3xl'
                    : 'text-4xl'
                }`}
              >
                "Accessible English Captions"
              </p>
            </div>
          </div>
        </div>

        {/* 3. Speech Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-6">
          <div className="pb-3 border-b border-[#E5E5E5]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              3. Speech & Dialect
            </h2>
            <p className="text-xs text-[#777777]">Speech recognition accent tuning and TTS speed</p>
          </div>

          {/* Preferred English Dialect */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-bold text-black block">Recognition Dialect</span>
              <span className="text-xs text-[#666666]">
                Acoustic model tuning for Indian vs US English pronunciation.
              </span>
            </div>
            <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-lg p-1 font-mono text-xs">
              <button
                onClick={() => updateSetting('speechRecognitionDialect', 'en-IN')}
                className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                  settings.speechRecognitionDialect === 'en-IN'
                    ? 'bg-black text-white'
                    : 'text-[#555555] hover:text-black'
                }`}
              >
                English (India)
              </button>
              <button
                onClick={() => updateSetting('speechRecognitionDialect', 'en-US')}
                className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                  settings.speechRecognitionDialect === 'en-US'
                    ? 'bg-black text-white'
                    : 'text-[#555555] hover:text-black'
                }`}
              >
                English (US)
              </button>
            </div>
          </div>

          {/* TTS Speed */}
          <div className="space-y-2 pt-3 border-t border-[#E5E5E5]">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-black block">Text-to-Speech Default Speed</span>
              <span className="text-xs font-mono font-bold text-black">{settings.ttsSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.1"
              value={settings.ttsSpeed}
              onChange={(e) => updateSetting('ttsSpeed', parseFloat(e.target.value))}
              className="w-full accent-black bg-[#E5E5E5] rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-[#777777]">0.5x Slow</span>
              <button
                onClick={handleTestVoice}
                disabled={isPlayingTestVoice}
                className="px-3 py-1 rounded-lg border border-[#D4D4D4] hover:border-black text-black text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>{isPlayingTestVoice ? 'Playing...' : 'Test Voice Output'}</span>
              </button>
              <span className="text-[10px] font-mono text-[#777777]">1.8x Fast</span>
            </div>
          </div>
        </div>

        {/* 4. Accessibility & Data Storage */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-6">
          <div className="pb-3 border-b border-[#E5E5E5]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              4. Data & Session Records
            </h2>
            <p className="text-xs text-[#777777]">Local transcript persistence and data management</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs sm:text-sm font-bold text-black block">Save Transcripts Locally</span>
              <span className="text-xs text-[#666666]">
                Store caption sessions on this device for dashboard and summarizer access.
              </span>
            </div>
            <button
              onClick={() => updateSetting('saveTranscriptsLocally', !settings.saveTranscriptsLocally)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.saveTranscriptsLocally ? 'bg-black' : 'bg-[#D4D4D4]'
              }`}
              aria-label="Toggle Save Transcripts Locally"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.saveTranscriptsLocally ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-[#E5E5E5]">
            <div>
              <span className="text-xs sm:text-sm font-bold text-black block">Stored Transcripts</span>
              <span className="text-xs text-[#666666]">
                Currently holding {savedTranscripts.length} session records.
              </span>
            </div>
            <button
              onClick={handleClearTranscripts}
              disabled={savedTranscripts.length === 0}
              className="px-3.5 py-2 rounded-lg border border-black text-black hover:bg-black hover:text-white text-xs font-semibold disabled:opacity-30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{clearedNotice ? 'Cleared' : 'Clear All Transcripts'}</span>
            </button>
          </div>
        </div>

        {/* 5. Privacy Policy Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-4">
          <div className="pb-3 border-b border-[#E5E5E5]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              5. Privacy Principles
            </h2>
            <p className="text-xs text-[#777777]">Strict microphone and camera handling boundaries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-1">
              <span className="font-bold text-black block">Microphone Privacy</span>
              <p className="text-[#666666] leading-relaxed text-[11px]">
                Audio is captured only while "Start Listening" is active in Live Caption Studio. Zero audio recordings are stored or transmitted to external storage.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] space-y-1">
              <span className="font-bold text-black block">Camera Privacy</span>
              <p className="text-[#666666] leading-relaxed text-[11px]">
                Webcam frames are analyzed locally in browser memory using MediaPipe Hands. Video frames are never recorded, uploaded, or shared.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
