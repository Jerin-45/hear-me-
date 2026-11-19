import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Play,
  ArrowRight,
  ArrowRightLeft,
  Globe,
  Languages,
  Mic,
  MicOff,
  X,
  Sparkles,
  BookOpen,
  Clock,
  Trash2,
  AlertCircle,
  Square,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import {
  speakText,
  stopSpeech,
  getVoicesForLanguage,
  isSpeechSynthesisSupported,
  createSpeechRecognitionInstance,
  isSpeechRecognitionSupported,
} from '../services/speech';
import { TEN_LANGUAGES, getLanguageInfo } from '../services/languages';
import { translateText } from '../services/translator';
import { SupportedLanguageCode, TranslationResult } from '../types';

interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: SupportedLanguageCode;
  toLang: SupportedLanguageCode;
  timestamp: string;
}

export const CommunicationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings, updateSetting } = useSettings();

  // Active Mode: 'vocalizer' | 'translator'
  const initialMode = searchParams.get('tab') === 'translator' ? 'translator' : 'vocalizer';
  const [activeMode, setActiveMode] = useState<'vocalizer' | 'translator'>(initialMode);

  // Sync mode with URL search params
  const handleModeChange = (mode: 'vocalizer' | 'translator') => {
    setActiveMode(mode);
    setSearchParams({ tab: mode });
    stopSpeech();
    setIsSpeaking(false);
    setIsPlayingSource(false);
    setIsPlayingTarget(false);
  };

  // =========================================================================
  // State: Vocalizer Mode
  // =========================================================================
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedVocalizer, setCopiedVocalizer] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(settings.ttsSpeed || 1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(settings.ttsPitch || 1.0);

  const supported = isSpeechSynthesisSupported();
  const currentLang = getLanguageInfo(settings.speechRecognitionDialect || 'en-IN');

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

  // =========================================================================
  // State: Translator Mode
  // =========================================================================
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState<string | undefined>(undefined);
  const [fromLang, setFromLang] = useState<SupportedLanguageCode>(settings.speechRecognitionDialect || 'en-IN');
  const [toLang, setToLang] = useState<SupportedLanguageCode>(
    (settings.speechRecognitionDialect || 'en-IN') === 'ta-IN' ? 'en-IN' : 'ta-IN'
  );
  const [transLoading, setTransLoading] = useState(false);
  const [transError, setTransError] = useState<string | null>(null);
  const [copiedTrans, setCopiedTrans] = useState(false);
  const [isPlayingSource, setIsPlayingSource] = useState(false);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('hearme_trans_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recognitionRef = useRef<any>(null);

  const fromInfo = getLanguageInfo(fromLang);
  const toInfo = getLanguageInfo(toLang);

  // Stop speech & mic on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem('hearme_trans_history', JSON.stringify(history.slice(0, 10)));
    } catch {}
  }, [history]);

  // =========================================================================
  // Handlers: Vocalizer
  // =========================================================================
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

  const handleCopyVocalizer = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopiedVocalizer(true);
      setTimeout(() => setCopiedVocalizer(false), 2000);
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

  // Transfer text from Vocalizer to Translator
  const handleSendToTranslator = () => {
    if (!text.trim()) return;
    setSourceText(text.trim());
    setFromLang(currentLang.code);
    handleModeChange('translator');
    setTimeout(() => {
      handleTranslate(text.trim());
    }, 50);
  };

  // =========================================================================
  // Handlers: Translator
  // =========================================================================
  const handleTranslate = async (textToTranslate?: string) => {
    const query = (textToTranslate !== undefined ? textToTranslate : sourceText).trim();
    if (!query) {
      setTranslatedText('');
      setPronunciation(undefined);
      return;
    }

    stopSpeech();
    setIsPlayingSource(false);
    setIsPlayingTarget(false);

    setTransLoading(true);
    setTransError(null);

    try {
      const result: TranslationResult = await translateText(query, fromLang, toLang);
      setTranslatedText(result.translatedText);
      setPronunciation(result.pronunciation);

      if (result.translatedText && result.translatedText !== query) {
        setHistory((prev) => {
          const filtered = prev.filter(
            (item) => !(item.sourceText === query && item.toLang === toLang)
          );
          return [
            {
              id: `tr_${Date.now()}`,
              sourceText: query,
              translatedText: result.translatedText,
              fromLang,
              toLang,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...filtered,
          ].slice(0, 8);
        });
      }
    } catch (err: any) {
      setTransError(err.message || 'Translation failed.');
    } finally {
      setTransLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const prevFrom = fromLang;
    const prevTo = toLang;
    const prevSource = sourceText;
    const prevTarget = translatedText;

    setFromLang(prevTo);
    setToLang(prevFrom);
    setSourceText(prevTarget || prevSource);
    setTranslatedText(prevTarget ? prevSource : '');
    setPronunciation(undefined);

    if (prevTarget) {
      setTimeout(() => {
        handleTranslate(prevTarget);
      }, 50);
    }
  };

  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = createSpeechRecognitionInstance(fromLang);
      if (!recognition) return;

      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTransError(null);
      };

      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setSourceText(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error in translator:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (sourceText.trim()) {
          handleTranslate(sourceText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      setIsListening(false);
    }
  };

  const handleReadSource = () => {
    if (!sourceText.trim()) return;

    if (isPlayingSource) {
      stopSpeech();
      setIsPlayingSource(false);
      return;
    }

    stopSpeech();
    setIsPlayingTarget(false);
    setIsPlayingSource(true);

    speakText(sourceText, {
      lang: fromLang,
      rate: speechRate,
      pitch: speechPitch,
      onEnd: () => setIsPlayingSource(false),
      onError: () => setIsPlayingSource(false),
    });
  };

  const handleReadTarget = () => {
    if (!translatedText.trim()) return;

    if (isPlayingTarget) {
      stopSpeech();
      setIsPlayingTarget(false);
      return;
    }

    stopSpeech();
    setIsPlayingSource(false);
    setIsPlayingTarget(true);

    speakText(translatedText, {
      lang: toLang,
      rate: speechRate,
      pitch: speechPitch,
      onEnd: () => setIsPlayingTarget(false),
      onError: () => setIsPlayingTarget(false),
    });
  };

  const handleCopyTrans = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopiedTrans(true);
      setTimeout(() => setCopiedTrans(false), 2000);
    } catch {}
  };

  const handleOpenInSignExplainer = () => {
    const textToExplain = translatedText || sourceText;
    if (!textToExplain) return;
    sessionStorage.setItem('hearme_explainer_prefill', textToExplain);
    navigate('/sign-explainer');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0A0A0A] text-black dark:text-white py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header with Mode Switcher */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#777777] dark:text-[#999999] block mb-1">
                Assistive Vocalization & Translation • 10 Languages
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
                Text-to-Speech & Multilingual Translator
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] dark:text-[#AAAAAA] mt-1 font-mono">
                TAMIL • MALAYALAM • HINDI • TELUGU • ENGLISH & 5 MORE
              </p>
            </div>

            {isSpeaking && (
              <div className="px-3.5 py-1.5 rounded-full border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-xs font-mono font-bold flex items-center gap-2 self-start md:self-auto">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping" />
                <span>SPEAKING OUT LOUD</span>
              </div>
            )}
          </div>

          {/* Dual Mode Switcher Tabs */}
          <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
            <div className="inline-flex p-1 rounded-xl bg-[#F0F0F0] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] gap-1">
              <button
                type="button"
                onClick={() => handleModeChange('vocalizer')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeMode === 'vocalizer'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-[#666666] dark:text-[#AAAAAA] hover:text-black dark:hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Text-to-Speech Vocalizer</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('translator')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeMode === 'translator'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-[#666666] dark:text-[#AAAAAA] hover:text-black dark:hover:text-white'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Multilingual Voice & Text Translator</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MODE 1: VOCALIZER WORKSPACE                                      */}
        {/* ================================================================= */}
        {activeMode === 'vocalizer' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 10-Language Selector Tabs */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Select Vocalization Language:</span>
                </span>
                <span className="text-xs font-mono font-semibold text-black dark:text-white">
                  {currentLang.flag} {currentLang.nativeName} ({currentLang.name})
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
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-sm'
                          : 'bg-white dark:bg-[#1A1A1A] text-black dark:text-white border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white hover:bg-[#F7F7F7] dark:hover:bg-[#252525]'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="overflow-hidden">
                        <span className="block truncate">{lang.nativeName}</span>
                        <span className={`text-[10px] font-mono block ${active ? 'text-[#D4D4D4] dark:text-[#444444]' : 'text-[#777777] dark:text-[#888888]'}`}>
                          {lang.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Large Text Editor Workspace */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-[#262626]">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  Typed Message in {currentLang.nativeName}:
                </label>
                <span className="text-xs font-mono text-[#777777] dark:text-[#888888]">
                  {text.length} chars • {text.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Type your message in ${currentLang.nativeName} or English, or click a quick phrase below...`}
                className="w-full p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#D4D4D4] dark:border-[#333333] text-sm sm:text-base text-black dark:text-white placeholder-[#777777] dark:placeholder-[#666666] focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white leading-relaxed"
              />

              {/* Minimal Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Speak Button */}
                  <button
                    onClick={handleSpeak}
                    disabled={!text.trim() || isSpeaking}
                    className="px-6 py-3 rounded-xl bg-black dark:bg-white hover:bg-[#1C1C1C] dark:hover:bg-[#E5E5E5] text-white dark:text-black text-xs sm:text-sm font-semibold tracking-wide disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Speak in {currentLang.nativeName}</span>
                  </button>

                  {/* Stop Button */}
                  {isSpeaking && (
                    <button
                      onClick={handleStop}
                      className="px-5 py-3 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  )}

                  {/* Translate This Button */}
                  {text.trim() && (
                    <button
                      onClick={handleSendToTranslator}
                      className="px-4 py-3 rounded-xl border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1A1A1A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Translate this message into another language"
                    >
                      <Languages className="w-4 h-4" />
                      <span>Translate This</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    onClick={handleCopyVocalizer}
                    disabled={!text.trim()}
                    className="p-3 rounded-xl border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1A1A1A] disabled:opacity-40 transition-colors cursor-pointer"
                    title="Copy Text"
                    aria-label="Copy Text"
                  >
                    {copiedVocalizer ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Clear Workspace Button */}
                  <button
                    onClick={handleClear}
                    disabled={!text.trim()}
                    className="p-3 rounded-xl border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1A1A1A] disabled:opacity-40 transition-colors cursor-pointer"
                    title="Clear Text"
                    aria-label="Clear Text"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Speed & Pitch Controls */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rate Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                    Speaking Tempo
                  </label>
                  <span className="text-xs font-mono font-bold text-black dark:text-white">{speechRate.toFixed(1)}x</span>
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
                  className="w-full accent-black dark:accent-white bg-[#E5E5E5] dark:bg-[#2A2A2A] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#777777] dark:text-[#888888] mt-1">
                  <span>0.5x Slow</span>
                  <span>1.0x Normal</span>
                  <span>1.8x Fast</span>
                </div>
              </div>

              {/* Pitch Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                    Voice Pitch
                  </label>
                  <span className="text-xs font-mono font-bold text-black dark:text-white">{speechPitch.toFixed(1)}</span>
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
                  className="w-full accent-black dark:accent-white bg-[#E5E5E5] dark:bg-[#2A2A2A] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#777777] dark:text-[#888888] mt-1">
                  <span>Lower</span>
                  <span>Balanced</span>
                  <span>Higher</span>
                </div>
              </div>
            </div>

            {/* Quick Phrases in Selected Language */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#777777] dark:text-[#888888] block">
                  Everyday Phrases in {currentLang.nativeName} ({currentLang.name})
                </span>
                <span className="text-xs font-mono text-[#777777] dark:text-[#888888]">
                  Click phrase to speak aloud
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLang.quickPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuickPhrase(phrase)}
                    className="p-4 rounded-xl bg-white dark:bg-[#121212] border border-[#D4D4D4] dark:border-[#262626] hover:border-black dark:hover:border-white text-left text-xs text-black dark:text-white font-medium transition-all flex items-center justify-between group shadow-sm cursor-pointer"
                  >
                    <span>"{phrase}"</span>
                    <Play className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-2 text-black dark:text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 2: MULTILINGUAL TRANSLATOR WORKSPACE                         */}
        {/* ================================================================= */}
        {activeMode === 'translator' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Translation Card */}
            <div className="rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-sm">
              
              {/* Top Bar: Language Selectors & Swap */}
              <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between gap-3 flex-wrap bg-[#FAFAFA] dark:bg-[#161616]">
                {/* Source Language */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#777777] dark:text-[#888888]">
                    From:
                  </span>
                  <select
                    value={fromLang}
                    onChange={(e) => {
                      setFromLang(e.target.value as SupportedLanguageCode);
                      if (sourceText.trim()) {
                        setTimeout(() => handleTranslate(), 50);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-[#D4D4D4] dark:border-[#333333] rounded-lg text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                  >
                    {TEN_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <button
                  type="button"
                  onClick={handleSwapLanguages}
                  className="p-2.5 rounded-full border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-[#F2F2F2] dark:hover:bg-[#252525] transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Swap Languages"
                  aria-label="Swap source and target languages"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>

                {/* Target Language */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#777777] dark:text-[#888888]">
                    To:
                  </span>
                  <select
                    value={toLang}
                    onChange={(e) => {
                      setToLang(e.target.value as SupportedLanguageCode);
                      if (sourceText.trim()) {
                        setTimeout(() => handleTranslate(), 50);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-[#D4D4D4] dark:border-[#333333] rounded-lg text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                  >
                    {TEN_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Two-Pane Editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5] dark:divide-[#262626]">
                {/* Source Input */}
                <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] dark:text-[#888888] mb-2">
                      <span>INPUT ({fromInfo.nativeName})</span>
                      <span>{sourceText.length} chars</span>
                    </div>

                    <textarea
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleTranslate();
                        }
                      }}
                      rows={6}
                      placeholder={`Type or speak text in ${fromInfo.nativeName} (e.g. ${fromInfo.sampleGreeting})...`}
                      className="w-full p-3.5 bg-transparent border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-sm sm:text-base text-black dark:text-white placeholder-[#888888] dark:placeholder-[#666666] focus:outline-none focus:border-black dark:focus:border-white resize-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0F0F0] dark:border-[#1E1E1E] flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {/* Mic Button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E]'
                        }`}
                        title={isListening ? 'Stop listening' : `Speak in ${fromInfo.nativeName}`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                      </button>

                      {/* Listen to Source */}
                      {sourceText && (
                        <button
                          type="button"
                          onClick={handleReadSource}
                          className="p-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Read aloud source text"
                        >
                          {isPlayingSource ? <Square className="w-3.5 h-3.5 fill-current text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isPlayingSource ? 'Stop' : 'Listen'}</span>
                        </button>
                      )}

                      {/* Clear */}
                      {sourceText && (
                        <button
                          type="button"
                          onClick={() => {
                            setSourceText('');
                            setTranslatedText('');
                            setPronunciation(undefined);
                          }}
                          className="p-2 rounded-lg text-[#888888] hover:text-black dark:hover:text-white transition-colors"
                          title="Clear text"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTranslate()}
                      disabled={transLoading || !sourceText.trim()}
                      className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold tracking-wide disabled:opacity-40 hover:bg-[#1C1C1C] dark:hover:bg-[#E5E5E5] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>{transLoading ? 'Translating...' : 'Translate'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Target Output */}
                <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-[#FAFAFA] dark:bg-[#141414]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] dark:text-[#888888] mb-2">
                      <span>TRANSLATION ({toInfo.nativeName})</span>
                      {transLoading && (
                        <span className="flex items-center gap-1 text-black dark:text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          <span>Processing...</span>
                        </span>
                      )}
                    </div>

                    <div className="min-h-[148px] p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-sm sm:text-base font-medium text-black dark:text-white flex flex-col justify-between">
                      {translatedText ? (
                        <div>
                          <p className="leading-relaxed select-all whitespace-pre-wrap">
                            {translatedText}
                          </p>
                          {pronunciation && (
                            <p className="mt-2 text-xs font-mono text-[#777777] dark:text-[#888888] italic">
                              Pronunciation: {pronunciation}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-[#888888] dark:text-[#666666] italic">
                          {transLoading
                            ? 'Translating with HearMe AI Multilingual Engine...'
                            : 'Translation will appear here instantly...'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAEAEA] dark:border-[#222222] flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {/* Listen to Target */}
                      <button
                        type="button"
                        onClick={handleReadTarget}
                        disabled={!translatedText}
                        className="p-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
                        title={`Read aloud in ${toInfo.nativeName}`}
                      >
                        {isPlayingTarget ? <Square className="w-3.5 h-3.5 fill-current text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isPlayingTarget ? 'Stop Audio' : `Listen (${toInfo.shortLabel})`}</span>
                      </button>

                      {/* Copy */}
                      <button
                        type="button"
                        onClick={handleCopyTrans}
                        disabled={!translatedText}
                        className="p-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
                        title="Copy translated text"
                      >
                        {copiedTrans ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTrans ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* View in Sign Language */}
                    <button
                      type="button"
                      onClick={handleOpenInSignExplainer}
                      disabled={!translatedText && !sourceText}
                      className="px-3.5 py-2 rounded-lg border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-[#1E1E1E] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Explain in Indian Sign Language (ISL)"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Explain in Sign (ISL)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {transError && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#1A1111] border border-red-300 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{transError}</span>
              </div>
            )}

            {/* Quick Phrases for Active Source Language */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Everyday Accessibility Phrases ({fromInfo.nativeName})</span>
                </h2>
                <span className="text-[11px] font-mono text-[#777777] dark:text-[#888888]">
                  Click to translate instantly
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {fromInfo.quickPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSourceText(phrase);
                      handleTranslate(phrase);
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-[#D4D4D4] dark:border-[#333333] hover:border-black dark:hover:border-white text-xs font-medium text-black dark:text-white bg-white dark:bg-[#1A1A1A] hover:bg-neutral-50 dark:hover:bg-[#252525] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Translations History */}
            {history.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent Translations ({history.length})</span>
                  </h2>
                  <button
                    onClick={() => setHistory([])}
                    className="text-[11px] font-mono text-[#888888] hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear History</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.map((item) => {
                    const itemFrom = getLanguageInfo(item.fromLang);
                    const itemTo = getLanguageInfo(item.toLang);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setFromLang(item.fromLang);
                          setToLang(item.toLang);
                          setSourceText(item.sourceText);
                          setTranslatedText(item.translatedText);
                        }}
                        className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#161616] hover:border-black dark:hover:border-white transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#777777] dark:text-[#888888]">
                          <span>
                            {itemFrom.flag} {itemFrom.shortLabel} → {itemTo.flag} {itemTo.shortLabel}
                          </span>
                          <span>{item.timestamp}</span>
                        </div>
                        <p className="text-xs font-semibold text-black dark:text-white line-clamp-1">
                          {item.sourceText}
                        </p>
                        <p className="text-xs text-[#555555] dark:text-[#AAAAAA] line-clamp-1 font-medium">
                          {item.translatedText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
