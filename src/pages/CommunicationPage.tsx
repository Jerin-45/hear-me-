import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Play,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import {
  speakText,
  stopSpeech,
  getVoicesForLanguage,
  isSpeechSynthesisSupported,
} from '../services/speech';
import { TEN_LANGUAGES, getLanguageInfo } from '../services/languages';

export const CommunicationPage: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(settings.ttsSpeed || 1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(settings.ttsPitch || 1.0);

  const supported = isSpeechSynthesisSupported();
  const currentLang = getLanguageInfo(settings.speechRecognitionDialect);

  useEffect(() => {
    getVoicesForLanguage(currentLang.code).then((available) => {
      setVoices(available);
      if (available.length > 0) {
        const preferred =
          available.find((v) => v.lang.toLowerCase() === currentLang.code.toLowerCase()) ||
          available.find((v) => v.lang.toLowerCase().startsWith(currentLang.code.split('-')[0])) ||
          available[0];
        setSelectedVoiceURI(preferred.voiceURI);
      }
    });

    return () => {
      stopSpeech();
    };
  }, [currentLang.code]);

  const handleSpeak = () => {
    if (!text.trim() || !supported) return;

    setIsSpeaking(true);
    speakText(text.trim(), {
      lang: currentLang.code,
      rate: speechRate,
      pitch: speechPitch,
      voiceURI: selectedVoiceURI,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStop = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  const handleClear = () => {
    stopSpeech();
    setText('');
    setIsSpeaking(false);
  };

  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleSelectQuickPhrase = (phrase: string) => {
    setText(phrase);
    speakText(phrase, {
      lang: currentLang.code,
      rate: speechRate,
      pitch: speechPitch,
      voiceURI: selectedVoiceURI,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] block mb-1">
              Assistive Vocalization • 10 Languages
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              Text-to-Speech Communication
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-mono">
              TAMIL • MALAYALAM • HINDI • TELUGU • ENGLISH & 5 MORE
            </p>
          </div>

          {isSpeaking && (
            <div className="px-3.5 py-1.5 rounded-full border border-black bg-white text-black text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              <span>SPEAKING OUT LOUD</span>
            </div>
          )}
        </div>

        {/* 10-Language Selector Tabs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E5E5] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Select Language (10 Languages):</span>
            </span>
            <span className="text-xs font-mono font-semibold text-black">
              {currentLang.nativeName} ({currentLang.name})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TEN_LANGUAGES.map((lang) => {
              const active = settings.speechRecognitionDialect === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => updateSetting('speechRecognitionDialect', lang.code)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2 ${
                    active
                      ? 'bg-black text-white border-black font-bold shadow-sm'
                      : 'bg-white text-black border-[#D4D4D4] hover:border-black hover:bg-[#F7F7F7]'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="overflow-hidden">
                    <span className="block truncate">{lang.nativeName}</span>
                    <span className={`text-[10px] font-mono block ${active ? 'text-[#D4D4D4]' : 'text-[#777777]'}`}>
                      {lang.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Text Editor Workspace */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              Typed Message in {currentLang.nativeName}:
            </label>
            <span className="text-xs font-mono text-[#777777]">
              {text.length} chars • {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Type your message in ${currentLang.nativeName} or English, or click a quick phrase below...`}
            className="w-full p-4 rounded-xl bg-white border border-[#D4D4D4] text-sm sm:text-base text-black placeholder-[#777777] focus:outline-none focus:border-black focus:ring-1 focus:ring-black leading-relaxed"
          />

          {/* Minimal Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5">
              {/* Speak Button */}
              <button
                onClick={handleSpeak}
                disabled={!text.trim() || isSpeaking}
                className="px-6 py-3 rounded-xl bg-black hover:bg-[#1C1C1C] text-white text-xs sm:text-sm font-semibold tracking-wide disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Speak in {currentLang.nativeName}</span>
              </button>

              {/* Stop Button */}
              {isSpeaking && (
                <button
                  onClick={handleStop}
                  className="px-5 py-3 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                disabled={!text.trim()}
                className="p-3 rounded-xl border border-[#D4D4D4] hover:border-black text-black disabled:opacity-40 transition-colors cursor-pointer"
                title="Copy Text"
                aria-label="Copy Text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Clear Workspace Button */}
              <button
                onClick={handleClear}
                disabled={!text.trim()}
                className="p-3 rounded-xl border border-[#D4D4D4] hover:border-black text-black disabled:opacity-40 transition-colors cursor-pointer"
                title="Clear Text"
                aria-label="Clear Text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Speed & Pitch Controls */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E5] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rate Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Speaking Tempo
              </label>
              <span className="text-xs font-mono font-bold text-black">{speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.1"
              value={speechRate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeechRate(val);
                updateSetting('ttsSpeed', val);
              }}
              className="w-full accent-black bg-[#E5E5E5] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#777777] mt-1">
              <span>0.5x Slow</span>
              <span>1.0x Normal</span>
              <span>1.8x Fast</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Voice Pitch
              </label>
              <span className="text-xs font-mono font-bold text-black">{speechPitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              value={speechPitch}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeechPitch(val);
                updateSetting('ttsPitch', val);
              }}
              className="w-full accent-black bg-[#E5E5E5] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#777777] mt-1">
              <span>Lower</span>
              <span>Balanced</span>
              <span>Higher</span>
            </div>
          </div>
        </div>

        {/* Quick Phrases in Selected Language */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#777777] block">
              Everyday Phrases in {currentLang.nativeName} ({currentLang.name})
            </span>
            <span className="text-xs font-mono text-[#777777]">
              Click phrase to speak aloud
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentLang.quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuickPhrase(phrase)}
                className="p-4 rounded-xl bg-white border border-[#D4D4D4] hover:border-black text-left text-xs text-black font-medium transition-all flex items-center justify-between group shadow-sm cursor-pointer"
              >
                <span>"{phrase}"</span>
                <Play className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-2 text-black" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
